/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {DummyMultiTenantAdapter} from "../apigateway/ApiGateway.test";

import {BehaviorContext, CustomPageHandlerContext} from "./PageHandler";
import {TenantInternalPage} from "./TenantInternalPage";
import {getActiveToken} from "./TokenPageHandler";

jest.mock('./TokenPageHandler');


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

describe('TenantInternalPage tests', () => {
  beforeEach(async () => {
    // @ts-ignore
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
    // @ts-ignore
    handlerOptions.multiTenantOptions.multiTenantAdapter = new DummyMultiTenantAdapter(true, 'test');
  });

  test('test TenantInternalPage order', async () => {
    const tenantInternalPage = new TenantInternalPage("/test", 5);
    expect(tenantInternalPage.order()).toEqual(5);
  });

  test('test TenantInternalPage order default', async () => {
    const tenantInternalPage = new TenantInternalPage("/test");
    expect(tenantInternalPage.order()).toEqual(0);
  });

  test('test TenantInternalPage url', async () => {
    const tenantInternalPage = new TenantInternalPage("/test");
    expect(tenantInternalPage.getUrl()).toEqual("/test");

  });

  test('test tenantInternalPage behavior', async () => {
    const tenantInternalPage = new TenantInternalPage("/test");
    expect(await tenantInternalPage.behavior(request, behaviorContext)).toEqual('public');
  });

  test('test TenantInternalPage execute success redirectUri ', async () => {
    const tenantInternalPage = new TenantInternalPage("/test");
    let next = false;
    await tenantInternalPage.execute({...request, ...{query: {
      redirectUri: '/test',
    }}}, response, () => {
      next = true;
    }, customPageHandlerContext);

    if (next) {
      throw new Error('Next invoked');
    }

  });

  test('test TenantInternalPage execute success ', async () => {
    const tenantInternalPage = new TenantInternalPage("/test");
    let next = false;
    await tenantInternalPage.execute(request, response, () => {
      next = true;
    }, customPageHandlerContext);

    if (next) {
      throw new Error('Next invoked');
    }

  });

  test('test TenantInternalPage execute failure 1 ', async () => {
    // @ts-ignore
    delete customPageHandlerContext.options.multiTenantOptions;
    const tenantInternalPage = new TenantInternalPage("/test");
    let next = false;
    let error = false;
    try {
      await tenantInternalPage.execute(request, response, () => {
        next = true;
      }, customPageHandlerContext);
    } catch (e) {
      error = true;
      expect(e.message).toEqual("multiTenantOptions does not defined");
    }

    if (next) {
      throw new Error('Next invoked');
    }
    if (!error) {
      throw new Error('Error not Invoked invoked');
    }

  });

  test('test TenantInternalPage execute failure 2 ', async () => {
    // @ts-ignore
    delete customPageHandlerContext.options.multiTenantOptions.multiTenantAdapter;
    const tenantInternalPage = new TenantInternalPage("/test");
    let next = false;
    let error = false;
    try {
      await tenantInternalPage.execute(request, response, () => {
        next = true;
      }, customPageHandlerContext);
    } catch (e) {
      error = true;
      expect(e.message).toEqual("multiTenantOptions does not defined");
    }

    if (next) {
      throw new Error('Next invoked');
    }
    if (!error) {
      throw new Error('Error not Invoked invoked');
    }

  });

  test('test TenantInternalPage execute skip ', async () => {
    // @ts-ignore
    customPageHandlerContext.sessionToken = {};
    // @ts-ignore
    getActiveToken.mockImplementation(() => null);
    const tenantInternalPage = new TenantInternalPage("/test");
    let next = false;
    await tenantInternalPage.execute(request, response, () => {
      next = true;
    }, customPageHandlerContext);

    if (next) {
      throw new Error('Next invoked');
    }

  });


});
