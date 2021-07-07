/* eslint-disable no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {APIGateWayOptions} from "../apigateway/ApiGateway";
import {initOptions} from "../utils/DefaultPageHandlers";

import {DefaultJWKS} from "./JWKS";

const defOptions: APIGateWayOptions = {
  storageType: 'InMemoryDB',
  multiTenantAdapterOptions: {},
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
