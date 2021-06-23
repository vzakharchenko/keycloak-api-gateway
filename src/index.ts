import {SessionConfiguration, SessionManager, SessionToken} from "./session/SessionManager";
import {MultiTenantAdapter} from "./multitenants/Multi-tenant-adapter";
import {TenantAdapter} from "./tenant/TenantAdapter";
import {Logout} from "./logout/Logout";
import {JWKS} from "./jwks/JWKS";
import {Callback} from "./callback/Callback";
import {PageHandlers} from "./handlers/PageHandler";

export type AccessLevel = 'public' | 'single' | 'multi-tenant';
export type ExecuteType = (tenant: string) => Promise<any> | any;

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

export type IdentityProviders = {
    multiTenant?: string;
    singleTenant?: string;
}

export type MultiTenantOptions = {
    multiTenantJson: (tenant: string) => Promise<any> | any;
    // eslint-disable-next-line no-warning-comments, line-comment-position
    multiTenantAdapterOptions: any; // todo
    multiTenantAdapter?: MultiTenantAdapter;
    multiTenantSelectorOptions?: MultiTenantSelectorOptions;
    idp?:string;
}
export type SingleTenantOptions = {
    // eslint-disable-next-line no-warning-comments, line-comment-position
    defaultAdapterOptions?: any; // todo
    singleTenantAdapter?: TenantAdapter;
    idp?:string;
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

export type Options = {
    multiTenantOptions?: MultiTenantOptions;
    singleTenantOptions?: SingleTenantOptions;
    pageHandlers?: PageHandlers;
    session: SessionOptions;
    logout?: Logout;
    jwks?: JWKS;
    callback?: Callback;
}

