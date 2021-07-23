import {AdapterContent, KeycloakJsonStructure, AdapterDependencies} from "keycloak-lambda-authorizer/dist/src/Options";

import {getSessionToken, SessionTokenKeys} from "../session/SessionManager";
import {IdentityProviders, MultitenantAdapterDependencies, Options, RequestObject, ResponseObject} from "../index";
import {DynamoDbSettings} from "../session/storage/DynamoDB";
import {getCustomPageHandler, getSessionName} from "../utils/KeycloakUtils";
import {initOptions} from "../utils/DefaultPageHandlers";
import {PageHandlers} from "../handlers/PageHandler";
import {StrorageDB} from "../session/storage/Strorage";


export type APIGateWayOptions = {
    multiTenantJson?: (tenant: string) => Promise<KeycloakJsonStructure> | KeycloakJsonStructure;
    multiTenantAdapterOptions?: MultitenantAdapterDependencies;
    defaultAdapterOptions?: AdapterDependencies;
    identityProviders?: IdentityProviders;
    pageHandlers?: PageHandlers;
    storageType: 'InMemoryDB'|'DynamoDB' | StrorageDB,
    storageTypeSettings?: DynamoDbSettings | any
    keys: SessionTokenKeys,
}

export interface ApiGateway {

  /**
   * Generic MiddleWare
   * @param request - http request
   * @param response - http response
   * @param next - if executed then granted request
   */
    middleware(request: RequestObject, response: ResponseObject, next?: any): Promise<void>
}

export class DefaultApiGateway implements ApiGateway {

  options: Options;
  useMultiTenant = false;

  constructor(opts: APIGateWayOptions | Options) {
    this.options = initOptions(opts);
    if (this.options.multiTenantOptions) {
      this.useMultiTenant = true;
    }
  }

  async middleware(request: RequestObject, response: ResponseObject, next?: any): Promise<void> {
    if (!this.options.logout) {
      throw new Error('LogoutObject is undefined');
    }
    if (!this.options.jwks) {
      throw new Error('jwks is undefined');
    }
    if (!this.options.callback) {
      throw new Error('callback is undefined');
    }
    if (!this.options.singleTenantOptions || !this.options.singleTenantOptions.singleTenantAdapter) {
      throw new Error('singleTenantAdapter is undefined');
    }
    const singleTenantAdapter = this.options.singleTenantOptions.singleTenantAdapter;
    if (this.options.logout.isLogout(request)) {
      await this.options.logout.logout(request, response);
      return;
    }
    if (this.options.jwks.isJwksRoute(request)) {
      await this.options.jwks.getPublicKey(request, response);
      return;
    }
    if (this.options.callback.isCallBack(request)) {

      await this.options.callback.callback(request, response);
      return;
    }
    if (this.options.callback.isCallBack(request)) {
      await this.options.callback.callback(request, response);
      return;
    }

    let customPageHandler = await getCustomPageHandler('public',
        request, this.options);
    if (customPageHandler) {
      await customPageHandler.execute(request, response, next, {options: this.options});
      return;
    }

    if (this.options.singleTenantOptions && this.options.singleTenantOptions.singleTenantAdapter) {
      customPageHandler = await getCustomPageHandler('single',
          request, this.options);
      if (customPageHandler) {
        const sessionToken = getSessionToken(request.cookies[getSessionName(this.options)], true);

        await customPageHandler.execute(request, response, next, {sessionToken, options: this.options});
        return;
      }
    }

    if (this.useMultiTenant) {
      if (!this.options.multiTenantOptions || !this.options.multiTenantOptions.multiTenantAdapter) {
        throw new Error('multiTenantOptions does not defined');
      }
      customPageHandler = await getCustomPageHandler('multi-tenant',
          request, this.options);
      if (customPageHandler) {
        const sessionToken = getSessionToken(request.cookies[getSessionName(this.options)], true);
        await customPageHandler.execute(request, response, next, {sessionToken, options: this.options});
        return;
      }

      const multiTenantAdapter = this.options.multiTenantOptions.multiTenantAdapter;
      if (await multiTenantAdapter.isMultiTenant(request)) {
        await multiTenantAdapter.tenant(request, response, next);
        return;
      }
    }

    if (this.options.singleTenantOptions.defaultAdapterOptions) {
      await singleTenantAdapter.singleTenant(request, response, next);
    } else {
      throw new Error("Single tenant configuration does not defined");
    }


  }
}
