import {v4} from 'uuid';

import {Options, RequestObject, ResponseObject} from "../index";
import {getSessionToken, SessionToken} from "../session/SessionManager";
import {getCurrentHost, getSessionName, KeycloakState} from "../utils/KeycloakUtils";

import {DefaultTenant, Tenant} from "./Tenant";

const {getKeycloakUrl} = require('keycloak-lambda-authorizer/src/utils/restCalls');
const {awsAdapter} = require('keycloak-lambda-authorizer/src/apigateway/apigateway');
const {keycloakRefreshToken} = require('keycloak-lambda-authorizer/src/clientAuthorization');

const manufacturerRoute = new RegExp(
    '(^)(\\/|)(/tenants/(.*))(/$|(\\?|$))',
    'g',
);

export interface MultiTenantSelectorType {
    isTenantRoute(req: RequestObject, opts: Options): Promise<boolean> | boolean;

    getTenantName(req: RequestObject, opts: Options): Promise<string> | string;
}

export class PathTenantSelectorType implements MultiTenantSelectorType {

  getTenantName(req: RequestObject): string {
    const parts = (req.baseUrl || req.originalUrl).split('/');
    return parts[2];
  }

  isTenantRoute(req: RequestObject, opts: Options): boolean {
    return Boolean((req.baseUrl || req.originalUrl).match(manufacturerRoute));
  }
}

export class HeaderTenantSelectorType implements MultiTenantSelectorType {


  getTenantName(req: RequestObject, opts: Options): string {
    if (!opts.multiTenantOptions ||
            !opts.multiTenantOptions.multiTenantSelectorOptions ||
            !opts.multiTenantOptions.multiTenantSelectorOptions.headerName
        ) {
      throw new Error('Header Name is not defined');
    }
    return req.headers[opts.multiTenantOptions.multiTenantSelectorOptions.headerName];
  }

  isTenantRoute(req: RequestObject, opts: Options): boolean {
    return Boolean(this.getTenantName(req, opts));
  }
}

export interface MultiTenantAdapter {
    isTenantRoute(req: RequestObject): Promise<boolean>;

    redirectTenantLogin(req: RequestObject, res: ResponseObject,
                        realm: string, redirectUrl: string): Promise<void>

    tenant(req: RequestObject, res: ResponseObject, next: any): Promise<any>
}

export class DefaultMultiTenantAdapter implements MultiTenantAdapter {
  private options: Options;
  private tenantToken: Tenant;

  constructor(options: Options) {
    this.options = options;
    if (!options.multiTenantOptions) {
      throw new Error('multiTenantOptions is not defined');
    }
    this.tenantToken = new DefaultTenant();
  }

  async isTenantRoute(req: RequestObject): Promise<boolean> {
    if (!this.options.multiTenantOptions ||
            !this.options.multiTenantOptions.multiTenantSelectorType) {
      throw new Error('multiTenantOptions is not defined');
    }
        // eslint-disable-next-line no-return-await
    return await this.options.multiTenantOptions
      .multiTenantSelectorType.isTenantRoute(req, this.options);
  }

  async getTenantName(req: RequestObject): Promise<string> {
    if (!this.options.multiTenantOptions ||
            !this.options.multiTenantOptions.multiTenantSelectorType) {
      throw new Error('multiTenantOptions is not defined');
    }
        // eslint-disable-next-line no-return-await
    return await this.options.multiTenantOptions
      .multiTenantSelectorType.getTenantName(req, this.options);
  }

  async redirectTenantLogin(req: RequestObject, res: ResponseObject,
                              realm: string, redirectUrl: string) {
    if (!this.options.multiTenantOptions ||
            !this.options.multiTenantOptions.multiTenantSelectorType) {
      throw new Error('multiTenantOptions is not defined');
    }
    const tenantRealmJson: any = this.options.multiTenantOptions.multiTenantJson(realm);
//     const sessionToken = getSessionToken(
//             req.cookies[this.options.session.sessionConfiguration.sessionCookieName],
//             true,
// );
    const tenantHint = tenantRealmJson.kc_idp_hint ? `&kc_idp_hint=${tenantRealmJson.kc_idp_hint}` : '';
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
      const tenantOptions = {
        ...this.options.multiTenantOptions.multiTenantAdapterOptions,
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

  async tenant(req: RequestObject, res: ResponseObject, next: any): Promise<any> {
    const {redirectUrl} = req.query;
    if (await this.isTenantRoute(req)) {
      const realm = await this.getTenantName(req);
      const redUrl = redirectUrl || '/';
      await this.redirectTenantLogin(req, res, realm, redUrl);
    } else {
      const sessionToken = getSessionToken(req.cookies[getSessionName(this.options)], true);
      if (sessionToken) {
        try {
          if (!this.options.session.sessionManager) {
            throw new Error('sessionManager is not defined');
          }
          const accessToken = await this.options.session.sessionManager.getSessionAccessToken(sessionToken);
          const tok = getSessionToken(accessToken.access_token, true);
          const token = await this.tenantCheckToken(res, sessionToken, tok);
                    // get Access token
          if (await this.tenantToken.isToken(req)) {
            await this.tenantToken.getActiveToken(req, res, token);
            return;
          }
                    // success Tenant login
          next();
        } catch (e) {
                    // eslint-disable-next-line no-console
          console.log(`Error: ${e}`);
          await this.redirectTenantLogin(req, res, await this.getTenantName(req), '/');
        }
      } else {
                // eslint-disable-next-line no-console
        console.log('error: vc is null');
        res.redirect(302, '/');
      }
    }
  }

}
