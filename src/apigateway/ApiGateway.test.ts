/* eslint-disable no-empty-function, no-shadow, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/
import 'jest';
import {EnforcerFunction} from "keycloak-lambda-authorizer/dist/src/Options";

import {AccessLevel, Options, RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {Logout} from "../logout/Logout";
import {Callback} from "../callback/Callback";
import {UrlJWKS} from "../jwks/UrlJWKS";
import {TenantAdapter} from "../tenant/TenantAdapter";
import {MultiTenantAdapter} from "../multitenants/Multi-tenant-adapter";
import {getCustomPageHandler} from "../utils/KeycloakUtils";

import {DefaultApiGateway} from "./ApiGateway";

jest.mock('../utils/DefaultPageHandlers');
jest.mock('../utils/KeycloakUtils');


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

export class DummyLogout implements Logout {
  private isLogoutResponse: boolean;


  constructor(isLogoutResponse: boolean) {
    this.isLogoutResponse = isLogoutResponse;
  }

  isLogout(request: RequestObject): boolean {
    return this.isLogoutResponse;
  }

  async logout(request: RequestObject, res: ResponseObject): Promise<void> {
    throw new Error('logout');
  }

  redirectDefaultLogout(req: RequestObject, res: ResponseObject): Promise<void> | void {

  }

  redirectTenantLogout(req: RequestObject, res: ResponseObject, tenantName: string): Promise<void> | void {

  }
}

export class DummyJWKS implements UrlJWKS {
  private isRequest: boolean;

  constructor(isRequest: boolean) {
    this.isRequest = isRequest;
  }

  isJwksRoute(request: RequestObject): boolean {
    return this.isRequest;
  }

  async getPublicKey(req: RequestObject, res: ResponseObject): Promise<void> {
    throw new Error('jwks');
  }

}

export class DummyCallBack implements Callback {
  private isCallBackRequest: boolean;


  constructor(isCallBackRequest: boolean) {
    this.isCallBackRequest = isCallBackRequest;
  }

  async callback(req: RequestObject, res: ResponseObject): Promise<void> {
    throw new Error('callback');
  }

  isCallBack(request: RequestObject): boolean {
    return this.isCallBackRequest;
  }

}

export class DummyTenantAdapter implements TenantAdapter {

  private readonly tenantCheck?: string;


  constructor(tenantCheck?: string) {
    this.tenantCheck = tenantCheck;
  }

  redirectTenantLogin(req: RequestObject, res: ResponseObject): Promise<void> {
    return Promise.resolve(undefined);
  }

  async singleTenant(req: RequestObject, res: ResponseObject, next: any, enforcer?: EnforcerFunction): Promise<any> {
    if (this.tenantCheck || this.tenantCheck === '') {
      if (this.tenantCheck) {
        await next(this.tenantCheck);
      }
      return this.tenantCheck;
    } else {
      throw new Error('singleTenant');
    }
  }
}

export class DummyMultiTenantAdapter implements MultiTenantAdapter {

  private readonly isRequest: boolean;
  private readonly tenantCheck?: string;


  constructor(isRequest: boolean, tenantCheck?: string) {
    this.isRequest = isRequest;
    this.tenantCheck = tenantCheck;
  }

  async isMultiTenant(req: RequestObject): Promise<boolean> {
    return this.isRequest;
  }

  redirectTenantLogin(req: RequestObject, res: ResponseObject, realm: string, redirectUrl: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  async tenant(req: RequestObject, res: ResponseObject, next: any): Promise<any> {
    if (this.tenantCheck || this.tenantCheck === '') {
      if (this.tenantCheck) {
        await next(this.tenantCheck);
      }
      return this.tenantCheck;
    } else {
      throw new Error('tenant');
    }
  }

}

let options: Options;
describe('ApiGateway tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
        // @ts-ignore
    getCustomPageHandler.mockImplementation(() => null);
    options = {
      session: {
        sessionConfiguration: {
          storageType: 'InMemoryDB', keys: {
            publicKey: {
              key: '',
            }, privateKey: {
              key: '',
            },
          },
        },
      },
    };
        // @ts-ignore
    initOptions.mockImplementation((o) => o);
  });
  test('test logout error', async () => {
    const apiGateway = new DefaultApiGateway(options);
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('LogoutObject is undefined');
    }

  });

  test('test jwks error', async () => {
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        logout: new DummyLogout(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('jwks is undefined');
    }

  });
  test('test callback error', async () => {
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('callback is undefined');
    }

  });

  test('test singleTenant error', async () => {
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('singleTenantAdapter is undefined');
    }

  });

  test('test singleTenant error2', async () => {
    // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('Single tenant configuration does not defined');
    }

  });

  test('test singleTenant', async () => {
    // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('singleTenant');
    }

  });

  test('test publicHandler', async () => {
        // @ts-ignore
    getCustomPageHandler.mockImplementation((accessLevel: AccessLevel) => {
      return {
        execute: () => {
          if (accessLevel === 'public') {
            throw new Error('public');
          }
          return null;
        },
      };
    });
    // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('public');
    }

  });

  test('test singleHandler', async () => {
        // @ts-ignore
    getCustomPageHandler.mockImplementation((accessLevel: AccessLevel) => {
      if (accessLevel === 'single') {
        return {
          execute: () => {
            throw new Error('single');
          },
        };
      }
      return null;
    });
    // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('single');
    }

  });

  test('test multitenant Error', async () => {
        // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        multiTenantOptions: {},
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('multiTenantOptions does not defined');
    }

  });
  test('test multiHandler test', async () => {

        // @ts-ignore
    getCustomPageHandler.mockImplementation((accessLevel: AccessLevel) => {
      if (accessLevel === 'multi-tenant') {
        return {
          execute: () => {
            throw new Error('multi-tenant');
          },
        };
      }
      return null;
    });

        // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        multiTenantOptions: {
          multiTenantAdapter: new DummyMultiTenantAdapter(false),
        },
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('multi-tenant');
    }

  });


  test('test multiAdapter to Single', async () => {

        // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        multiTenantOptions: {
          multiTenantAdapter: new DummyMultiTenantAdapter(false),
        },
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('singleTenant');
    }

  });
  test('test multiAdapter', async () => {

        // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        multiTenantOptions: {
          multiTenantAdapter: new DummyMultiTenantAdapter(true),
        },
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('tenant');
    }

  });

  test('test logout Request', async () => {

        // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        multiTenantOptions: {
          multiTenantAdapter: new DummyMultiTenantAdapter(false),
        },
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(true),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('logout');
    }

  });

  test('test JWKS Request', async () => {

        // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        multiTenantOptions: {
          multiTenantAdapter: new DummyMultiTenantAdapter(false),
        },
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(true),
        callback: new DummyCallBack(false),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('jwks');
    }

  });

  test('test Callback Request', async () => {

        // @ts-ignore
    const apiGateway = new DefaultApiGateway({
      ...options,
      ...{
        multiTenantOptions: {
          multiTenantAdapter: new DummyMultiTenantAdapter(false),
        },
        singleTenantOptions: {
          singleTenantAdapter: new DummyTenantAdapter(),
          defaultAdapterOptions: {},
        },
        logout: new DummyLogout(false),
        jwks: new DummyJWKS(false),
        callback: new DummyCallBack(true),
      },
    });
    try {
      await apiGateway.middleware(request, response, () => {

      });
      throw new Error("test not valid");
    } catch (e:any) {
      expect(e.message).toEqual('callback');
    }

  });
});

