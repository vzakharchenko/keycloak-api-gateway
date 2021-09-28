import KeycloakAdapter from "keycloak-lambda-authorizer";
import {SecurityAdapter} from "keycloak-lambda-authorizer/dist/src/adapters/SecurityAdapter";
import {EnforcerFunction, RefreshContext, TokenJson, updateOptions} from "keycloak-lambda-authorizer/dist/src/Options";
import {getKeycloakUrl} from "keycloak-lambda-authorizer/dist/src/utils/KeycloakUtils";

import {getCurrentHost, getSessionName, KeycloakState} from "../utils/KeycloakUtils";
import {getSessionToken, SessionToken} from "../session/SessionManager";
import {Options, RequestObject, ResponseObject} from "../index";

/**
 * single tenant adapter
 */
export interface TenantAdapter {

    /**
     * adapter for tenant
     * @param req http request
     * @param res http response
     * @param next allow request
     * @param enforcer Authorization
     */
    singleTenant(req: RequestObject, res: ResponseObject, next: any, enforcer?: EnforcerFunction): Promise<any>

    /**
     * If needed authentication redirect to Tenant login page
     * @param req http request
     * @param res  http response
     * @param realm  tenant name
     * @param redirectUrl where to return after logging in
     */
    redirectTenantLogin(req: RequestObject, res: ResponseObject): Promise<void>
}

export class DefaultTenantAdapter implements TenantAdapter {
  options: Options;
  securityAdapter:SecurityAdapter|null=null;

  constructor(options: Options) {
    this.options = options;
  }

  async tenantCheckToken(req:RequestObject, res: ResponseObject, sessionToken: SessionToken, tok: any, enforcer?: EnforcerFunction): Promise<TokenJson|null> {
    if (!this.options.singleTenantOptions) {
      throw new Error('singleTenantOptions is not defined');
    }

    if (!this.options.session.sessionManager) {
      throw new Error('sessionManager does not defined');
    }
    const token = await this.options.session.sessionManager.getSessionAccessToken(sessionToken);
    if (token) {
      let returnToken:TokenJson|null = null;
      if (!this.securityAdapter) {
        this.securityAdapter = new KeycloakAdapter(this.options.singleTenantOptions.defaultAdapterOptions)
            .getDefaultAdapter();
      }
      try {
        await this.securityAdapter.validate(tok.token, enforcer);
        return token;
      } catch (e:any) {
        const refreshContext:RefreshContext|null = await this.securityAdapter.refreshToken({request: req, token});
        if (refreshContext) {
          returnToken = refreshContext.token;
          await this.options.session.sessionManager.updateSession(
             sessionToken.jti, sessionToken.email, returnToken,
         );
        }

      }
      return returnToken;
    }
    throw new Error('token does not exists in storage');
  }


  async singleTenant(req: RequestObject, res: ResponseObject, next: any, enforcer?: EnforcerFunction): Promise<any> {
    if (!this.options.session.sessionManager) {
      throw new Error('sessionManager does not provided');
    }
    const sessionManager = this.options.session.sessionManager;
    const sessionToken = getSessionToken(req.cookies[getSessionName(this.options)], true);
    if (!sessionToken) {
      await this.redirectTenantLogin(req, res);
      return null;
    }
    try {
      const tok = await sessionManager.getSessionAccessToken(sessionToken);
      const token = await this.tenantCheckToken(req, res, sessionToken, tok, enforcer);
      return token;
    } catch (e:any) {
      await sessionManager.deleteSession(sessionToken.jti);
            // eslint-disable-next-line no-console
      console.log(`Error: ${e}`);
      res.cookie(getSessionName(this.options), "");
      await this.options.logout?.logout(req, res);
      await this.redirectTenantLogin(req, res);
    }
    return null;
  }

  async redirectTenantLogin(req: RequestObject, res: ResponseObject): Promise<void> {
    if (!this.options.singleTenantOptions) {
      throw new Error('singleTenantOptions is not defined');
    }
    const adapterContent = updateOptions(this.options.singleTenantOptions.defaultAdapterOptions);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const keycloakJson = await adapterContent.keycloakJson(adapterContent, {
      request: req,
    });
    const keycloakState: KeycloakState = {
      multiFlag: false,
      url: '/',
      tenant: keycloakJson.realm,
    };
    // eslint-disable-next-line babel/camelcase
    const kc_idp_hint = req.query.kc_idp_hint || this.options.singleTenantOptions.idp;
    // eslint-disable-next-line babel/camelcase
    res.redirect(302, `${getKeycloakUrl(keycloakJson)}/realms/${keycloakJson.realm}/protocol/openid-connect/auth?client_id=${keycloakJson.resource}&redirect_uri=${getCurrentHost(req)}/callbacks/${keycloakJson.realm}/${keycloakJson.resource}/callback&state=${encodeURIComponent(JSON.stringify(keycloakState))}&response_type=code&nonce=1&scope=openid${kc_idp_hint ? `&kc_idp_hint=${kc_idp_hint}` : ''}`);
  }

}

