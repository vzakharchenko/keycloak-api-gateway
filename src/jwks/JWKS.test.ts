/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {initOptions} from "../utils/DefaultPageHandlers";

import {DefaultJWKS} from "./JWKS";

const defOptions: APIGateWayOptions = {
  storageType: 'test',
  multiTenantAdapterOptions: {},
  multiTenantJson: () => "test",
  keys: {
    privateKey: {
      key: 'pk',
    },
    publicKey: {
      key: '-----BEGIN CERTIFICATE-----\n' +
          'MIIDjzCCAnegAwIBAgIUNC48rSIoaMJC9YAcJ/MnfQcBmDgwDQYJKoZIhvcNAQEL\n' +
          'BQAwVjELMAkGA1UEBhMCVVMxDzANBgNVBAgMBkRlbmlhbDEUMBIGA1UEBwwLU3By\n' +
          'aW5nZmllbGQxDDAKBgNVBAoMA0RpczESMBAGA1UEAwwJZGV2c2VydmVyMCAXDTIx\n' +
          'MDYwNzIwMTQzOVoYDzIxMjEwNTE0MjAxNDM5WjBWMQswCQYDVQQGEwJVUzEPMA0G\n' +
          'A1UECAwGRGVuaWFsMRQwEgYDVQQHDAtTcHJpbmdmaWVsZDEMMAoGA1UECgwDRGlz\n' +
          'MRIwEAYDVQQDDAlkZXZzZXJ2ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\n' +
          'AoIBAQD40tysViQSnd3EIe5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1J\n' +
          't6ZbZx2l3cNUDt7FQXHLvZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pn\n' +
          'MCLWUwk1usRwnP7o26SHURTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oIt\n' +
          'LafRzvgBBD7GvJhqvPIWTMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+u\n' +
          'AjlQYDrPa0wkg+/2KIhxGD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xV\n' +
          'ecYVDJBlpOdQAxE77fUlRrw5DzKtAgMBAAGjUzBRMB0GA1UdDgQWBBRJRP2WG0uR\n' +
          'vDPnSRmV6Y8Rxu6ErDAfBgNVHSMEGDAWgBRJRP2WG0uRvDPnSRmV6Y8Rxu6ErDAP\n' +
          'BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQDhKnZDt5VwTroWcTtX\n' +
          'LSqIDtLLHiZxk6PIE8X9DG+rU//4Rfd+MFHClcKWiyLgYZPdgPaXSDXPiyfxlb7v\n' +
          'jOA0F0PXbEpR/RmjM5A+x3gljSufrWgedEC6rFFEg5Ju1IY+/7nJYkvd3ICMiLB3\n' +
          'gOczMEp/tI7m89DS+bJAGG8AIYeBjj+3OjuGdEFtXpkt1ri33LYC4wK+rjqkBMyi\n' +
          'jqwex5bEkloSuyWP/IIDa8OpBWUM17H9ZswG74kQr5/wsvvTxc/JvRmMtNrbUyKa\n' +
          '2JKXA1IJgNPP4/v2FxiGTibidZVf0fyXVqarU5Ngj/fVQyn7EBg+VGqPintiL5xU\n' +
          'gUsi\n' +
          '-----END CERTIFICATE-----\n',
    },
  },
};
let handlerOptions = initOptions(defOptions);

// @ts-ignore
const request: RequestObject = {
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

describe('JWKS tests', () => {
  beforeEach(async () => {

    handlerOptions = initOptions(defOptions);
    // jest.mock('keycloak-lambda-authorizer');
    // const {adapter} = require('keycloak-lambda-authorizer');
    // adapter.mockImplementation({
    //   jwks:{
    //     jwksResponse:()=>{return "key"}
    //   }
    // })
  });

  test('test JWKS success 1', async () => {
    const jwks = new DefaultJWKS(handlerOptions);
    expect(jwks.isJwksRoute({...request, ...{
      baseUrl: '/keycloak/jwks',
    }})).toEqual(true);
  });

  test('test JWKS success 2', async () => {
    const jwks = new DefaultJWKS(handlerOptions);
    expect(jwks.isJwksRoute({...request, ...{
      originalUrl: '/keycloak/jwks',
    }})).toEqual(true);
  });
  test('test JWKS failure', async () => {
    const jwks = new DefaultJWKS(handlerOptions);
    expect(jwks.isJwksRoute({...request, ...{
      originalUrl: '/keycloak/jwk1s',
    }})).toEqual(false);
  });

  test('test JWKS failure 2', async () => {
    const jwks = new DefaultJWKS(handlerOptions);
    let json = false;
    expect(await jwks.jwks({...request, ...{
      originalUrl: '/keycloak/jwk1s',
    }}, {...response, ...{
      json: (object: any) => {
        expect(object).toEqual(JSON.stringify({keys: [{kty: "RSA", use: "sig", n: "APjS3KxWJBKd3cQh7n7qEMz_uLEc0PxSjFgApbCcDb890faWr-nOM6jW3Um3pltnHaXdw1QO3sVBccu9l4SfTDvn8tV7-Ah6gokhRNatfJU6us-fnShaJopfmmcwItZTCTW6xHCc_ujbpIdRFN5tJ8EjuRB-HbZqK_ryqAa-jiUxYhJWtY0I16Pigi0tp9HO-AEEPsa8mGq88hZMwXKoPMZG1WTydiL3HdbCnvZ5Rb1pj-P9qQ9Mt1Tlr64COVBgOs9rTCSD7_YoiHEYP99_KCCO9RqinM4Ruc0bIFVeI5LetDDBCdc2r6KnTFV5xhUMkGWk51ADETvt9SVGvDkPMq0", e: "AQAB"}]}));
        json = true;
      },
    }})).toEqual(undefined);
    if (!json) {
      throw new Error('json does not invoked');
    }
  });

  // test('test JWKS ', async () => {
  //   let next = false;
  //
  //   const jwks = new DefaultJWKS(handlerOptions);
  //   jwks.isJwksRoute({...request, ...{
  //     baseUrl: '/keycloak/jwks'
  //     }})
  //   await defaultExpressMiddleWare.middleWare(request, response, (text:string) => {
  //     expect(text).toEqual('test');
  //     next = true;
  //   });
  //   if (!next) {
  //     throw new Error('Next does not invoked');
  //   }
  // });
});
