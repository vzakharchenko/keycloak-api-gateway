import {Options, RequestObject, ResponseObject} from "../index";
import {getSessionToken, SessionToken} from "../session/SessionManager";
import {
  getCurrentHost,
  getCustomPageHandler,
  getKeycloakJsonFunction,
  getSessionName,
  KeycloakState,
} from "../utils/KeycloakUtils";

const {getKeycloakUrl} = require('keycloak-lambda-authorizer/src/utils/restCalls');
const {awsAdapter} = require('keycloak-lambda-authorizer/src/apigateway/apigateway');
const {keycloakRefreshToken} = require('keycloak-lambda-authorizer/src/clientAuthorization');

export interface TenantAdapter {
    singleTenant(req: RequestObject, res: ResponseObject, next: any): Promise<any>
    redirectTenantLogin(req: RequestObject, res: ResponseObject): Promise<void>
}

export class DefaultTenantAdapter implements TenantAdapter {
  options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  async tenantCheckToken(res: ResponseObject, sessionToken: SessionToken, tok: any): Promise<any> {

    if (!this.options.singleTenantAdapter) {
      throw new Error('singleTenantAdapter does not defined');
    }
    if (!this.options.session.sessionManager) {
      throw new Error('sessionManager does not defined');
    }
    const tenantRealmJson = await getKeycloakJsonFunction(this.options.defaultAdapterOptions.keycloakJson);
    const token = await this.options.session.sessionManager.getSessionAccessToken(sessionToken);
    if (token) {
      let returnToken;
      const tenantOptions = {
        ...this.options.defaultAdapterOptions,
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
      return;
    }
    try {
      const tok = await sessionManager.getSessionAccessToken(sessionToken);
      const token = await this.tenantCheckToken(res, sessionToken, tok);
      const customPageHandler = await getCustomPageHandler('single',
          req, this.options);
      if (customPageHandler) {
        await customPageHandler.execute(token, req, res, next);
      } else {
        next();
      }
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`Error: ${e}`);
      await this.redirectTenantLogin(req, res);
    }

  }

  async redirectTenantLogin(req: RequestObject, res: ResponseObject): Promise<void> {
    const keycloakJson = await getKeycloakJsonFunction(this.options.defaultAdapterOptions.keycloakJson);
    const keycloakState: KeycloakState = {
      multiFlag: false,
      url: '/',
      tenant: keycloakJson.realm,
    };
    res.redirect(302, `${getKeycloakUrl(keycloakJson)}/realms/${keycloakJson.realm}/protocol/openid-connect/auth?client_id=${keycloakJson.resource}&redirect_uri=${getCurrentHost(req)}/callbacks/${keycloakJson.realm}/${keycloakJson.resource}/callback&state=${encodeURIComponent(JSON.stringify(keycloakState))}&response_type=code&nonce=1&scope=openid${keycloakJson.kc_idp_hint ? `&kc_idp_hint=${keycloakJson.kc_idp_hint}` : ''}`);
  }

}

