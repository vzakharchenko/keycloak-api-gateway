import {DefaultSessionManager} from "../session/SessionManager";
import {Options, RequestObject, ResponseObject} from "../index";
import {getCurrentHost, getSessionName, getTokenByCode, KeycloakState} from "../utils/KeycloakUtils";

const {commonOptions} = require('keycloak-lambda-authorizer/src/utils/optionsUtils');

export interface Callback {

  /**
   * check the current request is oauth2.0 authentication callback
   * @param request http request
   * expected url path /callbacks/<Tenant>/<Tenant Client>/callback
   */
    isCallBack(request: RequestObject): boolean;

  /**
   * oauth2.0 authentication callback
   * @param req http request
   * @param res http response
   */
    callback(req: RequestObject, res: ResponseObject): Promise<void>;
}

export class DefaultCallback implements Callback {

  private options: Options;

  constructor(options: Options) {
    this.options = options;
    if (!this.options.session.sessionManager) {
      this.options.session.sessionManager = new DefaultSessionManager(
                this.options,
            );
    }
  }

  isCallBack(request: RequestObject) {
    return (request.baseUrl || request.originalUrl).startsWith('/callbacks');
  }

  async callback(req: RequestObject, res: ResponseObject): Promise<void> {
    if (!this.options.session.sessionManager) {
      throw new Error('sessionManager is not defined');
    }

    const {code} = req.query;
    const state: KeycloakState = JSON.parse(req.query.state);
    const {url} = state;
    let sessionId;
    let token;
    try {
      const currentHost = getCurrentHost(req);
      if (state.multiFlag) {
        if (!this.options.multiTenantOptions) {
          throw new Error('Multi-tenant Options does not defined');
        }
        const keycloakJson = await this.options.multiTenantOptions.multiTenantJson(state.tenant);
        token = await getTokenByCode(code, currentHost, {
          ...commonOptions(this.options.multiTenantOptions.multiTenantAdapterOptions, keycloakJson),
        }, keycloakJson);
        sessionId = await this.options.session.sessionManager.createSession(req, state, token);
      } else {
        if (!this.options.singleTenantOptions){
          throw new Error('singleTenantOptions does not defined')
        }
        if (!this.options.singleTenantOptions.defaultAdapterOptions) {
          throw new Error('Default Adapter Options does not defined');
        }
        token = await getTokenByCode(code, currentHost,
          {
            ...commonOptions(this.options.singleTenantOptions.defaultAdapterOptions,
                            this.options.singleTenantOptions.defaultAdapterOptions.keycloakJson),
          },
                    this.options.singleTenantOptions.defaultAdapterOptions.keycloakJson);
        sessionId = await this.options.session.sessionManager.createSession(req, state, token);
      }
      res.cookie(getSessionName(this.options), sessionId);
      res.redirect(302, url);
    } catch (e) {
            // eslint-disable-next-line no-console
      console.log(`error: ${e}`);
      res.redirect(302, `/error?message=${e.message}`);
    }
  }
}
