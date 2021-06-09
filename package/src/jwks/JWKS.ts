import {Options, RequestObject, ResponseObject} from "../index";

const {adapter} = require('keycloak-lambda-authorizer');

export interface JWKS {
    isJwksRoute(request: RequestObject): boolean;

    jwks(req: RequestObject, res: ResponseObject): Promise<void>;
}

export class DefaultJWKS implements JWKS {
  private jwksRouteString = new RegExp('(^)(\\/|)(/keycloak/jwks)(/$|(\\?|$))', 'g');

  private options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  isJwksRoute(request: RequestObject): boolean {
    return Boolean((request.baseUrl || request.originalUrl).match(this.jwksRouteString));
  }

  async jwks(req: RequestObject, res: ResponseObject): Promise<void> {
    return res.json(adapter.jwks.jwksUrlResponse(this.options.session.sessionConfiguration.keys.publicKey.key));
  }

}
