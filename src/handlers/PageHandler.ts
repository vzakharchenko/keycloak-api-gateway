import {AccessLevel, Options, RequestObject, ResponseObject} from "../index";
import {SessionToken} from "../session/SessionManager";

/**
 * behavior context
 */
export type BehaviorContext = {

    /**
     * current session token
     */
    sessionToken?: SessionToken|null,

    /**
     * Options
     */
    options:Options
}

/**
 * Custom Page Handler Context
 */
export type CustomPageHandlerContext = {

    /**
     * current session token
     */
    sessionToken?: SessionToken|null,

    /**
     * Options
     */
    options:Options
}


/**
 * Custom Page Handler
 * Implementation of this interface allow to you change behavior of your static resource o
 * r create dynamically static resource
 */
export interface PageHandler {

    /**
     * url or regexp of url
     *
     * example:
     * /index.html  - page handler for /index.html
     * / - page handler for  all resources
     * (/public)(.*) - page handler for all resources inside public
     */
    getUrl():string;

    /**
     * The order of execution the page handler, the higher the earlier it will be executed
     *  For root path ("/") order should be 0, because otherwise it overrides all other PageHandler
     */
    order():number;

    /**
     * Dynamic function to set  Access level for PageHandler
     *  'public' - without authorization/authentication
     *  'multi-tenant' - expected multi-tenant/cross-tenant authorization/authentication
     *  'single' - expected single tenant authorization/authentication
     *
     *  for public access you can use PublicUrlPageHandler.ts or
     *    behavior(req: RequestObject,
     *       context: BehaviorContext): AccessLevel {
     *       return 'public';
     *    }
     *
     *  for multi-tenant access you can use MultiTenantUrlPageHandler.ts or
     *    behavior(req: RequestObject,
     *       context: BehaviorContext): AccessLevel {
     *       return 'multi-tenant';
     *    }
     *
     *  for multi-tenant access you can use SingleTenantUrlPageHandler.ts or
     *    behavior(req: RequestObject,
     *       context: BehaviorContext): AccessLevel {
     *       return 'single';
     *    }
     * @param req http Request
     * @param context behavior context
     */
    behavior(req:RequestObject,
             context:BehaviorContext):Promise<AccessLevel> | AccessLevel;

    /**
     * Implementing what the Page Handler should do
     * @param req - http request
     * @param res -http response
     * @param next - allow request
     * @param context - custom page handler context
     */
    execute(
        req:RequestObject,
        res:ResponseObject,
        next:any,
        context: CustomPageHandlerContext):Promise<void>|void;
}

export type PageHandlers = PageHandler[]
