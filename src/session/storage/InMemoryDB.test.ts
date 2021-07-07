/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';
import {RequestObject, ResponseObject} from "../../index";
import {APIGateWayOptions} from "../../apigateway/ApiGateway";
import {initOptions} from "../../utils/DefaultPageHandlers";
import {InMemoryDB} from "./InMemoryDB";

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

describe('InMemoryDB tests', () => {
  beforeEach(async () => {
    // @ts-ignore
    handlerOptions = initOptions(defOptions);
  });

  test('test InMemoryDB', async () => {
    const  storage = new InMemoryDB();
    storage.readStorage();
    storage.updateStorage();
    await storage.saveSession("1","1",1,"email",{});
    storage.updateStorage();
    const session = await storage.getSessionIfExists("1");
    expect(session).toEqual({
      "email": "email",
      "exp": 1,
      "externalToken": {},
      "keycloakSession": "1",
      "session": "1"
    });
    await storage.updateSession("1","email",{});
    await storage.deleteSession("1");
  });

});
