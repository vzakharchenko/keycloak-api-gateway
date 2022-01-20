/* eslint-disable no-empty-function, , @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/
import 'jest';
import {decode} from "jsonwebtoken";
import {TokenJson} from "keycloak-lambda-authorizer/dist/src/Options";

import {RequestObject, ResponseObject} from "../index";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {initOptions} from "../utils/DefaultPageHandlers";
import {getCurrentStorage, KeycloakState} from "../utils/KeycloakUtils";

import {DefaultSessionManager, getSessionToken, SessionToken} from "./SessionManager";
import {StrorageDB, StrorageDBType} from "./storage/Strorage";

jest.mock('jsonwebtoken');
jest.mock('../utils/KeycloakUtils');

const keycloakState:KeycloakState = {
  multiFlag: false, tenant: "1", url: "test",
};

const sessionToken:SessionToken = {
  jti: 'jti',
  email: 'email',
  exp: 1,
  multiFlag: false,
  session_state: 'session_state',
  sessionState: 'sessionState',
  tenant: 'tenant',
  token: 'token',

};


const defOptions: APIGateWayOptions = {
  storageType: 'InMemoryDB',
  multiTenantAdapterOptions: {},
  // @ts-ignore
  multiTenantJson: () => "test",
  keys: {
    privateKey: {
      key: '-----BEGIN PRIVATE KEY-----\n' +
                'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD40tysViQSnd3E\n' +
                'Ie5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1Jt6ZbZx2l3cNUDt7FQXHL\n' +
                'vZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pnMCLWUwk1usRwnP7o26SH\n' +
                'URTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oItLafRzvgBBD7GvJhqvPIW\n' +
                'TMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+uAjlQYDrPa0wkg+/2KIhx\n' +
                'GD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xVecYVDJBlpOdQAxE77fUl\n' +
                'Rrw5DzKtAgMBAAECggEASLuyf7nKX5q/2XYltfmLobDadwM6X5dtqMe/pylmp1FV\n' +
                'z6PqlgiNdzwfgU3qletFclepoieanMRtlCW+Zaj+6r/5bsgHD8tn3tfXvH0H3sNF\n' +
                'Gi3JDaOUgnxBsQoUFNw+4/LNOzHZHY4ewONFm2MC7OUZUqXa35iXdIp77UTEXkBG\n' +
                'n4QdMraDW1DJUCx8nlUXHPntFN1AJANnx92Nsg6ZbhQrRRH4Lw8ydnUa3bN+Cy12\n' +
                '9secVwo2RVS8slJgW21UpkVKEdUxe0VIL2++0trMokGK219AwlQV86hzEDmVUum2\n' +
                'RIR3S0eknzvkJKspYc0tVvy/1uWnZggeJ+mNo1w4DQKBgQD/jpEpcdYJ9tHtBI3L\n' +
                'e8s2Q4QLqdVPScS5dMDCw0aE6+CQoDSr0l37tHy5hxPJT+WalhyLCvPVtj0H97NP\n' +
                'ZLAoF/pgARpd3qhPM90R7/h7HgqxW/y+n1Qt/bAG+sR6n8LCcriYU+/PeUp1ugSW\n' +
                'AYipqpexeRHhbwAI6pAWBj9ZXwKBgQD5QU5q6gnzdM20WVzp3K4eevpaOt9w/OUW\n' +
                'eI6o9wgVkvAo0p9irq8OM1SQlL3w3cX/YHktG9iF5oNRW6M2p7aKN1d5ZlUDhr1k\n' +
                '/ogbtqg2CTWUikac4cUlZcour589DExlpvVL3zQda5/L7Cr0RrBmKRjMb1fyPXsy\n' +
                'WJIllAgTcwKBgQDta7AlBuNJQotpXe+1+f6jHTqR82h/TxN7EKL8zpq3ZsSs2InW\n' +
                'j4xNCjNN0dZqEtZHNeqyqqw6AiLVQiTOP8cAmLY9dwjd6LwJSS+7OGxrRU+90q4P\n' +
                'EssMJ0HgWh0rpz0zlY01x9VltVOd6AHWsvoaVqizcr1P6OXpYrIWJBu6lQKBgQDS\n' +
                '5isP048v67jRzHsNdafuKmgCSKYe2ByOcttipAK3HmkOYYhy2xNLlKsM2o4Ma9nI\n' +
                'RzzAqjr+sRiTklH7QNT3BfSBx9BO94bxGVzY9ihF8Gzhjk5JF87T4di8v+SgpvNN\n' +
                'X4NV+zoBWrsOtHlzzwwapNNSxzNGyDahVsfx+9sJeQKBgFuvm70VulN5Rd4TMcF2\n' +
                'WixQNHEDStWBWPTa15ehDRIvxqfGZCkuY5o9tGY1vHxnpiHhqVheyRtLuHI6j5b3\n' +
                'il3T5+cXdt1MnmkXUksqwgwcJdMqI5fmcuO9vdeYuGV4MoXysBdKMhqPybcVIonT\n' +
                '5coMCbW92hodfPZ3F93PQpJU\n' +
                '-----END PRIVATE KEY-----\n',
    },
    publicKey: {
      key: 'pub',
    },
  },
};
let handlerOptions = initOptions(defOptions);

class DummyStorage implements StrorageDB {
  async deleteSession(sessionId: string): Promise<void> {
  }

  async getSessionIfExists(sessionId: string): Promise<StrorageDBType | null> {
    // @ts-ignore
    return {session: '1', exp: 1000, keycloakSession: 'sessionState', email: '1@1.tt', externalToken: {}};
  }

  async saveSession(sessionId: string, keycloakSession: string, exp: number, email: string, externalToken: TokenJson): Promise<void> {

  }

  async updateSession(sessionId: string, email: string, externalToken: TokenJson): Promise<void> {

  }

}

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

describe('SessionManager tests', () => {
  beforeEach(async () => {
    handlerOptions = initOptions(defOptions);
        // @ts-ignore
    decode.mockImplementation(() => {
      return {jti: "1"};
    });
         // @ts-ignore
    getCurrentStorage.mockImplementation(() => new DummyStorage());
  });

  test('test getSessionToken 1', async () => {
    const sessionToken0 = getSessionToken("test");
    expect(sessionToken0).toEqual({jti: "1"});
  });

  test('test getSessionToken null', async () => {
        // @ts-ignore
    decode.mockImplementation(() => {
      throw new Error('test');
    });
    const sessionToken0 = getSessionToken("test");
    expect(sessionToken0).toEqual(null);
  });

  test('test getSessionToken 2', async () => {
    const sessionToken0 = getSessionToken("test", true);
    expect(sessionToken0).toEqual({jti: "1", token: "test"});
  });

  test('test SessionManager createSession update', async () => {
    const sessionManager = new DefaultSessionManager(handlerOptions);
    // @ts-ignore
    await sessionManager.updateSession('sessionId', 'email', {access_token: 'a', refresh_token: 'r'});
  });
  test('test SessionManager createSession update', async () => {
    const sessionManager = new DefaultSessionManager(handlerOptions);
    // @ts-ignore
    await sessionManager.updateSession('sessionId', 'email', {access_token: 'a', refresh_token: 'r'});
  });

  test('test SessionManager createSession getSessionAccessToken', async () => {
    const sessionManager = new DefaultSessionManager(handlerOptions);
    const session = await sessionManager.getSessionAccessToken(sessionToken);
    expect(session).toEqual({});
  });

  test('test SessionManager createSession getSessionAccessToken null', async () => {
    const sessionManager = new DefaultSessionManager(handlerOptions);
    const session = await sessionManager.getSessionAccessToken({...sessionToken, sessionState: '1'});
    expect(session).toEqual(undefined);
  });
  test('test SessionManager createSession success', async () => {
    const sessionManager = new DefaultSessionManager(handlerOptions);
    // @ts-ignore
    const sessionId = await sessionManager.createSession(request, keycloakState, {access_token: 'a', refresh_token: 'r'});
    expect(sessionId).toHaveLength(sessionId.length);
  });

  test('test SessionManager createSession failure 1', async () => {
    const sessionManager = new DefaultSessionManager(handlerOptions);
        // @ts-ignore
    decode.mockImplementation(() => {
      return null;
    });
    let error = false;
    try {
            // @ts-ignore
      const sessionId = await sessionManager.createSession(request, keycloakState, {access_token: null, refresh_token: 'r'});
    } catch (e:any) {
      expect(e.message).toEqual("accessToken or refreshToken does not exists");
      error = true;
    }
    if (!error) {
      throw new Error('Expected Error');
    }
  });
  test('test SessionManager createSession failure 2', async () => {
    const sessionManager = new DefaultSessionManager(handlerOptions);
        // @ts-ignore
    decode.mockImplementation(() => {
      return null;
    });
    let error = false;
    try {
            // @ts-ignore
      const sessionId = await sessionManager.createSession(request, keycloakState, {access_token: 'a', refresh_token: null});
    } catch (e:any) {
      expect(e.message).toEqual("accessToken or refreshToken does not exists");
      error = true;
    }
    if (!error) {
      throw new Error('Expected Error');
    }
  });
});
