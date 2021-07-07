/* eslint-disable @typescript-eslint/ban-ts-comment
*/

import 'jest';

import {RequestObject, ResponseObject} from "../index";
import {initOptions} from "../utils/DefaultPageHandlers";
import {ApiGateway, APIGateWayOptions} from "../apigateway/ApiGateway";

import {DefaultLambdaEdgeAdapter} from "./LambdaEdgeAdapter";

class DummyApiGateway implements ApiGateway {
  private readonly expectedRequest: Request;
  private readonly func?: (res: ResponseObject) => void;

  constructor(expectedRequest: Request, func?: (res: ResponseObject) => void) {
    this.expectedRequest = expectedRequest;
    this.func = func;
  }

  async middleware(request: RequestObject, response: ResponseObject, next?: any): Promise<void> {
    expect(request).toEqual(this.expectedRequest);
    if (this.func) {
      this.func(response);
    }
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

describe('LambdaEdgeAdapter tests', () => {
  beforeEach(async () => {
        // @ts-ignore
    handlerOptions = initOptions(defOptions);
  });

  test('test LambdaEdgeAdapter handler', async () => {

        // @ts-ignore
    const req: RequestObject = {
      clientIp: "217.146.251.117",
      headers: {},
      method: "GET",
      querystring: "",
      uri: "/",
      baseUrl: "/",
      url: "https://undefined/",
      secure: true,
      query: {},
      cookies: {
        KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
      },
      signedCookies: {},
    };
        // @ts-ignore
    const lambdaEdgeAdapter = new DefaultLambdaEdgeAdapter(new DummyApiGateway(req));
    const res = await lambdaEdgeAdapter.handler({
      Records: [{
        cf: {
          request: {
            clientIp: "217.146.251.117",
            headers: {
              host: "d1mtvnktsdwaum.cloudfront.net",
              "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36",
              "cache-control": "max-age=0",
              "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
              "sec-ch-ua-mobile": "?0",
              "upgrade-insecure-requests": "1",
              accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "sec-fetch-site": "none",
              "sec-fetch-mode": "navigate",
              "sec-fetch-user": "?1",
              "sec-fetch-dest": "document",
              "accept-encoding": "gzip, deflate, br",
              "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk-UA;q=0.6,uk;q=0.5",
              cookie: "KAP=eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            method: "GET",
            querystring: "",
            uri: "/",
            baseUrl: "/",
            url: "https://d1mtvnktsdwaum.cloudfront.net/",
            secure: true,
            query: {},
            cookies: {
              KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            signedCookies: {},
          },
        },
      }],
    });
    expect(res.status).toEqual(200);
  });
  test('test LambdaEdgeAdapter handler2', async () => {

        // @ts-ignore
    const req: RequestObject = {
      clientIp: "217.146.251.117",
      headers: {},
      method: "GET",
      querystring: "",
      uri: "/",
      baseUrl: "/",
      url: "https://undefined/",
      secure: true,
      query: {},
      cookies: {
        KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
      },
      signedCookies: {},
    };
        // @ts-ignore
    const lambdaEdgeAdapter = new DefaultLambdaEdgeAdapter(new DummyApiGateway(req, ((resp) => {
      resp.json({r: 'r'});
    })));
    const res = await lambdaEdgeAdapter.handler({
      Records: [{
        cf: {
          request: {
            clientIp: "217.146.251.117",
            headers: {
              host: "d1mtvnktsdwaum.cloudfront.net",
              "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36",
              "cache-control": "max-age=0",
              "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
              "sec-ch-ua-mobile": "?0",
              "upgrade-insecure-requests": "1",
              accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "sec-fetch-site": "none",
              "sec-fetch-mode": "navigate",
              "sec-fetch-user": "?1",
              "sec-fetch-dest": "document",
              "accept-encoding": "gzip, deflate, br",
              "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk-UA;q=0.6,uk;q=0.5",
              cookie: "KAP=eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            method: "GET",
            querystring: "",
            uri: "/",
            baseUrl: "/",
            url: "https://d1mtvnktsdwaum.cloudfront.net/",
            secure: true,
            query: {},
            cookies: {
              KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            signedCookies: {},
          },
        },
      }],
    });
    expect(res.status).toEqual(200);
    expect(res.body).toEqual("{\"r\":\"r\"}");
  });

  test('test LambdaEdgeAdapter handler3', async () => {

        // @ts-ignore
    const req: RequestObject = {
      clientIp: "217.146.251.117",
      headers: {},
      method: "GET",
      querystring: "",
      uri: "/",
      baseUrl: "/",
      url: "https://undefined/",
      secure: true,
      query: {},
      cookies: {
        KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
      },
      signedCookies: {},
    };
        // @ts-ignore
    const lambdaEdgeAdapter = new DefaultLambdaEdgeAdapter(new DummyApiGateway(req, ((resp) => {
      resp.cookie('test', 't');
    })));
    const res = await lambdaEdgeAdapter.handler({
      Records: [{
        cf: {
          request: {
            clientIp: "217.146.251.117",
            headers: {
              host: "d1mtvnktsdwaum.cloudfront.net",
              "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36",
              "cache-control": "max-age=0",
              "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
              "sec-ch-ua-mobile": "?0",
              "upgrade-insecure-requests": "1",
              accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "sec-fetch-site": "none",
              "sec-fetch-mode": "navigate",
              "sec-fetch-user": "?1",
              "sec-fetch-dest": "document",
              "accept-encoding": "gzip, deflate, br",
              "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk-UA;q=0.6,uk;q=0.5",
              cookie: "KAP=eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            method: "GET",
            querystring: "",
            uri: "/",
            baseUrl: "/",
            url: "https://d1mtvnktsdwaum.cloudfront.net/",
            secure: true,
            query: {},
            cookies: {
              KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            signedCookies: {},
          },
        },
      }],
    });
    expect(res.status).toEqual(200);
  });

  test('test LambdaEdgeAdapter handler4', async () => {

        // @ts-ignore
    const req: RequestObject = {
      clientIp: "217.146.251.117",
      headers: {},
      method: "GET",
      querystring: "",
      uri: "/",
      baseUrl: "/",
      url: "https://undefined/",
      secure: true,
      query: {},
      cookies: {
        KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
      },
      signedCookies: {},
    };
        // @ts-ignore
    const lambdaEdgeAdapter = new DefaultLambdaEdgeAdapter(new DummyApiGateway(req, ((resp) => {
      throw new Error('test');
    })));
    const res = await lambdaEdgeAdapter.handler({
      Records: [{
        cf: {
          request: {
            clientIp: "217.146.251.117",
            headers: {
              host: "d1mtvnktsdwaum.cloudfront.net",
              "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36",
              "cache-control": "max-age=0",
              "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
              "sec-ch-ua-mobile": "?0",
              "upgrade-insecure-requests": "1",
              accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "sec-fetch-site": "none",
              "sec-fetch-mode": "navigate",
              "sec-fetch-user": "?1",
              "sec-fetch-dest": "document",
              "accept-encoding": "gzip, deflate, br",
              "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk-UA;q=0.6,uk;q=0.5",
              cookie: "KAP=eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            method: "GET",
            querystring: "",
            uri: "/",
            baseUrl: "/",
            url: "https://d1mtvnktsdwaum.cloudfront.net/",
            secure: true,
            query: {},
            cookies: {
              KAP: "eyJhbGciOiJSUzI1NiIsInR5cCI6IlJTQSJ9.eyJqdGkiOiJhMTYyZGYzOC01MTUwLTRiZjYtYTI0Yy1iZjdjNDI5ODBlMjEiLCJleHAiOjE2MjU2NjE5MTUsImlhdCI6MTYyNTY1NDcxNSwibXVsdGlGbGFnIjpmYWxzZSwidXJsIjoiLyIsInRlbmFudCI6ImV4cHJlc3MtZXhhbXBsZSIsImVtYWlsIjoiZXhhbXBsZS11c2VyQGV4YW1wbGUiLCJzZXNzaW9uU3RhdGUiOiI1MzgwZjE0OC03NjJmLTQyMTQtYWI5Ny1kNzg0NzUwNDQ1MTUifQ.caRJoP4bPkFzP8UohpgHW3TBnEFesOXLL9NyrHK4_fYLElnpEHzgN01lfKHEP-Voy7_FByResVbzGmhDb95rvMJ90N_gnRNtqe0Tqx5m-JrmvZeZbUAizxzIsQo75LSU8U1JtclWVQasgday-rBgnaR_t04qSuYo_QORqMJKZ2X15eHv1z6b-ZGuQFXh8z-uev81oFdCdw2WTe8hDxTfrA1ba67H00EJXzLMXZ3qbKOGqBKoWanU4sAm1IlahnqHOMJpz8bzIBmg3fh68sntsqel6tLoTXYC8zSL4PzkOO2UB2QHrqYpsGObhhTVTZ89gt96kpSBTdkFixS5_r_k5w",
            },
            signedCookies: {},
          },
        },
      }],
    });
    expect(res.status).toEqual(500);
    expect(res.body).toEqual('test');
  });

});
