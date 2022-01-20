import KeycloakAdapter from "keycloak-lambda-authorizer";
import {
    AdapterContent,
    AdapterDependencies,
    EnforcerFunction,
    RequestContent,
} from "keycloak-lambda-authorizer/dist/src/Options";
import {SecurityAdapter} from "keycloak-lambda-authorizer/dist/src/adapters/SecurityAdapter";
import {decodeToken} from "keycloak-lambda-authorizer/dist/src/utils/TokenUtils";
import {DefaultRestCalls} from "keycloak-lambda-authorizer/dist/src/utils/DefaultRestCalls";
import {RestCalls} from "keycloak-lambda-authorizer/dist/src/utils/restCalls";

import {AccessLevel, ProxyOptions, RequestObject, ResponseObject} from "../index";

import {BehaviorContext, CustomPageHandlerContext, PageHandler} from "./PageHandler";

/**
 * Single Tenant Rest Api Handler
 */
export class MultiTenantTenantRestApiHandler implements PageHandler {

  readonly url: string;
  readonly orderValue: number | undefined;
  securityAdapter: SecurityAdapter | null = null;
  readonly authorization?: EnforcerFunction;
  readonly proxyOptions: ProxyOptions;
  readonly restCalls: RestCalls;

  constructor(url: string, proxyOptions: ProxyOptions, orderValue?: number | undefined, authorization?: EnforcerFunction) {
    this.url = url;
    this.orderValue = orderValue;
    this.authorization = authorization;
    this.proxyOptions = proxyOptions;
    this.restCalls = new DefaultRestCalls();
  }

  order() {
    return this.orderValue || 100;
  }

  getAccessLevel(): AccessLevel {
    return 'public';
  }

  getUrl(): string {
    return this.url;
  }

  behavior(req: RequestObject,
             context: BehaviorContext): Promise<AccessLevel> {
    return Promise.resolve(this.getAccessLevel());
  }

  getRealmName(url: string): string {
    const n = url.lastIndexOf('/');
    return url.substring(n + 1);
  }

  getTokenString(req: RequestObject): string {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error('Expected \'headers.authorization\' parameter to be set');
    }
    const match = tokenString.match(/^Bearer (.*)$/);
    if (!match || match.length < 2) {
      throw new Error(`Invalid Authorization token - '${tokenString}' does not match 'Bearer .*'`);
    }
    return match[1];
  }

  async execute(req: RequestObject, res: ResponseObject, next: any, context: CustomPageHandlerContext): Promise<void> {

    if (!context.options.multiTenantOptions) {
      throw new Error('multiTenantOptions is not defined');
    }
    const tokenString = this.getTokenString(req);

    if (!tokenString) {
      throw new Error("Token is empty");
    }

    const jwtToken = decodeToken(tokenString);

    if (!this.securityAdapter) {
      const options1 = {
        ...context.options.multiTenantOptions.multiTenantAdapterOptions,
        ...{
          keycloakJson: async (opt: AdapterContent, requestContent: RequestContent) => {
                        // eslint-disable-next-line  @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        // eslint-disable-next-line  no-return-await
            return await this.options.multiTenantOptions.multiTenantJson(requestContent.realm);
          },
        },
      };
      this.securityAdapter = new KeycloakAdapter(<AdapterDependencies>options1)
                .getDefaultAdapter();
    }


    await this.securityAdapter.validate({
      request: req,
      realm: this.getRealmName(jwtToken.payload.iss),
      token: jwtToken,
      tokenString,
    }, this.authorization);
    const proxyUrl = this.proxyOptions.url;
    const method = this.proxyOptions.method;
    const response = await this.restCalls.sendData(proxyUrl, method, req.body, req.headers);
    res.json(response);
  }

}
