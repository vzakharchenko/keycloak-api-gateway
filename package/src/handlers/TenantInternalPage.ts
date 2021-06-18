import {
    AccessLevel,
    RequestObject,
    ResponseObject,
} from "../index";

import {BehaviorContext, CustomPageHandlerContext, PageHandler} from "./PageHandler";

/**
 * Tenant selector by Url Path
 *   new TenantInternalPage('/tenants', 35000),
 *
 *  if open /tenants/<REALM NAME> then redirect to <REALM NAME> login page
 *
 *   if open /tenants/tenant1 then redirect to tenant1 login page
 */
export class TenantInternalPage implements PageHandler {
  readonly url: string;
  readonly orderValue: number | undefined;

  constructor(url: string,
                orderValue?: number) {
    this.url = url;
    this.orderValue = orderValue;
  }

  getUrl() {
    return this.url;
  }

  order() {
    return this.orderValue || 0;
  }

  behavior(req: RequestObject, context: BehaviorContext): AccessLevel {
    return 'public';
  }

  getTenantName(req: RequestObject): string {
    const url = req.baseUrl || req.originalUrl;
    const indexOf = url.lastIndexOf('?');
    const parts = url.substr(0, indexOf > 0 ? indexOf : undefined).split('/');
    return parts[parts.length - 1];
  }

  async execute(
        req: RequestObject,
        res: ResponseObject,
        next: any,
        context: CustomPageHandlerContext,
    ) {
    if (!context.options.multiTenantOptions || !context.options.multiTenantOptions.multiTenantAdapter) {
      throw new Error('multiTenantOptions does not defined');
    }
    const multiTenantAdapter = context.options.multiTenantOptions.multiTenantAdapter;
    const realm = this.getTenantName(req);
    const redUrl = req.query.redirectUri || '/';
    await multiTenantAdapter.redirectTenantLogin(req, res, realm, redUrl);
  }
}
