/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {APIGateWayOptions} from "../apigateway/ApiGateway";

import {BehaviorContext, CustomPageHandlerContext} from "./PageHandler";
import {TenantExternalPage, TenantExternalPageContext} from "./TenantExternalPage";
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

let tenantExternalPageContext:TenantExternalPageContext = {
  redirectedUrl: '/',
};

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

describe('TenantExternalPage tests', () => {
  beforeEach(async () => {
    // @ts-ignore
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
    tenantExternalPageContext = {
      redirectedUrl: '/',
    };
    // @ts-ignore
    getActiveToken.mockImplementation(() => 'token');
  });

  test('test TenantExternalPage order', async () => {
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext, 5);
    expect(tenantExternalPage.order()).toEqual(5);
  });

  test('test TenantExternalPage order default', async () => {
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    expect(tenantExternalPage.order()).toEqual(0);
  });

  test('test TenantExternalPage url', async () => {
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    expect(tenantExternalPage.getUrl()).toEqual("/test");

  });

  test('test TenantExternalPage behavior multi-tenant', async () => {
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    expect(await tenantExternalPage.behavior(request, behaviorContext)).toEqual('multi-tenant');
  });

  test('test TenantExternalPage behavior multi-tenant override', async () => {

    // @ts-ignore
    delete behaviorContext.sessionToken;
    tenantExternalPageContext.sessionAccessLevel = 'multi-tenant';
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    expect(await tenantExternalPage.behavior(request, behaviorContext)).toEqual('multi-tenant');
  });

  test('test TenantExternalPage behavior public', async () => {
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
   // @ts-ignore
    delete behaviorContext.sessionToken;
    expect(await tenantExternalPage.behavior(request, behaviorContext)).toEqual('public');
  });

  test('test TenantExternalPage behavior public override', async () => {
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
   // @ts-ignore
    delete behaviorContext.sessionToken;

    tenantExternalPageContext.defaultAccessLevel = 'public';
    expect(await tenantExternalPage.behavior(request, behaviorContext)).toEqual('public');
  });

  test('test TenantExternalPage execute redirect ', async () => {
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    let next = false;
    await tenantExternalPage.execute(request, {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {

      },
      redirect: (code: number, url: string) => {
        expect(url).toEqual('/?redirectUri=http://undefined');
      },
    }, () => {
      next = true;
    }, customPageHandlerContext);

    if (next) {
      throw new Error('Next invoked');
    }

  });

  test('test TenantExternalPage execute always redirect ', async () => {
    // @ts-ignore
    customPageHandlerContext.sessionToken = {};
    tenantExternalPageContext.alwaysRedirect = true;
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    let next = false;
    await tenantExternalPage.execute(request, {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {

      },
      redirect: (code: number, url: string) => {
        expect(url).toEqual('/?redirectUri=http://undefined');
      },
    }, () => {
      next = true;
    }, customPageHandlerContext);

    if (next) {
      throw new Error('Next invoked');
    }

  });
  test('test TenantExternalPage execute skip ', async () => {
    // @ts-ignore
    customPageHandlerContext.sessionToken = {};
    // @ts-ignore
    getActiveToken.mockImplementation(() => null);
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    let next = false;
    await tenantExternalPage.execute(request, response, () => {
      next = true;
    }, customPageHandlerContext);

    if (next) {
      throw new Error('Next invoked');
    }

  });


  test('test TenantExternalPage execute token success ', async () => {
    // @ts-ignore
    customPageHandlerContext.sessionToken = {};
    const tenantExternalPage = new TenantExternalPage("/test", tenantExternalPageContext);
    let next = false;
    await tenantExternalPage.execute(request, response, () => {
      next = true;
    }, customPageHandlerContext);

    if (!next) {
      throw new Error('Next does not invoked');
    }

  });


});
