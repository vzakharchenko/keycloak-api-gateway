import cookieParser from 'cookie-parser';

import {ApiGateway, APIGateWayOptions, DefaultApiGateway} from "../apigateway/ApiGateway";
import {Options} from "../index";

export class WebPackDevServerMiddleWare {
  private apiGateway: ApiGateway;

  constructor(apiGateway: ApiGateway) {
    this.apiGateway = apiGateway;
  }

  applyMiddleWare(devServerConfig: any) {
    const dServer = devServerConfig;
    dServer.before = (app: any) => {
      app.use(cookieParser());
      this.apiGateway.middleware.bind(this.apiGateway);
      app.use('/*', async (req: any, res: any, next: any) => {
        await this.apiGateway.middleware(req, res, next);
      }, (req: any, res: any, next: any) => {
        next();
      });
    };
    return dServer;
  }
}
