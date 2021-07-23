import {ApiGateway} from "../apigateway/ApiGateway";

export interface ExpressMiddleWare {

  /**
   * Expressjs middleware https://expressjs.com/en/guide/writing-middleware.html
   * @param req
   * @param res
   * @param next
   */
  middleWare(req: any, res: any, next: any): Promise<void>
}

export class DefaultExpressMiddleWare implements ExpressMiddleWare {
  private apiGateway: ApiGateway;

  constructor(apiGateway: ApiGateway) {
    this.apiGateway = apiGateway;
  }

  async middleWare(req: any, res: any, next: any) {
    await this.apiGateway.middleware(req, res, next);
  }
}
