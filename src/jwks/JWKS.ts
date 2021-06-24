import {Options, RequestObject, ResponseObject} from "../index";
import {JWKS} from "../../dist/src/jwks/JWKS";

const {adapter} = require('keycloak-lambda-authorizer');

/**
 * JWKS endpoint for signed jwt request
 */
export interface c {
    isJwksRoute(request: RequestObject): boolean;

  /**
   * return public key to verify SJWT
   * @param req
   * @param res
   */
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
