import {
    AccessLevel,
    RequestObject,
    ResponseObject,
} from "../index";

import {BehaviorContext, CustomPageHandlerContext, PageHandler} from "./PageHandler";

/**
 * Single Tenant Page Handler
 */
export class SingleTenantUrlPageHandler implements PageHandler {

  readonly url: string;
  readonly orderValue: number | undefined;

  constructor(url: string, orderValue: number | undefined) {
    this.url = url;
    this.orderValue = orderValue;
  }

  getAccessLevel(): AccessLevel {
    return 'single';
  }

  order() {
    return this.orderValue || 110;
  }

  getUrl(): string {
    return this.url;
  }

  behavior(req: RequestObject,
             context: BehaviorContext): Promise<AccessLevel> {
    return Promise.resolve(this.getAccessLevel());
  }

  async execute(req: RequestObject, res: ResponseObject, next: any, context: CustomPageHandlerContext): Promise<void> {
    if (!context.options.singleTenantOptions) {
      throw new Error('singleTenantOptions does not defined');
    }
    const singleTenantAdapter = context.options.singleTenantOptions.singleTenantAdapter;
    if (!singleTenantAdapter) {
      throw new Error('singleTenantAdapter does not defined');
    }
    const token = await singleTenantAdapter.singleTenant(req, res, next);
    if (token) {
      next();
    }
  }

}
