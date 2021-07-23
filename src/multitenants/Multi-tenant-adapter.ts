import {v4} from 'uuid';
import {getKeycloakUrl} from "keycloak-lambda-authorizer/dist/src/utils/KeycloakUtils";
import {SecurityAdapter} from "keycloak-lambda-authorizer/dist/src/adapters/SecurityAdapter";
import KeycloakAdapter from "keycloak-lambda-authorizer";
import {
  AdapterContent,
  EnforcerFunction,
  RequestContent,
  TokenJson,
  AdapterDependencies,
  updateOptions,
} from "keycloak-lambda-authorizer/dist/src/Options";
import {decodeToken} from "keycloak-lambda-authorizer/dist/src/utils/TokenUtils";

import {
  getCurrentHost,
  getSessionName,
  KeycloakState,
} from "../utils/KeycloakUtils";
import {getSessionToken, SessionToken} from "../session/SessionManager";
import {Options, RequestObject, ResponseObject} from "../index";


/**
 * Multi-Tenant Adapter
 */
export interface MultiTenantAdapter {

  /**
   * Check current configuration support multi-tenancy
   * @param req http Request
   */
    isMultiTenant(req: RequestObject): Promise<boolean>;

  /**
   * If needed authentification redirect to Tenant login page
   * @param req http request
   * @param res  http response
   * @param realm  tenant name
   * @param redirectUrl where to return after logging in
   */
    redirectTenantLogin(req: RequestObject, res: ResponseObject,
                        realm: string, redirectUrl: string): Promise<void>

  /**
   * adapter for specific tenant
   * @param req http request
   * @param res http response
   * @param next allow request
   * @param enforcer Authorization
   */
    tenant(req: RequestObject, res: ResponseObject, next: any, enforcer?: EnforcerFunction): Promise<any>
}

export class DefaultMultiTenantAdapter implements MultiTenantAdapter {
  readonly options: Options;
  securityAdapter:SecurityAdapter;

  constructor(options: Options) {
    this.options = options;
    if (!options.multiTenantOptions) {
      throw new Error('multiTenantOptions is not defined');
    }
    const options1 = {
      ...options.multiTenantOptions.multiTenantAdapterOptions,
      ...{keycloakJson: async (opt: AdapterContent, requestContent: RequestContent) => {
          // eslint-disable-next-line  @typescript-eslint/ban-ts-comment
      // @ts-ignore
          // eslint-disable-next-line  no-return-await
        return await this.options.multiTenantOptions.multiTenantJson(requestContent.realm);
      }}};
    this.securityAdapter = new KeycloakAdapter(<AdapterDependencies> options1).getDefaultAdapter();
  }

  async isMultiTenant(req: RequestObject): Promise<boolean> {
    const sessionToken = getSessionToken(
            req.cookies[getSessionName(this.options)], true,
);
    return (sessionToken != null && sessionToken.multiFlag);
  }

  async redirectTenantLogin(req: RequestObject, res: ResponseObject,
                              realm: string, redirectUrl: string) {
    if (!this.options.multiTenantOptions) {
      throw new Error('multiTenantOptions is not defined');
    }
    const tenantRealmJson: any = this.options.multiTenantOptions.multiTenantJson(realm);
    // eslint-disable-next-line babel/camelcase
    const kc_idp_hint = req.query.kc_idp_hint || this.options.multiTenantOptions.idp;
    // eslint-disable-next-line babel/camelcase
    const tenantHint = kc_idp_hint ? `&kc_idp_hint=${kc_idp_hint}` : '';
    const keycloakState: KeycloakState = {
      multiFlag: true,
      url: redirectUrl || '/',
      tenant: realm,
    };
    res.redirect(302, `${getKeycloakUrl(tenantRealmJson)}/realms/${tenantRealmJson.realm}/protocol/openid-connect/auth?client_id=${tenantRealmJson.resource}&redirect_uri=${getCurrentHost(req)}/callbacks/${tenantRealmJson.realm}/${tenantRealmJson.resource}/callback&&state=${encodeURIComponent(JSON.stringify(keycloakState))}&response_type=code&nonce=${v4()}${tenantHint}`);
  }

  async tenantCheckToken(req: RequestObject, res: ResponseObject, sessionToken: SessionToken, enforcerFunc?: EnforcerFunction): Promise<any> {

    if (!this.options.multiTenantOptions || !sessionToken.tenant) {
      throw new Error('multiTenantOptions or tenant does not defined');
    }
    if (!this.options.session.sessionManager) {
      throw new Error('sessionManager does not defined');
    }
    const token = await this.options.session.sessionManager.getSessionAccessToken(sessionToken);
    if (token) {
      let returnToken;
      try {
        const jwtToken = decodeToken(token.access_token);
        await this.securityAdapter.validate({
          request: req,
          realm: sessionToken.tenant,
          token: jwtToken,
          tokenString: token.access_token,
        }, enforcerFunc);
        return token;
      } catch (e) {
        returnToken = await this.securityAdapter.refreshToken({
          realm: sessionToken.tenant,
          token,
          request: req,
        }, enforcerFunc);
        if (returnToken) {
          await this.options.session.sessionManager.updateSession(
              sessionToken.jti, sessionToken.email, returnToken.token,
          );
        }
      }
      return returnToken;
    }
    throw new Error('token does not exists in storage');
  }

  async tenant(req: RequestObject, res: ResponseObject, next: any, enforcerFunc?: EnforcerFunction): Promise<any> {

    const sessionToken = getSessionToken(req.cookies[getSessionName(this.options)], true);
    const sessionManager = this.options.session.sessionManager;
    if (!sessionManager) {
      throw new Error('sessionManager is not defined');
    }
    if (sessionToken) {
      try {
        const tokens = await sessionManager.getSessionAccessToken(sessionToken);
        if (!tokens) {
          throw new Error('tokens are empty');
        }
        const token = await this.tenantCheckToken(req, res, sessionToken, enforcerFunc);
        return token;
      } catch (e) {
        await sessionManager.deleteSession(sessionToken.jti);
                    // eslint-disable-next-line no-console
        console.log(`Error: ${e}`);
        res.cookie(getSessionName(this.options), "");
        await this.options.logout?.redirectTenantLogout(req, res, <string>sessionToken.tenant);
        return null;
      }
    } else {
                // eslint-disable-next-line no-console
      console.log('error: session is null');
      res.redirect(302, '/');
    }
    return null;
  }

}
