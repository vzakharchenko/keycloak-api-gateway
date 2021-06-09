import {RequestObject, ResponseObject} from "../index";

export interface Tenant {
    isToken(req: RequestObject): Promise<boolean> | boolean;

    getActiveToken(req: RequestObject, res: ResponseObject,
                   token: any): Promise<void>;
}

export class DefaultTenant implements Tenant {
  isToken(req: RequestObject): boolean {
    return (req.baseUrl || req.originalUrl).startsWith('/token');
  }

  async getActiveToken(req: RequestObject, res: ResponseObject, token: any): Promise<void> {
    const ret = {activeToken: token.access_token};
    res.json(ret);

  }
}
