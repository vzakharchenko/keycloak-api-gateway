import {v4} from 'uuid';

import {Options, RequestObject, ResponseObject} from "../index";
import {getSessionToken, SessionToken} from "../session/SessionManager";
import {
  getCurrentHost,
  getSessionName,
  KeycloakState,
} from "../utils/KeycloakUtils";

const {getKeycloakUrl} = require('keycloak-lambda-authorizer/src/utils/restCalls');
const {adapter} = require('keycloak-lambda-authorizer/src/keycloakAuthorizer');
const {keycloakRefreshToken} = require('keycloak-lambda-authorizer/src/clientAuthorization');
const {commonOptions} = require('keycloak-lambda-authorizer/src/utils/optionsUtils');

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
   */
    tenant(req: RequestObject, res: ResponseObject, next: any): Promise<any>
}

export class DefaultMultiTenantAdapter implements MultiTenantAdapter {
  readonly options: Options;

  constructor(options: Options) {
    this.options = options;
    if (!options.multiTenantOptions) {
      throw new Error('multiTenantOptions is not defined');
    }
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

  async tenantCheckToken(res: ResponseObject, sessionToken: SessionToken, tok: any): Promise<any> {

    if (!this.options.multiTenantOptions || !sessionToken.tenant) {
      throw new Error('multiTenantOptions or tenant does not defined');
    }
    if (!this.options.session.sessionManager) {
      throw new Error('sessionManager does not defined');
    }
    const tenantRealmJson = await this.options.multiTenantOptions.multiTenantJson(sessionToken.tenant);
    const token = await this.options.session.sessionManager.getSessionAccessToken(sessionToken);
    if (token) {
      let returnToken;
      const tenantOptions = commonOptions(
          this.options.multiTenantOptions.multiTenantAdapterOptions,
        tenantRealmJson,
      );
      try {

        await adapter(tok.token, tenantOptions.keycloakJson,
                    tenantOptions);
        return token;
      } catch (e) {
        returnToken = await keycloakRefreshToken(token, tenantOptions);
        await this.options.session.sessionManager.updateSession(
                    sessionToken.jti, sessionToken.email, returnToken,
                );
      }
      return returnToken;
    }
    throw new Error('token does not exists in storage');
  }

  async tenant(req: RequestObject, res: ResponseObject, next: any): Promise<any> {

    const sessionToken = getSessionToken(req.cookies[getSessionName(this.options)], true);
    if (sessionToken) {
      try {
        if (!this.options.session.sessionManager) {
          throw new Error('sessionManager is not defined');
        }
        const accessToken = await this.options.session.sessionManager.getSessionAccessToken(sessionToken);
        const tok = getSessionToken(accessToken.access_token, true);
        const token = await this.tenantCheckToken(res, sessionToken, tok);
        return token;
      } catch (e) {
                    // eslint-disable-next-line no-console
        console.log(`Error: ${e}`);
        await this.redirectTenantLogin(req, res, <string>sessionToken.tenant, '/');
      }
    } else {
                // eslint-disable-next-line no-console
      console.log('error: session is null');
      res.redirect(302, '/');
    }
    return null;
  }

}
