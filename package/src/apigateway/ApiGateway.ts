import {DefaultSessionManager, SessionTokenKeys} from "../session/SessionManager";
import {Logout} from "../logout/Logout";
import {DefaultJWKS} from "../jwks/JWKS";
import {DefaultCallback} from "../callback/Callback";
import {DefaultMultiTenantAdapter} from "../multitenants/Multi-tenant-adapter";
import {DefaultTenantAdapter} from "../tenant/TenantAdapter";
import {Options, PageHandlers, RequestObject, ResponseObject} from "../index";
import {DynamoDbSettings} from "../session/storage/DynamoDB";
import {isProtectedByAccessLevel} from "../utils/KeycloakUtils";
import {PublicUrlPageHandler, TokenPageHandler} from "../utils/DefaultPageHandlers";


export type APIGateWayOptions = {
    multiTenantJson?: (tenant: string) => Promise<any> | any;
    // eslint-disable-next-line no-warning-comments, line-comment-position
    multiTenantAdapterOptions?: any; // todo
    // eslint-disable-next-line no-warning-comments, line-comment-position
    defaultAdapterOptions?: any; // todo
    pageHandlers?: PageHandlers;
    storageType: string,
    storageTypeSettings?: DynamoDbSettings | any
    keys: SessionTokenKeys,
}

export interface ApiGateway {
    middleware(request: RequestObject, response: ResponseObject, next?: any): Promise<void>
}

export class DefaultApiGateway implements ApiGateway {

  options: Options;
  useMultiTenant = false;

  constructor(opts: APIGateWayOptions | Options) {

    this.options = (<any>opts).session ? <Options>opts : this.transform(<APIGateWayOptions>opts);
    if (!this.options.logout) {
      this.options.logout = new Logout(this.options);
    }
    if (!this.options.jwks) {
      this.options.jwks = new DefaultJWKS(this.options);
    }
    if (!this.options.session.sessionManager) {
      this.options.session.sessionManager = new DefaultSessionManager(this.options);
    }
    if (!this.options.callback) {
      this.options.callback = new DefaultCallback(this.options);
    }
    if (!this.options.singleTenantAdapter) {
      this.options.singleTenantAdapter = new DefaultTenantAdapter(this.options);
    }
    if (this.options.defaultAdapterOptions) {
      if (this.options.multiTenantOptions) {
        if (!this.options.multiTenantOptions.multiTenantAdapter) {
          this.options.multiTenantOptions.multiTenantAdapter = new DefaultMultiTenantAdapter(this.options);
        }
        this.useMultiTenant = true;
      }
    }
    if (!this.options.pageHandlers || this.options.pageHandlers.length === 0) {
      this.options.pageHandlers = [
        new PublicUrlPageHandler('(.*)(/public)(.*)'),
        new PublicUrlPageHandler('(.*)(.(jpg|jpeg|png|gif|bmp))'),
        new PublicUrlPageHandler('(.*)(.(ico|tiff))'),
        new PublicUrlPageHandler('(.*)(.(css))'),
        new TokenPageHandler("/multi-token", 'multi-tenant'),
        new TokenPageHandler("/token", 'single'),
      ];
    }
  }

  transform(opts: APIGateWayOptions): Options {
    const options: Options = {
      session: {
        sessionConfiguration: {
          storageType: opts.storageType,
          storageTypeSettings: opts.storageTypeSettings,
          keys: opts.keys,
        },
      },
      defaultAdapterOptions: opts.defaultAdapterOptions,
      pageHandlers: opts.pageHandlers,
    };
    if (opts.multiTenantAdapterOptions && opts.multiTenantJson) {
      options.multiTenantOptions = {
        multiTenantJson: opts.multiTenantJson,
        multiTenantAdapterOptions: opts.multiTenantAdapterOptions,
      };
    }
    return options;
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
    const singleTenantAdapter = this.options.singleTenantAdapter;
    if (!singleTenantAdapter) {
      throw new Error('singleTenantAdapter is undefined');
    }
    if (this.options.logout.isLogout(request)) {
      await this.options.logout.logout(request, response);
      return;
    }
    if (this.options.jwks.isJwksRoute(request)) {
      await this.options.jwks.jwks(request, response);
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
    if (isProtectedByAccessLevel('public', request, this.options)) {
      next();
      return;
    }
    if (isProtectedByAccessLevel('single', request, this.options)) {
      await singleTenantAdapter.singleTenant(request, response, next);
      return;
    }
    if (this.useMultiTenant) {
      if (!this.options.multiTenantOptions || !this.options.multiTenantOptions.multiTenantAdapter) {
        throw new Error('multiTenantOptions does not defined');
      }
      const multiTenantAdapter = this.options.multiTenantOptions.multiTenantAdapter;
      if (await multiTenantAdapter.isMultiTenant(request)) {
        await multiTenantAdapter.tenant(request, response, next);
      } else {
        await singleTenantAdapter.singleTenant(request, response, next);
      }
    } else {
      await singleTenantAdapter.singleTenant(request, response, next);
    }
  }
}
