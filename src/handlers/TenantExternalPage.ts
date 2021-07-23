import {EnforcerFunction} from "keycloak-lambda-authorizer/dist/src/Options";

import {AccessLevel, RequestObject, ResponseObject} from "../index";
import {getCurrentHost} from "../utils/KeycloakUtils";

import {BehaviorContext, CustomPageHandlerContext, PageHandler} from "./PageHandler";
import {getActiveToken} from "./TokenPageHandler";

/**
 * External Page Context
 */
export type TenantExternalPageContext = {

  /**
   * where to return after success authenticate
   */
    redirectedUrl: string,

  /**
   * application name
   * send as request param "app"
   */
    applicationName?: string,

  /**
   * Expected AccessLevel, by default 'multi-tenant'
   */
    defaultAccessLevel?: AccessLevel,

  /**
   * triggered access level
   * by default 'public'
   */
    sessionAccessLevel?: AccessLevel,

  /**
   * always redirect (skip checking sessionAccessLevel)
   */
    alwaysRedirect?: boolean,

  /**
   * redirect url
   */
    providePath?: boolean,
}

/**
 * Redirect to external Service to authenticate user
 *
 * Examples:
 *  1.  If open page /tenantSelector then  redirect to http://localhost:8082/?app=application
 *
 *   const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(options)
 *   .addCustomPageHandler(new TenantExternalPage("/tenantSelector",
 *   {
 *              redirectedUrl: "http://localhost:8082",
 *              applicationName: 'application',
 *              defaultAccessLevel: 'public',
 *              sessionAccessLevel: 'public',
 *              alwaysRedirect: true,
 *          }
 *   , 32000))
 *
 *  2. If you not authorized then redirect to http://localhost:8082/?app=application
 *
 *  const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(options)
 *   .addCustomPageHandler(new TenantExternalPage("/",
 *   {
 *              redirectedUrl: "http://localhost:8082",
 *              applicationName: 'application',
 *              defaultAccessLevel: 'multi-tenant',
 *              sessionAccessLevel: 'public',
 *          }
 *   , 0))
 *  .addCustomPageHandler(new TenantExternalPage("/index.html",
 *   {
 *              redirectedUrl: "http://localhost:8082",
 *              applicationName: 'application',
 *          }
 *   , 32000))
 *
 *
 * 3.
 *
 */
export class TenantExternalPage implements PageHandler {
  readonly url: string;
  readonly tenantExternalPage: TenantExternalPageContext;
  readonly orderValue: number | undefined;
  readonly enforcer?: EnforcerFunction;

  constructor(url: string,
                context: TenantExternalPageContext,
                orderValue?: number,
                enforcer?: EnforcerFunction) {
    this.url = url;
    this.orderValue = orderValue;
    this.tenantExternalPage = context;
    this.enforcer = enforcer;
  }

  getUrl() {
    return this.url;
  }

  order() {
    return this.orderValue || 0;
  }

  behavior(req: RequestObject, context: BehaviorContext): AccessLevel {
    let accessLevel: AccessLevel = this.tenantExternalPage.defaultAccessLevel || 'multi-tenant';
    if (!context.sessionToken) {
      accessLevel = this.tenantExternalPage.sessionAccessLevel || 'public';
    }
    return accessLevel;
  }

  async execute(
        req: RequestObject,
        res: ResponseObject,
        next: any,
        context: CustomPageHandlerContext,
    ):Promise<void> {
    if (!this.tenantExternalPage.alwaysRedirect && context.sessionToken) {
      const token = await getActiveToken(req, res, next, context, this.enforcer);
      if (token) {
        next();

      }
    } else {
      res.redirect(302, `${this.tenantExternalPage.redirectedUrl}?redirectUri=${getCurrentHost(req)}${this.tenantExternalPage.providePath
          ? (req.baseUrl || req.originalUrl) : ''}${this.tenantExternalPage.applicationName ? `&app=${this.tenantExternalPage.applicationName}` : ''}`);
    }
  }
}
