
import qs from 'querystring';

import cookie from 'cookie';
import cookieParser from 'cookie-parser';

import {getCurrentHost} from "../utils/KeycloakUtils";
import {ApiGateway} from "../apigateway/ApiGateway";

/**
 * lambda@edge adapter handler
 */
export interface LambdaEdgeAdapter {

  /**
   * Lambda Handler
   * @param event
   */
    handler(event: any): Promise<any>;
}

export class DefaultLambdaEdgeAdapter implements LambdaEdgeAdapter {
  private apiGateway: ApiGateway;

  constructor(apiGateway: ApiGateway) {
    this.apiGateway = apiGateway;
  }

  transformRequest(request: any) {
    const newRequest = JSON.parse(JSON.stringify(request));
    newRequest.baseUrl = newRequest.uri;
    newRequest.url = newRequest.uri;
    newRequest.secure = true;
    const headers: any = {};
    Object.entries(request.headers).forEach((k: any) => {
      headers[k[0]] = k[1][0].value;
    });
    newRequest.query = qs.parse(newRequest.querystring);
    newRequest.headers = headers;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
    cookieParser()(newRequest, undefined, () => {
    });
    newRequest.url = `${getCurrentHost(newRequest)}${newRequest.uri}`;
    newRequest.baseUrl = newRequest.uri;
    // eslint-disable-next-line no-console
    console.log(`newRequest=${JSON.stringify(newRequest)}`);
    return newRequest;
  }

  async handler(event: any) {
    const req = this.transformRequest(event.Records[0].cf.request);
    const response: any = {
      statusCode: 200,
      headers: {},
      body: '',
      redirect: (code: any, location: any) => {
        response.statusCode = code;
        response.headers.location = [location];
        response.body = `Found. Redirecting to <a href="${location}">`;
      },
      json: (json: any) => {
        response.headers['Content-Type'] = ['application/json'];
        response.body = JSON.stringify(json);
        response.statusCode = 200;
      },
      cookie: (name: any, value: any, options: any) => {
        const opts = {...options};
        const val = typeof value === 'object'
                    ? `j:${JSON.stringify(value)}`
                    : String(value);

        if ('maxAge' in opts) {
          opts.expires = new Date(opts.maxAge - 10);
          opts.maxAge /= 1000;
        }

        if (opts.path == null) {
          opts.path = '/';
        }
        opts.domain = req.headers.host;
        opts.secure = true;
        const v = cookie.serialize(name, String(val), opts);
        if (response.headers['Set-Cookie']) {
          response.headers['Set-Cookie'].push(v);
        } else {
          response.headers['Set-Cookie'] = [v];
        }

        return this;
      },
    };
    let state = false;
    const next: any = () => {
      state = true;
    };
    try {
      await this.apiGateway.middleware(req, response, next);
      const responseData: any = {
        status: response.statusCode,
        body: response.body,
      };
      responseData.headers = {};
      Object.entries(response.headers).forEach((kv) => {
        const key = kv[0];
        const value: any = kv[1];
        const res = value.map((v: any) => ({
          key, value: v,
        }));
        responseData.headers[key] = res;
        return res;
      });
      delete responseData.headers['x-powered-by'];
      delete responseData.headers['content-length'];
      delete responseData.headers['transfer-encoding'];
      delete responseData.headers.via;
      delete responseData.headers.warning;
      return state ? event.Records[0].cf.request : responseData;
    } catch (e:any) {
      // eslint-disable-next-line no-console
      console.log(`Error ${e.message}`);
      // eslint-disable-next-line no-console
      console.log(`ErrorObject ${e}`);
      return {
        status: 500,
        body: e.message,
      };
    }


  }

}


