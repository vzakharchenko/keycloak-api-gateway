/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {DummyMultiTenantAdapter} from "../apigateway/ApiGateway.test";

import {BehaviorContext, CustomPageHandlerContext} from "./PageHandler";
import {MultiTenantUrlPageHandler} from "./MultiTenantUrlPageHandler";

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
  multiTenantAdapterOptions: {},
  multiTenantJson: () => "test",
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

describe('MultiTenantUrlPageHandler tests', () => {
  beforeEach(async () => {
        // @ts-ignore
    handlerOptions = initOptions(defOptions);
        // @ts-ignore
    handlerOptions.multiTenantOptions.multiTenantAdapter = new DummyMultiTenantAdapter(true, 'test');
    customPageHandlerContext.options = handlerOptions;
  });

  test('test MultiTenantUrlPageHandler order', async () => {
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    expect(multiTenantUrlPageHandler.order()).toEqual(5);

  });

  test('test MultiTenantUrlPageHandler url', async () => {
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    expect(multiTenantUrlPageHandler.getUrl()).toEqual("/test");

  });

  test('test MultiTenantUrlPageHandler getAccessLevel', async () => {
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    expect(multiTenantUrlPageHandler.getAccessLevel()).toEqual('multi-tenant');
  });

  test('test MultiTenantUrlPageHandler behavior', async () => {
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    expect(await multiTenantUrlPageHandler.behavior(request, behaviorContext)).toEqual('multi-tenant');
  });

  test('test MultiTenantUrlPageHandler execute success', async () => {
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    let next = false;
    await multiTenantUrlPageHandler.execute(request, response,
            () => {
              next = true;
            }, customPageHandlerContext);
    if (!next) {
      throw new Error('Next does not invoked');
    }
  });

  test('test MultiTenantUrlPageHandler execute skip 1', async () => {


        // @ts-ignore
    handlerOptions = initOptions(defOptions);
        // @ts-ignore
    handlerOptions.multiTenantOptions.multiTenantAdapter = new DummyMultiTenantAdapter(true, '');
    customPageHandlerContext.options = handlerOptions;

    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    let next = false;
    await multiTenantUrlPageHandler.execute(request, response,
            () => {
              next = true;
            }, customPageHandlerContext);
    if (next) {
      throw new Error('Next invoked');
    }
  });

  test('test MultiTenantUrlPageHandler execute skip 2', async () => {

        // @ts-ignore
    handlerOptions.multiTenantOptions.multiTenantAdapter = new DummyMultiTenantAdapter(false);
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test");
    multiTenantUrlPageHandler.order();
    await multiTenantUrlPageHandler.execute(request, response,
            () => {
              throw new Error('next invoked');
            }
            , customPageHandlerContext);
  });

  test('test MultiTenantUrlPageHandler Failure 1', async () => {

        // @ts-ignore
    handlerOptions.multiTenantOptions.multiTenantAdapter = new DummyMultiTenantAdapter(false);
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
    delete customPageHandlerContext.options.multiTenantOptions;
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    let error = false;
    try {

      await multiTenantUrlPageHandler.execute(request, response,
                () => {
                  throw new Error('next invoked');
                }
                , customPageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('multiTenantOptions does not defined');
      error = true;
    }
    if (!error) {
      throw new Error('Wrong Test');
    }
  });

  test('test MultiTenantUrlPageHandler Failure 2', async () => {

        // @ts-ignore
    handlerOptions.multiTenantOptions.multiTenantAdapter = new DummyMultiTenantAdapter(false);
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
        // @ts-ignore
    delete customPageHandlerContext.options.multiTenantOptions.multiTenantAdapter;
    const multiTenantUrlPageHandler = new MultiTenantUrlPageHandler("/test", 5);
    let error = false;
    try {

      await multiTenantUrlPageHandler.execute(request, response,
                () => {
                  throw new Error('next invoked');
                }
                , customPageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('multiTenantOptions does not defined');
      error = true;
    }
    if (!error) {
      throw new Error('Wrong Test');
    }
  });

});
