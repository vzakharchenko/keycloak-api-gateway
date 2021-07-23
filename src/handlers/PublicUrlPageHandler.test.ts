/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {APIGateWayOptions} from "../apigateway/ApiGateway";

import {BehaviorContext, CustomPageHandlerContext} from "./PageHandler";
import {PublicUrlPageHandler} from "./PublicUrlPageHandler";

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
  // @ts-ignore
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

describe('PublicUrlPageHandler tests', () => {
  beforeEach(async () => {
        // @ts-ignore
    handlerOptions = initOptions(defOptions);
    customPageHandlerContext.options = handlerOptions;
  });

  test('test PublicUrlPageHandler order', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler("/test", 5);
    expect(publicUrlPageHandler.order()).toEqual(5);
  });

  test('test PublicUrlPageHandler order default', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler("/test");
    expect(publicUrlPageHandler.order()).toEqual(100);
  });

  test('test PublicUrlPageHandler url', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler("/test");
    expect(publicUrlPageHandler.getUrl()).toEqual("/test");

  });

  test('test PublicUrlPageHandler getAccessLevel', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler("/test", 5);
    expect(publicUrlPageHandler.getAccessLevel()).toEqual('public');
  });

  test('test PublicUrlPageHandler behavior', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler("/test", 5);
    expect(await publicUrlPageHandler.behavior(request, behaviorContext)).toEqual('public');
  });

  test('test PublicUrlPageHandler execute success', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler("/test", 5);
    let next = false;
    await publicUrlPageHandler.execute(request, response,
            () => {
              next = true;
            }, customPageHandlerContext);
    if (!next) {
      throw new Error('Next does not invoked');
    }
  });

});
