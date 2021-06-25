/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @shopify/prefer-early-return
*/

import 'jest';

import {ApiGateway} from "../apigateway/ApiGateway";
import {RequestObject, ResponseObject} from "../index";

import {WebPackDevServerMiddleWare} from "./DefaultWebPackDevServerMiddleWare";

class DummyApiGateway implements ApiGateway {
  async middleware(request: RequestObject, response: ResponseObject, next?: any): Promise<void> {
    next('test');
  }

}

const request: RequestObject = {
  baseUrl: '/',
  originalUrl: '/',
  cookies: {},
  query: {},
  headers: {},
  secure: false,
};
const response: ResponseObject = {
  cookie: (name: string, value: string, options?: any) => {

  },
  json: (object: any) => {

  },
  redirect: (code: number, url: string) => {

  },
};

describe('DefaultWebPackDevServerMiddleWare tests', () => {
  beforeEach(async () => {

  });
  test('test WebPackDevServerMiddleWare', async () => {
    const defaultExpressMiddleWare = new WebPackDevServerMiddleWare(new DummyApiGateway());
    let next = false;
    let middlewareFunc:any = null;
    let middlewareFunc2:any = null;
    const devServerConfig:any = await defaultExpressMiddleWare.applyMiddleWare({});
    devServerConfig.before({
      use: (param1:any, param2:any, param3:any) => {
        if (param1 === '/*') {
          middlewareFunc = param2;
          middlewareFunc2 = param3;
        }
      },
    });

    if (!middlewareFunc) {
      throw new Error('middleware does not found');
    }
    await middlewareFunc(request, response, (text:string) => {
      expect(text).toEqual('test');
      next = true;
    });
    if (!next) {
      throw new Error('Next does not invoked');
    }
    next = false;
    await middlewareFunc2(request, response, () => {
      next = true;
    });
    if (!next) {
      throw new Error('Next does not invoked');
    }
  });
});
