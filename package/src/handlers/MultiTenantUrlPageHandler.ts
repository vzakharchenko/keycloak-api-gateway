import {
    AccessLevel,
    RequestObject,
    ResponseObject,
} from "../index";

import {BehaviorContext, CustomPageHandlerContext, PageHandler} from "./PageHandler";

/**
 * Multi-tenant Page Handler
 */
export class MultiTenantUrlPageHandler implements PageHandler {

  readonly url: string;
  readonly orderValue: number | undefined;

  constructor(url: string, orderValue: number | undefined) {
    this.url = url;
    this.orderValue = orderValue;
  }

  getAccessLevel(): AccessLevel {
    return 'multi-tenant';
  }

  order() {
    return this.orderValue || 120;
  }

  getUrl(): string {
    return this.url;
  }


  behavior(req: RequestObject,
             context: BehaviorContext): Promise<AccessLevel> {
    return Promise.resolve(this.getAccessLevel());
  }

  async execute(req: RequestObject, res: ResponseObject, next: any, context: CustomPageHandlerContext): Promise<void> {
    if (!context.options.multiTenantOptions || !context.options.multiTenantOptions.multiTenantAdapter) {
      throw new Error('multiTenantOptions does not defined');
    }
    const multiTenantAdapter = context.options.multiTenantOptions.multiTenantAdapter;
    if (await multiTenantAdapter.isMultiTenant(req)) {
      const token = await multiTenantAdapter.tenant(req, res, next);
      if (token) {
        next();
      }
    }
  }


}
