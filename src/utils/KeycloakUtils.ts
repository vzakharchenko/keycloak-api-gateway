import {v4} from "uuid";

import {AccessLevel,
  Options,
  RequestObject,
} from "../index";
import {getSessionToken} from "../session/SessionManager";
import {PageHandler} from "../handlers/PageHandler";
import {StrorageDB} from "../session/storage/Strorage";
import {InMemoryDB} from "../session/storage/InMemoryDB";
import {DynamoDB} from "../session/storage/DynamoDB";

export type KeycloakState = {
    multiFlag: boolean,
    url: string,
    tenant: string,
}

export function getHostName(req: RequestObject) {
  return req.headers.host;
}

export function getCurrentHost(req: RequestObject) {
  return `http${req.secure ? 's' : ''}://${getHostName(req)}`;
}

export function getSessionName(options: Options) {
  if (!options.session.sessionConfiguration.sessionCookieName) {
    options.session.sessionConfiguration.sessionCookieName = "KAP";
  }
  return options.session.sessionConfiguration.sessionCookieName;
}

async function findPageHandler(accessLevel: AccessLevel,
                               context :{
                                   request: RequestObject,
                                    options: Options
}): Promise<PageHandler | null> {
  const options = context.options;
  const request = context.request;
  if (!options.pageHandlers) {
    return null;
  }
  const currentUrl = request.baseUrl || request.originalUrl;
  const sessionToken = getSessionToken(request.cookies[getSessionName(options)], true);

  for (let i = 0; i < options.pageHandlers.length; i++) {
    const pH = options.pageHandlers[i];
    const url = pH.getUrl();
    const pHAH = await pH.behavior(request, {sessionToken, options});
    if (pHAH === accessLevel) {
      if ((currentUrl === url ||
                        currentUrl.startsWith(url)) ||
                         currentUrl.match(url) != null) {
        return pH;
      }
    }
  }
  return null;
}

export async function isCustomBehavior(accessLevel: AccessLevel,
                                       context: {request: RequestObject
                                       options: Options}): Promise<AccessLevel | null> {
  if (context.options.pageHandlers) {
    const pageHandler = await findPageHandler(accessLevel, context);
    if (pageHandler) {
      return accessLevel;
    }
  }
  return null;
}

export async function getCustomPageHandler(accessLevel: AccessLevel, request: RequestObject,
                                           options: Options): Promise<PageHandler | null> {
  if (options.pageHandlers) {
    const currentPageHandler = await findPageHandler(accessLevel, {request, options});
    if (currentPageHandler) {
      return <PageHandler>currentPageHandler;
    }
  }
  return null;
}

export async function getCurrentStorage(options: Options): Promise<StrorageDB> {
  if (typeof options.session.sessionConfiguration.storageType === 'string') {
    switch (options.session.sessionConfiguration.storageType) {
      case 'InMemoryDB': {
        return new InMemoryDB();
      }
      case 'DynamoDB': {
        if (!options.session.sessionConfiguration.storageTypeSettings) {
          throw new Error('dynamoDbSettings setting does not defined');
        }
        return new DynamoDB(options.session.sessionConfiguration.storageTypeSettings);
      }
      default: {
        throw new Error(`${options.session.sessionConfiguration.storageType} does not support`);
      }
    }
  } else {
    return <StrorageDB> options.session.sessionConfiguration.storageType;
  }
}

