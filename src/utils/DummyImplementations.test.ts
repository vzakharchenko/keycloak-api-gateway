/* eslint-disable no-negated-condition,  no-empty-function, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-empty-function
 */

import {AdapterCache} from "keycloak-lambda-authorizer/dist/src/cache/AdapterCache";
import {RestCalls, HTTPMethod} from "keycloak-lambda-authorizer/dist/src/utils/restCalls";
import {ClientAuthorization, JWSPayload} from "keycloak-lambda-authorizer/dist/src/clients/ClientAuthorization";
import {
  Enforcer,
  EnforcerFunc, EnforcerFunction,
  RefreshContext,
  RequestContent,
  RSAKey, SecurityResource,
  TokenJson,
} from "keycloak-lambda-authorizer/dist/src/Options";
import {ResourceChecker} from "keycloak-lambda-authorizer/dist/src/enforcer/resource/Resource";
import {UmaConfiguration, UMAResponse} from "keycloak-lambda-authorizer/dist/src/uma/UmaConfiguration";
import {ServiceAccount} from "keycloak-lambda-authorizer/dist/src/serviceaccount/ServiceAccount";
import {EnforcerAction} from "keycloak-lambda-authorizer/dist/src/enforcer/Enforcer";
import {SecurityAdapter} from "keycloak-lambda-authorizer/dist/src/adapters/SecurityAdapter";
import {JWKS, JWKSType} from "keycloak-lambda-authorizer/dist/src/jwks/JWKS";

export type GetFunc =(region: string, key: string)=>string|undefined

export class DummyCache implements AdapterCache {
  value:GetFunc;

  constructor(value?: string| GetFunc) {
    if (!value) {
      // @ts-ignore
      this.value = (region, key) => undefined;
    } else {
      this.value = typeof value === 'string' ? (region: string, key: string) => value
          : value;
    }
  }

  get(region: string, key: string): string | undefined {
    return this.value(region, key);
  }

  put(region: string, key: string, value: any, ttl?: number): void {

  }

}

export class DummyRestCalls implements RestCalls {

  resp?:string;


  constructor(resp?: string) {
    this.resp = resp;
  }

  async fetchData(url: string, method?: HTTPMethod, headers?: any): Promise<string> {
    return this.resp || '{}';
  }

  async sendData(url: string, method: HTTPMethod, data: string, headers?: any): Promise<string> {
    return this.resp || '{}';
  }

}

export class DummyClientAuthorization implements ClientAuthorization {
  token?:any;
  stringValue?:string;

  constructor(token?: any, stringValue?:string) {
    this.token = token;
    this.stringValue = stringValue;
  }

  async clientAuthentication(requestContent: RequestContent): Promise<any> {
    return this.token;
  }

  clientIdAuthorization(requestContent: RequestContent): Promise<any> {
    return this.token;
  }

  async clientJWT(payload: any, privateKey: RSAKey): Promise<string> {
    // @ts-ignore
    return this.stringValue;
  }

  async createJWS(requestContent: RequestContent): Promise<JWSPayload> {
    // @ts-ignore
    return {jti: this.stringValue};
  }

  async exchangeRPT(requestContent: RequestContent, accessToken: string, clientId: string): Promise<any> {
    return this.token;
  }

  async getRPT(requestContent: RequestContent, enforcerFunc:EnforcerFunc): Promise<any> {
    return this.token;
  }

  async getTokenByCode(requestContent: RequestContent, code: string, host: string): Promise<TokenJson> {
    // @ts-ignore

    return {access_token: this.token, refresh_token: this.token};
  }

  async keycloakRefreshToken(refreshContext: RefreshContext, enforcerFunc?:EnforcerFunc): Promise<any> {
    return this.token;
  }

  async logout(requestContent: RequestContent, refreshToken: any): Promise<void> {

  }

}

export class DummyResourceChecker implements ResourceChecker {
  async getResource(requestContent: RequestContent, permission: SecurityResource): Promise<any> {
    return {};
  }

  async matchResource(requestContent: RequestContent, enforcer?: Enforcer): Promise<void> {

  }

}

export class DummyUmaConfiguration implements UmaConfiguration {
  umaResponse?:UMAResponse;

  constructor(umaResponse?: UMAResponse) {
    this.umaResponse = umaResponse;
  }

  async getUma2Configuration(requestContent: RequestContent): Promise<UMAResponse> {
    // @ts-ignore
    return this.umaResponse || {};
  }

}

export class DummyServiceAccount implements ServiceAccount {
  accessToken:string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getServiceAccountToken(requestContent: RequestContent): Promise<string> {
    return this.accessToken;
  }

}

export class DummyEnforcerAction implements EnforcerAction {
  async enforce(requestContent: RequestContent, enforcer: EnforcerFunc): Promise<void> {

  }

}

export class DummySecurityAdapter implements SecurityAdapter {
  requestContent?:RequestContent;

  constructor(requestContent?: RequestContent) {
    this.requestContent = requestContent;
  }

  async validate(request: string | RequestContent, enforcer?: EnforcerFunction): Promise<RequestContent> {
    return this.requestContent || {token: {payload: {}, header: {alg: 'alg', kid: '1'}, tokenString: 'JWT'}, tokenString: 'JWT'};
  }

  async refreshToken(tokenJson: TokenJson|RefreshContext, enforcer?: EnforcerFunction): Promise<RefreshContext|null> {
    let refreshContext:RefreshContext;
    // @ts-ignore
    if (tokenJson.access_token) {
      refreshContext = {
        token: <TokenJson>tokenJson,
      };
    } else {
      refreshContext = <RefreshContext> tokenJson;
    }
    return refreshContext;
  }

}

export class DummyJWKS implements JWKS {

  jWKSType?:JWKSType;

  constructor(jWKSType?: JWKSType) {
    this.jWKSType = jWKSType;
  }

  json(publicKey: RSAKey): JWKSType {
    return this.jWKSType || {keys: [{test: 'test'}]};
  }

}

describe('Dummy tests', () => {
  test('Dummy test', () => {
    expect(1).toEqual(1);
  });
});
