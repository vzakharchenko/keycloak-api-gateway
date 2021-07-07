/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {StrorageDB, StrorageDBType} from "../session/storage/Strorage";
import {PublicUrlPageHandler} from "../handlers/PublicUrlPageHandler";
import {SingleTenantUrlPageHandler} from "../handlers/SingleTenantUrlPageHandler";

import {initOptions} from "./DefaultPageHandlers";
import {
  getCurrentHost,
  getCurrentStorage,
  getCustomPageHandler,
  getHostName,
  getKeycloakJsonFunction,
  getSessionName, isCustomBehavior,
} from "./KeycloakUtils";

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

class DummyStorageDB implements StrorageDB {
  deleteSession(sessionId: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  async getSessionIfExists(sessionId: string): Promise<StrorageDBType | null> {
    return null;
  }

  saveSession(sessionId: string, keycloakSession: string, exp: number, email: string, externalToken: any): Promise<void> {
    return Promise.resolve(undefined);
  }

  updateSession(sessionId: string, email: string, externalToken: any): Promise<void> {
    return Promise.resolve(undefined);
  }

}
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

describe('KeycloakUtils tests', () => {
  beforeEach(async () => {
    // @ts-ignore
    handlerOptions = initOptions(defOptions);
    handlerOptions.session.sessionConfiguration.sessionCookieName = 'TEST';
    handlerOptions.pageHandlers = [];
  });

  test('test PublicUrlPageHandler getHostName', async () => {
    expect(getHostName(request)).toEqual(undefined);
  });

  test('test PublicUrlPageHandler getHostName', async () => {
    expect(getCurrentHost({...request, ...{secure: true}})).toEqual('https://undefined');
  });

  test('test PublicUrlPageHandler getHostNames', async () => {
    expect(getCurrentHost({...request, ...{secure: false}})).toEqual('http://undefined');
  });

  test('test PublicUrlPageHandler getSessionName', async () => {
    expect(getSessionName(handlerOptions)).toEqual('TEST');
  });

  test('test PublicUrlPageHandler getSessionName 2', async () => {
    delete handlerOptions.session.sessionConfiguration.sessionCookieName;
    expect(getSessionName(handlerOptions)).toEqual('KAP');
  });
  test('test PublicUrlPageHandler getCurrentStorage InMemoryDb', async () => {
    await getCurrentStorage(handlerOptions);
  });

  test('test PublicUrlPageHandler getCurrentStorage DynamoDB', async () => {
    handlerOptions.session.sessionConfiguration.storageType = 'DynamoDB';
    handlerOptions.session.sessionConfiguration.storageTypeSettings = {};
    await getCurrentStorage(handlerOptions);
  });


  test('test PublicUrlPageHandler getCurrentStorage DynamoDB Error', async () => {
    // @ts-ignore
    handlerOptions.session.sessionConfiguration.storageType = 'DynamoDB';
    let error = false;
    try {
      await getCurrentStorage(handlerOptions);
    } catch (e) {
      expect(e.message).toEqual('dynamoDbSettings setting does not defined');
      error = true;
    }
    if (!error) {
      throw new Error('Error expected');
    }
  });

  test('test PublicUrlPageHandler getCurrentStorage CustomDB', async () => {
    handlerOptions.session.sessionConfiguration.storageType = new DummyStorageDB();
    await getCurrentStorage(handlerOptions);
  });

  test('test PublicUrlPageHandler getCurrentStorage getKeycloakJsonFunction', async () => {
    expect(await getKeycloakJsonFunction({})).toEqual({});
  });

  test('test PublicUrlPageHandler getCurrentStorage isCustomBehavior 1', async () => {
    expect(await isCustomBehavior('public', {request, options: handlerOptions})).toEqual(null);
  });


  test('test PublicUrlPageHandler getCurrentStorage isCustomBehavior 2', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler('/');
    handlerOptions.pageHandlers?.push(publicUrlPageHandler);
    expect(await isCustomBehavior('public', {request, options: handlerOptions})).toEqual('public');
  });

  test('test PublicUrlPageHandler getCurrentStorage isCustomBehavior 3', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler('/');
    handlerOptions.pageHandlers?.push(singleTenantUrlPageHandler);
    expect(await isCustomBehavior('public', {request, options: handlerOptions})).toEqual(null);
  });

  test('test PublicUrlPageHandler getCurrentStorage getCustomPageHandler 1', async () => {
    expect(await getCustomPageHandler('public', request, handlerOptions)).toEqual(null);
  });

  test('test PublicUrlPageHandler getCurrentStorage getCustomPageHandler 3', async () => {
    const singleTenantUrlPageHandler = new SingleTenantUrlPageHandler('/');
    handlerOptions.pageHandlers?.push(singleTenantUrlPageHandler);
    expect(await getCustomPageHandler('public', request, handlerOptions)).toEqual(null);
  });

  test('test PublicUrlPageHandler getCurrentStorage getCustomPageHandler 2', async () => {
    const publicUrlPageHandler = new PublicUrlPageHandler('/');
    handlerOptions.pageHandlers?.push(publicUrlPageHandler);
    expect(await getCustomPageHandler('public', request, handlerOptions)).toEqual(publicUrlPageHandler);
  });

  test('test PublicUrlPageHandler getCurrentStorage Error', async () => {
    // @ts-ignore
    handlerOptions.session.sessionConfiguration.storageType = 'test';
    let error = false;
    try {
      await getCurrentStorage(handlerOptions);
    } catch (e) {
      expect(e.message).toEqual('test does not support');
      error = true;
    }
    if (!error) {
      throw new Error('Error expected');
    }
  });

});
