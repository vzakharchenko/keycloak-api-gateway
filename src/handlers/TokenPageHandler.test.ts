/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {DummyMultiTenantAdapter, DummyTenantAdapter} from "../apigateway/ApiGateway.test";

import {BehaviorContext, CustomPageHandlerContext} from "./PageHandler";
import {TokenPageHandler} from "./TokenPageHandler";

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
  storageType: 'test',
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
    multiFlag: true,
    // eslint-disable-next-line babel/camelcase
    session_state: 'session_state',
    sessionState: 'sessionState',
    tenant: 'tenant',
    token: 'token',
  },
  options: handlerOptions,
};


const customPageHandlerContext: CustomPageHandlerContext = {
  sessionToken: behaviorContext.sessionToken,
  options: handlerOptions,
};

describe('TokenPageHandler tests', () => {
  beforeEach(async () => {
    // @ts-ignore
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;

    // @ts-ignore
    handlerOptions.multiTenantOptions.multiTenantAdapter = new DummyMultiTenantAdapter(true, 'test');

    // @ts-ignore
    handlerOptions.singleTenantOptions.singleTenantAdapter = new DummyTenantAdapter('test');
  });

  test('test TokenPageHandler order', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    expect(tokenPageHandler.order()).toEqual(30000);
  });

  test('test TokenPageHandler url', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    expect(tokenPageHandler.getUrl()).toEqual("/test");

  });

  test('test TokenPageHandler behavior multi-tenant', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    expect(await tokenPageHandler.behavior(request, behaviorContext)).toEqual('multi-tenant');
  });

  test('test TokenPageHandler behavior single 1', async () => {
    const cloneBehaviorContext:BehaviorContext = {
      options: handlerOptions,
    };
    const tokenPageHandler = new TokenPageHandler("/test");
    expect(await tokenPageHandler.behavior(request, cloneBehaviorContext)).toEqual('single');
  });

  test('test TokenPageHandler behavior single 2', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    const cloneBehaviorContext = {
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
    expect(await tokenPageHandler.behavior(request, cloneBehaviorContext)).toEqual('single');
  });

  test('test TokenPageHandler execute success', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    let next = false;
    let json = false;
    await tokenPageHandler.execute(request, {...response, ...{
      json: (object: any) => {
        expect(object).toEqual({activeToken: undefined});
        json = true;
      },
    }},
        () => {
          next = true;
        }, customPageHandlerContext);
    if (!next) {
      throw new Error('Next does not invoked');
    }
    if (!json) {
      throw new Error('JSON not invoked');
    }
  });

  test('test TokenPageHandler execute  single success', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    let next = false;
    let json = false;

    const clonePageHandlerContext: CustomPageHandlerContext = {
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
      options: customPageHandlerContext.options,
    };
    await tokenPageHandler.execute(request, {...response, ...{
      json: (object: any) => {
        expect(object).toEqual({activeToken: undefined});
        json = true;
      },
    }},
        () => {
          next = true;
        }, clonePageHandlerContext);
    if (!next) {
      throw new Error('Next does not invoked');
    }
    if (!json) {
      throw new Error('JSON not invoked');
    }
  });

  test('test TokenPageHandler execute failure 1', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    let next = false;
    let json = false;
    let error = false;

    const clonePageHandlerContext: CustomPageHandlerContext = {
      sessionToken: null,
      options: handlerOptions,
    };
    try {
      await tokenPageHandler.execute(request, {...response, ...{
        json: (object: any) => {
          json = true;
        },
      }},
          () => {
            next = true;
          }, clonePageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('sessionToken does not defined');
      error = true;
    }
    if (next) {
      throw new Error('Next invoked');
    }
    if (json) {
      throw new Error('JSON invoked');
    }
    if (!error) {
      throw new Error('Error does not invoked');
    }
  });

  test('test TokenPageHandler execute failure 2', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    let next = false;
    let json = false;
    let error = false;

    const clonePageHandlerContext: CustomPageHandlerContext = {
      sessionToken: behaviorContext.sessionToken,
      options: initOptions(defOptions),
    };
    delete clonePageHandlerContext.options.multiTenantOptions;
    try {
      await tokenPageHandler.execute(request, {...response, ...{
        json: (object: any) => {
          json = true;
        },
      }},
          () => {
            next = true;
          }, clonePageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('multiTenantOptions does not defined');
      error = true;
    }
    if (next) {
      throw new Error('Next invoked');
    }
    if (json) {
      throw new Error('JSON invoked');
    }
    if (!error) {
      throw new Error('Error does not invoked');
    }
  });


  test('test TokenPageHandler execute failure 3', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    let next = false;
    let json = false;
    let error = false;

    const clonePageHandlerContext: CustomPageHandlerContext = {
      sessionToken: behaviorContext.sessionToken,
      options: initOptions(defOptions),
    };
    // @ts-ignore
    delete clonePageHandlerContext.options.multiTenantOptions.multiTenantAdapter;
    try {
      await tokenPageHandler.execute(request, {...response, ...{
        json: (object: any) => {
          json = true;
        },
      }},
          () => {
            next = true;
          }, clonePageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('multiTenantOptions does not defined');
      error = true;
    }
    if (next) {
      throw new Error('Next invoked');
    }
    if (json) {
      throw new Error('JSON invoked');
    }
    if (!error) {
      throw new Error('Error does not invoked');
    }
  });

  test('test TokenPageHandler execute failure 4', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    let next = false;
    let json = false;
    let error = false;

    const clonePageHandlerContext: CustomPageHandlerContext = {
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
      options: initOptions(defOptions),
    };
    // @ts-ignore
    delete clonePageHandlerContext.options.singleTenantOptions;
    try {
      await tokenPageHandler.execute(request, {...response, ...{
        json: (object: any) => {
          json = true;
        },
      }},
          () => {
            next = true;
          }, clonePageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('singleTenantOptions does not defined');
      error = true;
    }
    if (next) {
      throw new Error('Next invoked');
    }
    if (json) {
      throw new Error('JSON invoked');
    }
    if (!error) {
      throw new Error('Error does not invoked');
    }
  });

  test('test TokenPageHandler execute failure 5', async () => {
    const tokenPageHandler = new TokenPageHandler("/test");
    let next = false;
    let json = false;
    let error = false;

    const clonePageHandlerContext: CustomPageHandlerContext = {
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
      options: initOptions(defOptions),
    };
    // @ts-ignore
    delete clonePageHandlerContext.options.singleTenantOptions.singleTenantAdapter;
    try {
      await tokenPageHandler.execute(request, {...response, ...{
        json: (object: any) => {
          json = true;
        },
      }},
          () => {
            next = true;
          }, clonePageHandlerContext);
    } catch (e) {
      expect(e.message).toEqual('singleTenantAdapter does not defined');
      error = true;
    }
    if (next) {
      throw new Error('Next invoked');
    }
    if (json) {
      throw new Error('JSON invoked');
    }
    if (!error) {
      throw new Error('Error does not invoked');
    }
  });

});
