import {Options, RequestObject, ResponseObject} from "../index";
import {getSessionToken, SessionToken} from "../session/SessionManager";
import {getCurrentHost, getKeycloakJsonFunction, getSessionName, KeycloakState} from "../utils/KeycloakUtils";

const {getKeycloakUrl} = require('keycloak-lambda-authorizer/src/utils/restCalls');
const {awsAdapter} = require('keycloak-lambda-authorizer/src/apigateway/apigateway');
const {keycloakRefreshToken} = require('keycloak-lambda-authorizer/src/clientAuthorization');

/**
 * single tenant adapter
 */
export interface TenantAdapter {

    /**
     * adapter for tenant
     * @param req http request
     * @param res http response
     * @param next allow request
     */
    singleTenant(req: RequestObject, res: ResponseObject, next: any): Promise<any>

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

  constructor(options: Options) {
    this.options = options;
  }

  async tenantCheckToken(res: ResponseObject, sessionToken: SessionToken, tok: any): Promise<any> {
    if (!this.options.singleTenantOptions) {
      throw new Error('singleTenantOptions is not defined');
    }
    if (!this.options.singleTenantOptions.singleTenantAdapter) {
      throw new Error('singleTenantAdapter does not defined');
    }
    if (!this.options.session.sessionManager) {
      throw new Error('sessionManager does not defined');
    }
    const tenantRealmJson = await getKeycloakJsonFunction(this.options.singleTenantOptions.defaultAdapterOptions.keycloakJson);
    const token = await this.options.session.sessionManager.getSessionAccessToken(sessionToken);
    if (token) {
      let returnToken;
      const tenantOptions = {
        ...this.options.singleTenantOptions.defaultAdapterOptions,
        ...{keycloakJson: () => tenantRealmJson},
      };
      try {
        await awsAdapter.adapter(tok.token,
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


  async singleTenant(req: RequestObject, res: ResponseObject, next: any): Promise<any> {
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
      const token = await this.tenantCheckToken(res, sessionToken, tok);
      return token;
    } catch (e) {
            // eslint-disable-next-line no-console
      console.log(`Error: ${e}`);
      await this.redirectTenantLogin(req, res);
    }
    return null;
  }

  async redirectTenantLogin(req: RequestObject, res: ResponseObject): Promise<void> {
    if (!this.options.singleTenantOptions) {
      throw new Error('singleTenantOptions is not defined');
    }
    const keycloakJson = await getKeycloakJsonFunction(this.options.singleTenantOptions.defaultAdapterOptions.keycloakJson);
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

