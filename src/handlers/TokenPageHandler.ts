import {
    AccessLevel,
    RequestObject,
    ResponseObject,
} from "../index";

import {BehaviorContext, CustomPageHandlerContext, PageHandler} from "./PageHandler";

export async function getActiveToken(req:RequestObject,
                                     res:ResponseObject,
                                     next:any,
                                     context:CustomPageHandlerContext):Promise<any> {

  if (!context.sessionToken) {
    throw new Error('sessionToken does not defined');
  }
  let token:any;
  if (context.sessionToken.multiFlag) {
    if (!context.options.multiTenantOptions || !context.options.multiTenantOptions.multiTenantAdapter) {
      throw new Error('multiTenantOptions does not defined');
    }
    const multiTenantAdapter = context.options.multiTenantOptions.multiTenantAdapter;
    token = await multiTenantAdapter.tenant(req, res, next);

  } else {
    if (!context.options.singleTenantOptions) {
      throw new Error('singleTenantOptions does not defined');
    }
    if (!context.options.singleTenantOptions.singleTenantAdapter) {
      throw new Error('singleTenantAdapter does not defined');
    }
    const singleTenantAdapter = context.options.singleTenantOptions.singleTenantAdapter;
    token = await singleTenantAdapter.singleTenant(req, res, next);
  }
  return token;
}

/**
 * Token Page Handler
 *
 *  if call from frontend url /token then return current access_token
 */
export class TokenPageHandler implements PageHandler {

  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  getUrl(): string {
    return this.url;
  }

  order() {
    return 30000;
  }

  async execute(req: RequestObject,
                  res: ResponseObject,
                  next: any,
                  context: CustomPageHandlerContext): Promise<void> {
    const token = await getActiveToken(req, res, next, context);
    const ret = {activeToken: token.access_token};
    res.json(ret);
  }

  async behavior(req: RequestObject,
                   context: BehaviorContext): Promise<AccessLevel> {
    if (context.sessionToken && context.sessionToken.multiFlag) {
      return 'multi-tenant';
    } else {
      return 'single';
    }
  }

}
