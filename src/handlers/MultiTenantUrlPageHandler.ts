import {EnforcerFunction} from "keycloak-lambda-authorizer/dist/src/Options";

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
  readonly authorization?: EnforcerFunction;

  constructor(url: string, orderValue?: number, authorization?: EnforcerFunction) {
    this.url = url;
    this.orderValue = orderValue;
    this.authorization = authorization;
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
      const token = await multiTenantAdapter.tenant(req, res, next, this.authorization);
      if (token) {
        // eslint-disable-next-line require-atomic-updates
        req.token = token;
        await next();
      }
    }
  }


}
