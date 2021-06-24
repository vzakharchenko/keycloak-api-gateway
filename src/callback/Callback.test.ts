/* eslint-disable no-empty-function, no-shadow, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/
import 'jest';
import {Options, RequestObject, ResponseObject} from "../index";
import {SessionManager, SessionToken, TokenType} from "../session/SessionManager";
import {initOptions} from "../utils/DefaultPageHandlers";
import * as t from "../utils/KeycloakUtils";
import {KeycloakState} from "../utils/KeycloakUtils";

import {DefaultCallback} from "./Callback";

// import mock = jest.mock;
jest.mock('keycloak-lambda-authorizer/src/utils/optionsUtils');
jest.mock('../utils/KeycloakUtils');

let options: Options;

class DummySessionManager implements SessionManager {
  async createSession(req: RequestObject, state: KeycloakState, token: TokenType): Promise<any> {
    return "sessionId";
  }

  getSessionAccessToken(session: SessionToken): Promise<any> {
    return Promise.resolve(undefined);
  }

  updateSession(sessionId: string, email: string, externalToken: any): Promise<void> {
    return Promise.resolve(undefined);
  }

}

describe('Callback tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    options = {
      session: {
        sessionManager: new DummySessionManager(),
        sessionConfiguration: {
          storageType: 's',
          keys: {
            publicKey: {
              key: '',
            }, privateKey: {
              key: '',
            },
          },
        },
      },
      multiTenantOptions: {
        multiTenantJson: () => { return {}; },
        multiTenantAdapterOptions: {
        },
      },
    };
    options = initOptions(options);
        // @ts-ignore
    t.getTokenByCode.mockImplementation(async () => { return {}; });
  });

  test('test isCallBack false', async () => {
    const request: RequestObject = {
      baseUrl: '/',
      originalUrl: '/',
      cookies: {},
      query: {},
      headers: {},
      secure: false,
    };

    const defaultCallback = new DefaultCallback(options);

    expect(defaultCallback.isCallBack(request)).toEqual(false);

  });

  test('test isCallBack true', async () => {
    const request: RequestObject = {
      baseUrl: '/callbacks',
      originalUrl: '/callbacks',
      cookies: {},
      query: {},
      headers: {},
      secure: false,
    };

    const defaultCallback = new DefaultCallback(options);

    expect(defaultCallback.isCallBack(request)).toEqual(true);

  });


  test('test callback error', async () => {
    const request: RequestObject = {
      baseUrl: '/callbacks/tenant/clientId',
      originalUrl: '/callbacks/tenant/clientId',
      cookies: {},
      query: {},
      headers: {},
      secure: false,
    };
    let redirectedUrl;
    const response: ResponseObject = {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {
        throw new Error("json");
      },
      redirect: (code: number, url: string) => {
        redirectedUrl = url;
      },
    };
        // @ts-ignore
    options.session.sessionManager = null;
    const defaultCallback = new DefaultCallback(options);
    try {
      await defaultCallback.callback(request, response);
      throw new Error("Wrong test");
    } catch (e) {
      expect(e.message).toEqual('sessionManager is not defined');
    }
  });

  test('test callback singleTenantOptions null', async () => {
    const request: RequestObject = {
      baseUrl: '/callbacks/tenant/clientId',
      originalUrl: '/callbacks/tenant/clientId',
      cookies: {},
      query: {
        state: JSON.stringify({multiFlag: false,
          url: "/",
          tenant: "tenant"}),
      },
      headers: {},
      secure: false,
    };
    let redirectedUrl;
    const response: ResponseObject = {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {
        throw new Error("json");
      },
      redirect: (code: number, url: string) => {
        redirectedUrl = url;
      },
    };
        // @ts-ignore
    options.singleTenantOptions = null;
    const defaultCallback = new DefaultCallback(options);
    await defaultCallback.callback(request, response);
    expect(redirectedUrl).toEqual('/error?message=singleTenantOptions does not defined');
  });

  test('test callback defaultAdapterOptions null', async () => {
    const request: RequestObject = {
      baseUrl: '/callbacks/tenant/clientId',
      originalUrl: '/callbacks/tenant/clientId',
      cookies: {},
      query: {
        state: JSON.stringify({multiFlag: false,
          url: "/",
          tenant: "tenant"}),
      },
      headers: {},
      secure: false,
    };
    let redirectedUrl;
    const response: ResponseObject = {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {
        throw new Error("json");
      },
      redirect: (code: number, url: string) => {
        redirectedUrl = url;
      },
    };
        // @ts-ignore
    options.singleTenantOptions.defaultAdapterOptions = null;
    const defaultCallback = new DefaultCallback(options);
    await defaultCallback.callback(request, response);
    expect(redirectedUrl).toEqual('/error?message=Default Adapter Options does not defined');
  });

  test('test callback single tenant', async () => {
    const request: RequestObject = {
      baseUrl: '/callbacks/tenant/clientId',
      originalUrl: '/callbacks/tenant/clientId',
      cookies: {},
      query: {
        state: JSON.stringify({multiFlag: false,
          url: "/",
          tenant: "tenant"}),
      },
      headers: {},
      secure: false,
    };
    let redirectedUrl;
    const response: ResponseObject = {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {
        throw new Error("json");
      },
      redirect: (code: number, url: string) => {
        redirectedUrl = url;
      },
    };
        // @ts-ignore
    options.singleTenantOptions.defaultAdapterOptions = {};
    const defaultCallback = new DefaultCallback(options);
    await defaultCallback.callback(request, response);
    expect(redirectedUrl).toEqual('/');
  });

  test('test multitenant Error', async () => {
    const request: RequestObject = {
      baseUrl: '/callbacks/tenant/clientId',
      originalUrl: '/callbacks/tenant/clientId',
      cookies: {},
      query: {
        state: JSON.stringify({multiFlag: true,
          url: "/",
          tenant: "tenant"}),
      },
      headers: {},
      secure: false,
    };
    let redirectedUrl;
    const response: ResponseObject = {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {
        throw new Error("json");
      },
      redirect: (code: number, url: string) => {
        redirectedUrl = url;
      },
    };
        // @ts-ignore
    options.multiTenantOptions = null;
    const defaultCallback = new DefaultCallback(options);
    await defaultCallback.callback(request, response);
    expect(redirectedUrl).toEqual('/error?message=Multi-tenant Options does not defined');
  });

  test('test multitenant', async () => {
    const request: RequestObject = {
      baseUrl: '/callbacks/tenant/clientId',
      originalUrl: '/callbacks/tenant/clientId',
      cookies: {},
      query: {
        state: JSON.stringify({multiFlag: true,
          url: "/",
          tenant: "tenant"}),
      },
      headers: {},
      secure: false,
    };
    let redirectedUrl;
    const response: ResponseObject = {
      cookie: (name: string, value: string, options?: any) => {

      },
      json: (object: any) => {
        throw new Error("json");
      },
      redirect: (code: number, url: string) => {
        redirectedUrl = url;
      },
    };
    const defaultCallback = new DefaultCallback(options);
    await defaultCallback.callback(request, response);
    expect(redirectedUrl).toEqual('/');
  });

});

