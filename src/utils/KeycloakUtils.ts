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

const {clientJWT} = require('keycloak-lambda-authorizer/src/clientAuthorization');
const {commonOptions} = require('keycloak-lambda-authorizer/src/utils/optionsUtils');
const {getKeycloakUrl, sendData} = require('keycloak-lambda-authorizer/src/utils/restCalls');

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

async function createJWS(options: any) {
  const timeLocal = new Date().getTime();
  const timeSec = Math.floor(timeLocal / 1000);
  const keycloakJson = await options.keycloakJson(options);
  return {
    jti: v4(),
    iss: keycloakJson.resource,
    sub: keycloakJson.resource,
    aud: `${getKeycloakUrl(keycloakJson)}/realms/${keycloakJson.realm}`,
    exp: timeSec + 30,
    iat: timeSec,
  };
}

async function clientIdAuthorization(options: any) {
  const keycloakJson = await options.keycloakJson(options);
  let authorization = `client_id=${keycloakJson.resource}`;
  if (keycloakJson.credentials && keycloakJson.credentials.secret) {
    const {secret} = keycloakJson.credentials;
    if (secret) {
      authorization += `&client_secret=${secret}`;
    }
  } else if (options.keys && options.keys.privateKey) {
    authorization += `&client_assertion=${await clientJWT(await createJWS(options), options)}`;
  } else {
    throw new Error('Unsupported Credential Type');
  }
  return authorization;
}

export async function getTokenByCode(code: string,
                                     host: string,
                                     adapterOptions: any,
                                     keycloakJson: any) {
  const options = commonOptions(adapterOptions, keycloakJson);
  const keycloakJson0 = options.keycloakJson(options);
  const url = `${getKeycloakUrl(keycloakJson0)}/realms/${keycloakJson0.realm}/protocol/openid-connect/token`;
  const authorization = await clientIdAuthorization(options);
  const data = `code=${code}&grant_type=authorization_code&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&${authorization}&redirect_uri=${encodeURIComponent(`${host}/callbacks/${keycloakJson0.realm}/${keycloakJson0.resource}/callback`)}`;
  const tokenResponse = await sendData(url,
        'POST',
        data,
        {'Content-Type': 'application/x-www-form-urlencoded'});
  const tokenJson = tokenResponse;
  return JSON.parse(tokenJson);
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

export async function getKeycloakJsonFunction(keycloakJson: any): Promise<any> {
  const ret = await commonOptions({}, keycloakJson).keycloakJson();
  return ret;
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

