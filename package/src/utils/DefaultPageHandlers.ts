import {
    Options,
} from "../index";
import {DefaultSessionManager} from "../session/SessionManager";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {Logout} from "../logout/Logout";
import {DefaultJWKS} from "../jwks/JWKS";
import {DefaultCallback} from "../callback/Callback";
import {DefaultTenantAdapter} from "../tenant/TenantAdapter";
import {DefaultMultiTenantAdapter} from "../multitenants/Multi-tenant-adapter";
import {TenantInternalPage} from "../handlers/TenantInternalPage";
import {PublicUrlPageHandler} from "../handlers/PublicUrlPageHandler";
import {TokenPageHandler} from "../handlers/TokenPageHandler";
import {SingleTenantUrlPageHandler} from "../handlers/SingleTenantUrlPageHandler";

/**
 * default Page Handler
 */
export const defaultPageHandlers = [
  new TenantInternalPage('/tenants', 35000),
  new PublicUrlPageHandler('(.*)(/public)(.*)', 10000),
  new PublicUrlPageHandler('(.*)(.(jpg|jpeg|png|gif|bmp))', 10000),
  new PublicUrlPageHandler('(.*)(.(ico|tiff))', 10000),
  new PublicUrlPageHandler('(.*)(.(css))', 10000),
  new TokenPageHandler("/token"),
  new SingleTenantUrlPageHandler("/", 0),
  new SingleTenantUrlPageHandler("/index.html", 32000),
];

function transform(opts: APIGateWayOptions): Options {
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

export function initOptions(opts: APIGateWayOptions | Options): Options {
  const options = (<any>opts).session ? <Options>opts : transform(<APIGateWayOptions>opts);
  if (!options.logout) {
    options.logout = new Logout(options);
  }
  if (!options.jwks) {
    options.jwks = new DefaultJWKS(options);
  }
  if (!options.session.sessionManager) {
    options.session.sessionManager = new DefaultSessionManager(options);
  }
  if (!options.callback) {
    options.callback = new DefaultCallback(options);
  }
  if (!options.singleTenantAdapter) {
    options.singleTenantAdapter = new DefaultTenantAdapter(options);
  }
  if (options.multiTenantOptions) {
    if (!options.multiTenantOptions.multiTenantAdapter) {
      options.multiTenantOptions.multiTenantAdapter = new DefaultMultiTenantAdapter(options);
    }
  }
  if (!options.pageHandlers || options.pageHandlers.length === 0) {
    options.pageHandlers = defaultPageHandlers;
  }
  return options;
}
