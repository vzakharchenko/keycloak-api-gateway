import {ApiGateway, APIGateWayOptions, DefaultApiGateway} from "../apigateway/ApiGateway";
import {Options} from "../index";

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
  private options: APIGateWayOptions | Options;
  private apiGateway: ApiGateway;

  constructor(opts: APIGateWayOptions | Options) {
    this.options = opts;
    this.apiGateway = new DefaultApiGateway(opts);
  }

  async middleWare(req: any, res: any, next: any) {
    await this.apiGateway.middleware(req, res, next);
  }
}
