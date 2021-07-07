/* eslint-disable no-empty-function, babel/camelcase, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {getSessionToken, SessionToken} from "../session/SessionManager";

import {DefaultLogout} from "./Logout";

jest.mock('../session/SessionManager.ts');

const request: RequestObject = {
  baseUrl: '/',
  originalUrl: '/',
  cookies: {},
  query: {},
  headers: {},
  secure: false,
};


const sessionToken:SessionToken = {
  jti: 'jti',
  email: 'email',
  exp: 1,
  multiFlag: false,
  session_state: 'session_state',
  sessionState: 'sessionState',
  token: 'token',
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

describe('Logout tests', () => {
  beforeEach(async () => {
        // @ts-ignore
    handlerOptions = initOptions(defOptions);
        // @ts-ignore
    getSessionToken.mockImplementation(() => {
      return sessionToken;
    });
  });

  test('test Logout isLogout 1', async () => {
    const logout = new DefaultLogout(handlerOptions);
        // @ts-ignore
    expect(logout.isLogout({...request, ...{baseUrl: '/logout', originalUrl: null}})).toEqual(true);
  });

  test('test Logout isLogout 2', async () => {
    const logout = new DefaultLogout(handlerOptions);
        // @ts-ignore
    expect(logout.isLogout({...request, ...{baseUrl: undefined, originalUrl: '/logout'}})).toEqual(true);
  });

  test('test Logout isLogout false 1', async () => {
    const logout = new DefaultLogout(handlerOptions);
        // @ts-ignore
    expect(logout.isLogout({...request, ...{baseUrl: undefined, originalUrl: '/test'}})).toEqual(false);
  });

  test('test Logout isLogout false 2', async () => {
    const logout = new DefaultLogout(handlerOptions);
        // @ts-ignore
    expect(logout.isLogout({...request, ...{baseUrl: '/test', originalUrl: undefined}})).toEqual(false);
  });

  test('test Logout redirectDefaultLogout', async () => {
        // @ts-ignore
    handlerOptions.singleTenantOptions.defaultAdapterOptions = {keycloakJson: {"auth-server-url": "http://localhost:8090/auth/"}};
    const logout = new DefaultLogout(handlerOptions);
    let redirect = false;
    await logout.redirectDefaultLogout(request, {...response, ...{redirect: (code: number, url: string) => {
      redirect = true;
      expect(url).toEqual('http://localhost:8090/auth/realms/undefined/protocol/openid-connect/logout?redirect_uri=http://undefined/');
    }}});
    if (!redirect) {
      throw new Error('expected redirect');
    }
  });

  test('test Logout redirectTenantLogout', async () => {
        // @ts-ignore
    handlerOptions.multiTenantOptions?.multiTenantJson = () => { return {"auth-server-url": "http://localhost:8090/auth/"}; };
    const logout = new DefaultLogout(handlerOptions);
    let redirect = false;
    await logout.redirectTenantLogout(request, {...response, ...{redirect: (code: number, url: string) => {
      redirect = true;
      expect(url).toEqual('http://localhost:8090/auth/realms/test/protocol/openid-connect/logout?redirect_uri=http://undefined/tenants/test');
    }}}, 'test');
    if (!redirect) {
      throw new Error('expected redirect');
    }
  });

  test('test Logout redirectDefaultLogout error', async () => {
    delete handlerOptions.singleTenantOptions;
    const logout = new DefaultLogout(handlerOptions);
    let error = false;
    try {
      await logout.redirectDefaultLogout(request, response);
    } catch (e) {
      error = true;
    }
    if (!error) {
      throw new Error('expected error');
    }
  });


  test('test Logout single tenant logout', async () => {
        // @ts-ignore
    handlerOptions.singleTenantOptions.defaultAdapterOptions = {keycloakJson: {"auth-server-url": "http://localhost:8090/auth/"}};
    const logout = new DefaultLogout(handlerOptions);
    let redirect = false;
    await logout.logout(request, {...response, ...{redirect: (code: number, url: string) => {
      redirect = true;
      expect(url).toEqual('http://localhost:8090/auth/realms/undefined/protocol/openid-connect/logout?redirect_uri=http://undefined/');
    }}});
    if (!redirect) {
      throw new Error('expected redirect');
    }
  });
  test('test Logout default tenant logout', async () => {
        // @ts-ignore
    getSessionToken.mockImplementation(() => {
      return null;
    });
        // @ts-ignore
    handlerOptions.singleTenantOptions.defaultAdapterOptions = {keycloakJson: {"auth-server-url": "http://localhost:8090/auth/"}};
    const logout = new DefaultLogout(handlerOptions);
    let redirect = false;
    await logout.logout(request, {...response, ...{redirect: (code: number, url: string) => {
      redirect = true;
      expect(url).toEqual('http://localhost:8090/auth/realms/undefined/protocol/openid-connect/auth?client_id=undefined&redirect_uri=http://undefined/callbacks/undefined/undefined/callback&state=%7B%22multiFlag%22%3Afalse%2C%22url%22%3A%22%2F%22%7D&response_type=code&nonce=1&scope=openid');
    }}});
    if (!redirect) {
      throw new Error('expected redirect');
    }
  });
  test('test Logout default tenant logout error', async () => {
        // @ts-ignore
    getSessionToken.mockImplementation(() => {
      return null;
    });
    delete handlerOptions.singleTenantOptions;
    const logout = new DefaultLogout(handlerOptions);
    let error = false;
    try {
      await logout.logout(request, response);
    } catch (e) {
      error = true;
    }
    if (!error) {
      throw new Error('expected error');
    }
  });

  test('test Logout multi-tenant logout', async () => {
        // @ts-ignore
    getSessionToken.mockImplementation(() => {
      return {...sessionToken, ...{tenant: 'tenant'}};
    });
        // @ts-ignore
    handlerOptions.multiTenantOptions?.multiTenantJson = () => { return {"auth-server-url": "http://localhost:8090/auth/"}; };
    const logout = new DefaultLogout(handlerOptions);
    let redirect = false;
    await logout.logout(request, {...response, ...{redirect: (code: number, url: string) => {
      redirect = true;
      expect(url).toEqual('http://localhost:8090/auth/realms/tenant/protocol/openid-connect/logout?redirect_uri=http://undefined/tenants/tenant');
    }}});
    if (!redirect) {
      throw new Error('expected redirect');
    }
  });
});
