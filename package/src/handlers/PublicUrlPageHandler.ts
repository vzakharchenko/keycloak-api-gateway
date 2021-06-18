import {
    AccessLevel,
    RequestObject,
    ResponseObject,
} from "../index";

import {BehaviorContext, CustomPageHandlerContext, PageHandler} from "./PageHandler";

/**
 * Public Page Handler
 */
export class PublicUrlPageHandler implements PageHandler {

  readonly url: string;
  readonly orderValue: number | undefined;

  constructor(url: string, orderValue?: number | undefined) {
    this.url = url;
    this.orderValue = orderValue;
  }

  order() {
    return this.orderValue || 100;
  }

  getAccessLevel(): AccessLevel {
    return 'public';
  }

  getUrl(): string {
    return this.url;
  }

  behavior(req: RequestObject,
             context: BehaviorContext): Promise<AccessLevel> {
    return Promise.resolve(this.getAccessLevel());
  }

  execute(req: RequestObject, res: ResponseObject, next: any, context: CustomPageHandlerContext): void {
    next();
  }

}
