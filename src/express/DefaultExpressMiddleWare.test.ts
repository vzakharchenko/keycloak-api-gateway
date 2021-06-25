/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function
*/

import 'jest';

import {ApiGateway} from "../apigateway/ApiGateway";
import {RequestObject, ResponseObject} from "../index";

import {DefaultExpressMiddleWare} from "./DefaultExpressMiddleWare";

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

describe('DefaultExpressMiddleWare tests', () => {
  beforeEach(async () => {

  });
  test('test defaultExpressMiddleWare', async () => {
    const defaultExpressMiddleWare = new DefaultExpressMiddleWare(new DummyApiGateway());
    let next = false;
    await defaultExpressMiddleWare.middleWare(request, response, (text:string) => {
      expect(text).toEqual('test');
      next = true;
    });
    if (!next) {
      throw new Error('Next does not invoked');
    }
  });
});
