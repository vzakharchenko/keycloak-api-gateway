import {getCurrentHost, getSessionName} from "../utils/KeycloakUtils";
import {Options, RequestObject, ResponseObject} from "../index";
import {getSessionToken} from "../session/SessionManager";

const {getKeycloakUrl} = require('keycloak-lambda-authorizer/dist/src/utils/KeycloakUtils');

export interface Logout {
  isLogout(request: RequestObject):boolean;
  redirectDefaultLogout(req:RequestObject, res:ResponseObject):Promise<void>|void
  redirectTenantLogout(req:RequestObject, res:ResponseObject, tenantName:string):Promise<void>|void
  logout(request: RequestObject, res: ResponseObject):Promise<void>|void
}

export class DefaultLogout implements Logout {

  private options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  isLogout(request: RequestObject) {
    return (request.baseUrl || request.originalUrl).startsWith('/logout');
  }

  async redirectDefaultLogout(req:RequestObject, res:ResponseObject) {
    if (!this.options.singleTenantOptions) {
      throw new Error('singleTenantOptions does not defined');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const keycloakJson = await this.options.singleTenantOptions.defaultAdapterOptions.keycloakJson(this.options.singleTenantOptions.defaultAdapterOptions, {
      request: req,
      token: null,
    });
    res.redirect(302, `${getKeycloakUrl(keycloakJson)}/realms/${keycloakJson.realm}/protocol/openid-connect/logout?redirect_uri=${getCurrentHost(req)}/`);
  }

  async redirectTenantLogout(req:RequestObject, res:ResponseObject, tenantName:string) {
    const keycloakJson = await this.options.multiTenantOptions?.multiTenantJson(tenantName);
    res.redirect(302, `${getKeycloakUrl(keycloakJson)}/realms/${tenantName}/protocol/openid-connect/logout?redirect_uri=${getCurrentHost(req)}/tenants/${tenantName}`);
  }

  async logout(request: RequestObject, res: ResponseObject): Promise<void> {
    const sessionCookieName = getSessionName(this.options);
    const sessionToken = getSessionToken(request
                .cookies[sessionCookieName],
            true);
    res.cookie(sessionCookieName, '', {expires: new Date(2671200000)});
    if (!sessionToken) {
            // default tenant entrypoint
      if (!this.options.singleTenantOptions) {
        throw new Error('singleTenantOptions does not defined');
      }
      await this.options.singleTenantOptions.singleTenantAdapter?.redirectTenantLogin(request, res);
    } else if (sessionToken.tenant) {
            // MultiTenant User
      await this.redirectTenantLogout(request, res, sessionToken.tenant);
    } else {
            //  default tenant logout
      await this.redirectDefaultLogout(request, res);
    }
  }
}
