/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {DummyTenantAdapter} from "../apigateway/ApiGateway.test";

import {BehaviorContext, CustomPageHandlerContext} from "./PageHandler";
import {SingleTenantUrlPageHandler} from "./SingleTenantUrlPageHandler";

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

const defOptions: APIGateWayOptions = {
  storageType: 'InMemoryDB',
  // @ts-ignore
  defaultAdapterOptions: {},
  keys: {
    privateKey: {
      key: 'pk',
    },
    publicKey: {
      key: 'pub',
    },
  },
};
let handlerOptions = initOptions(defOptions);

const behaviorContext: BehaviorContext = {
  sessionToken: {
    jti: 'jti',
    email: 'email',
    exp: 1,
    multiFlag: false,
    // eslint-disable-next-line babel/camelcase
    session_state: 'session_state',
    sessionState: 'sessionState',
    tenant: 'tenant',
    token: 'token',

  },
  options: handlerOptions,
};


const customPageHandlerContext: CustomPageHandlerContext = {
  options: handlerOptions,
};

describe('SingleTenantUrlPageHandler tests', () => {
  beforeEach(async () => {
    // @ts-ignore
    handlerOptions = initOptions(defOptions);
    // @ts-ignore
    handlerOptions.singleTenantOptions.singleTenantAdapter = new DummyTenantAdapter('test');
    customPageHandlerContext.options = handlerOptions;
  });

  test('test SingleTenantUrlPageHandler order', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    expect(singleTenantUrlPageHandler.order()).toEqual(5);
  });

  test('test SingleTenantUrlPageHandler order 2', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test");
    expect(singleTenantUrlPageHandler.order()).toEqual(110);
  });

  test('test SingleTenantUrlPageHandler url', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    expect(singleTenantUrlPageHandler.getUrl()).toEqual("/test");

  });

  test('test SingleTenantUrlPageHandler getAccessLevel', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    expect(singleTenantUrlPageHandler.getAccessLevel()).toEqual('single');
  });

  test('test SingleTenantUrlPageHandler behavior', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    expect(await singleTenantUrlPageHandler.behavior(request, behaviorContext)).toEqual('single');
  });

  test('test SingleTenantUrlPageHandler execute success', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    let next = false;
    await singleTenantUrlPageHandler.execute(request, response,
        () => {
          next = true;
        }, customPageHandlerContext);
    if (!next) {
      throw new Error('Next does not invoked');
    }
  });

  test('test SingleTenantUrlPageHandler execute skip 1', async () => {


    // @ts-ignore
    handlerOptions = initOptions(defOptions);
    // @ts-ignore
    handlerOptions.singleTenantOptions.singleTenantAdapter = new DummyTenantAdapter('');
    customPageHandlerContext.options = handlerOptions;

    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    let next = false;
    await singleTenantUrlPageHandler.execute(request, response,
        () => {
          next = true;
        }, customPageHandlerContext);
    if (next) {
      throw new Error('Next invoked');
    }
  });


  test('test SingleTenantUrlPageHandler Failure 1', async () => {

    // @ts-ignore
    handlerOptions.singleTenantOptions.singleTenantAdapter = new DummyTenantAdapter(false);
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
    delete customPageHandlerContext.options.singleTenantOptions;
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    let error = false;
    try {

      await singleTenantUrlPageHandler.execute(request, response,
          () => {
            throw new Error('next invoked');
          }
          , customPageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('singleTenantOptions does not defined');
      error = true;
    }
    if (!error) {
      throw new Error('Wrong Test');
    }
  });

  test('test SingleTenantUrlPageHandler Failure 2', async () => {

    // @ts-ignore
    handlerOptions.singleTenantOptions.singleTenantAdapter = new DummyTenantAdapter(false);
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
    // @ts-ignore
    delete customPageHandlerContext.options.singleTenantOptions.singleTenantAdapter;
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler("/test", 5);
    let error = false;
    try {

      await singleTenantUrlPageHandler.execute(request, response,
          () => {
            throw new Error('next invoked');
          }
          , customPageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('singleTenantAdapter does not defined');
      error = true;
    }
    if (!error) {
      throw new Error('Wrong Test');
    }
  });

});
