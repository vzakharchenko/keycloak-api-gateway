import {ApiGateway, APIGateWayOptions, DefaultApiGateway} from "../apigateway/ApiGateway";
import {Options} from "../index";

export class ExpressMiddleWare {
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
