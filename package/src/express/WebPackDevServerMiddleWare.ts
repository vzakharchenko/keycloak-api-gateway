import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import {ApiGateway, APIGateWayOptions, DefaultApiGateway} from "../apigateway/ApiGateway";
import {Options} from "../index";

export class WebPackDevServerMiddleWare {
  private options: APIGateWayOptions | Options;
  private apiGateway: ApiGateway;
  private devServerConfig: any;

  constructor(devServerConfig: any, opts: APIGateWayOptions | Options) {
    this.options = opts;
    this.apiGateway = new DefaultApiGateway(opts);
    this.devServerConfig = devServerConfig;
  }

  applyMiddleWare() {
    const dServer = this.devServerConfig;
    dServer.before = (app: any) => {
      app.use(cookieParser());
      app.use(bodyParser());
      this.apiGateway.middleware.bind(this.apiGateway);
      app.use('/*', (req: any, res: any, next: any) => {
        this.apiGateway.middleware(req, res, next);
      }, (req: any, res: any, next: any) => {
        next();
      });
    };
  }
}
