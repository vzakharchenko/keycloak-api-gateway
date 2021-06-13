import {AccessLevel, CustomHandlerType, CustomPageHandler, PageHandler, RequestObject, ResponseObject} from "../index";

export class PublicUrlPageHandler implements PageHandler {

  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  getAccessLevel(): AccessLevel {
    return 'public';
  }

  getUrl(): string {
    return this.url;
  }

  customHandlerType(): CustomHandlerType {
    return 'protection';
  }

}


export class SingleTenantUrlPageHandler implements PageHandler {

  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  getAccessLevel(): AccessLevel {
    return 'single';
  }

  getUrl(): string {
    return this.url;
  }


  customHandlerType(): CustomHandlerType {
    return 'protection';
  }
}

export class MultiTenantUrlPageHandler implements PageHandler {

  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  getAccessLevel(): AccessLevel {
    return 'multi-tenant';
  }

  getUrl(): string {
    return this.url;
  }


  customHandlerType(): CustomHandlerType {
    return 'protection';
  }

}

export class TokenPageHandler implements CustomPageHandler {

  readonly url: string;
  readonly accessLevel: AccessLevel;

  constructor(url: string,
                accessLevel: AccessLevel) {
    this.url = url;
    this.accessLevel = accessLevel;
  }

  getAccessLevel(): AccessLevel {
    return this.accessLevel;
  }

  getUrl(): string {
    return this.url;
  }

  customHandlerType(): CustomHandlerType {
    return 'executor';
  }

  execute(token: any,
            req: RequestObject,
            res: ResponseObject,
          next:any): void {
    const ret = {activeToken: token.access_token};
    res.json(ret);
  }

}
