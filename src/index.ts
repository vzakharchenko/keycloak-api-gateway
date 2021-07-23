import {
    AdapterDependencies,
    ClientJwtKeys, EnforcerFunction,
    KeycloakJsonStructure,
    LoggerType,
} from "keycloak-lambda-authorizer/dist/src/Options";
import {AdapterCache} from "keycloak-lambda-authorizer/dist/src/cache/AdapterCache";
import {RestCalls} from "keycloak-lambda-authorizer/dist/src/utils/restCalls";
import {EnforcerAction} from "keycloak-lambda-authorizer/dist/src/enforcer/Enforcer";
import {UmaConfiguration} from "keycloak-lambda-authorizer/dist/src/uma/UmaConfiguration";
import {ClientAuthorization} from "keycloak-lambda-authorizer/dist/src/clients/ClientAuthorization";
import {ServiceAccount} from "keycloak-lambda-authorizer/dist/src/serviceaccount/ServiceAccount";
import {SecurityAdapter} from "keycloak-lambda-authorizer/dist/src/adapters/SecurityAdapter";
import {ResourceChecker} from "keycloak-lambda-authorizer/dist/src/enforcer/resource/Resource";


import {PageHandlers} from "./handlers/PageHandler";
import {Callback} from "./callback/Callback";
import {Logout} from "./logout/Logout";
import {TenantAdapter} from "./tenant/TenantAdapter";
import {MultiTenantAdapter} from "./multitenants/Multi-tenant-adapter";
import {SessionConfiguration, SessionManager} from "./session/SessionManager";
import {UrlJWKS} from "./jwks/UrlJWKS";

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

export type MultitenantAdapterDependencies = {
    keys?: ClientJwtKeys,
    cache?: AdapterCache,
    logger?: LoggerType,
    restClient?: RestCalls,
    enforcer?: EnforcerAction,
    defaultAuthorization?: EnforcerFunction;
    umaConfiguration?: UmaConfiguration,
    clientAuthorization?: ClientAuthorization,
    serviceAccount?: ServiceAccount,
    securityAdapter?: SecurityAdapter,
    resourceChecker?: ResourceChecker,
}

export type MultiTenantOptions = {
    multiTenantJson: (tenant: string) => Promise<KeycloakJsonStructure> | KeycloakJsonStructure;
    multiTenantAdapterOptions: MultitenantAdapterDependencies;
    multiTenantAdapter?: MultiTenantAdapter;
    multiTenantSelectorOptions?: MultiTenantSelectorOptions;
    idp?:string;
}
export type SingleTenantOptions = {
    defaultAdapterOptions: AdapterDependencies;
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
    clientIp?: string,
    originalUrl: string,
    method?: string,
    uri?: string,
    url?: string,
    querystring?: string,
    signedCookies?:any,
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
    jwks?: UrlJWKS;
    defaultAuthorization?: EnforcerFunction;
    callback?: Callback;
}

