import {DefaultJWKS, JWKS} from "keycloak-lambda-authorizer/dist/src/jwks/JWKS";

import {Options, RequestObject, ResponseObject} from "../index";

const KeycloakAdapter = require('keycloak-lambda-authorizer');

export type TypeJWKS ='single'|'multi-tenant'|'session';

/**
 * JWKS endpoint for signed jwt request
 */
export interface UrlJWKS {
    isJwksRoute(request: RequestObject): boolean;

  /**
   * return public key to verify SJWT
   * @param req
   * @param res
   */
    getPublicKey(req: RequestObject, res: ResponseObject): Promise<void>;
}

export class DefaultUrlJWKS implements UrlJWKS {
  private jwksRouteString = new RegExp('(^)(\\/|)(/keycloak/jwks)(/$|(\\?|$))', 'g');

  private options: Options;
  private jwks:JWKS;


  constructor(options: Options) {
    this.options = options;
    this.jwks = new DefaultJWKS();
  }

  isJwksRoute(request: RequestObject): boolean {
    return Boolean((request.baseUrl || request.originalUrl).match(this.jwksRouteString));
  }

  async getPublicKey(req: RequestObject, res: ResponseObject): Promise<void> {
    const type:TypeJWKS = <TypeJWKS>req.query.type || 'session';
    switch (type) {
      case "single": {
        if (!this.options.singleTenantOptions || !this.options.singleTenantOptions.defaultAdapterOptions.keys) {
          res.json({message: `unsupported type ${type}`});
          return;
        }
        res.json(await this.jwks.json(this.options.singleTenantOptions.defaultAdapterOptions.keys.publicKey));
        return;
      }
      case "multi-tenant": {
        if (!this.options.multiTenantOptions || !this.options.multiTenantOptions.multiTenantAdapterOptions.keys) {
          res.json({message: `unsupported type ${type}`});
          return;
        }
        res.json(await this.jwks.json(this.options.multiTenantOptions.multiTenantAdapterOptions.keys.publicKey));
        return;
      }
      case 'session': {
        res.json(await this.jwks.json(this.options.session.sessionConfiguration.keys.publicKey));
        return;
      }
      default: {
        res.json({message: `unsupported type ${type}`});

      }

    }

  }

}
