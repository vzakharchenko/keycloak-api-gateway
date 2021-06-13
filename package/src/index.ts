import {SessionConfiguration, SessionManager} from "./session/SessionManager";
import {MultiTenantAdapter, MultiTenantSelectorType} from "./multitenants/Multi-tenant-adapter";
import {TenantAdapter} from "./tenant/TenantAdapter";
import {Logout} from "./logout/Logout";
import {JWKS} from "./jwks/JWKS";
import {Callback} from "./callback/Callback";

export type AccessLevel = 'public' | 'single' | 'multi-tenant'
export type CustomHandlerType = 'executor' | 'protection'
export type ExecuteType = (tenant: string) => Promise<any> | any;

export interface PageHandler {
    getUrl():string;
    getAccessLevel():AccessLevel;
    customHandlerType():CustomHandlerType;
}

export type PageHandlers = PageHandler[]


export type SessionOptions = {
    sessionManager?: SessionManager,
    sessionConfiguration: SessionConfiguration,
}

export type DefaultSessionOptions = {
    sessionManager?: SessionManager,
    sessionConfiguration: SessionConfiguration,
}

export type MultiTenantSelectorOptions = {
    headerName?: string;
}

export type MultiTenantOptions = {
    multiTenantJson: (tenant: string) => Promise<any> | any;
    // eslint-disable-next-line no-warning-comments, line-comment-position
    multiTenantAdapterOptions: any; // todo
    multiTenantSelectorType?: MultiTenantSelectorType;
    multiTenantAdapter?: MultiTenantAdapter;
    multiTenantSelectorOptions?: MultiTenantSelectorOptions;
}

export type Options = {
    multiTenantOptions?: MultiTenantOptions;
    // eslint-disable-next-line no-warning-comments, line-comment-position
    defaultAdapterOptions?: any; // todo
    singleTenantAdapter?: TenantAdapter;
    pageHandlers?: PageHandlers;
    session: SessionOptions;
    logout?: Logout;
    jwks?: JWKS;
    callback?: Callback;
}

export type CookieType = {
    [key: string]: string
}

export type QueryType = {
    [key: string]: string
}
export type HeadersType = {
    [key: string]: string
}

export type RequestObject = {
    baseUrl: string,
    originalUrl: string,
    cookies: CookieType,
    query: QueryType,
    headers: HeadersType,
    secure: boolean
}

export type ResponseObject = {
    cookie: (name: string, value: string, options?: any) => void;
    json: (object: any) => void;
    redirect: (code: number, url: string) => void;
}

export interface CustomPageHandler extends PageHandler{
    execute(
        token:any,
        req:RequestObject,
        res:ResponseObject,
        next:any):Promise<void>|void;
}
