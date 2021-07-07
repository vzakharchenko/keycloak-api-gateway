import {decode} from 'jsonwebtoken';
import {v4} from 'uuid';

import {Options, RequestObject} from "../index";
import {getSessionName, KeycloakState} from "../utils/KeycloakUtils";

import {StrorageDB} from "./storage/Strorage";
import {InMemoryDB} from './storage/InMemoryDB';
import {DynamoDB} from './storage/DynamoDB';

const {clientJWT} = require('keycloak-lambda-authorizer/src/clientAuthorization');


export type SessionToken = {
    jti: string,
    email: string,
    exp: number,
    multiFlag: boolean,
    // eslint-disable-next-line babel/camelcase
    session_state: string,
    sessionState: string,
    tenant?: string,
    token?: string,
}

export type SessionPrivateKey = {
    key: string,
    passphrase?: string;
}
export type SessionTokenKeys = {
    privateKey: SessionPrivateKey,
    publicKey: SessionPrivateKey,
}

export function getSessionToken(sessionTokenString: string,
                                addTokenString?: boolean): SessionToken | null {
  try {
    const decodeToken: any = decode(sessionTokenString) as any;
    return sessionTokenString ? {
      ...decodeToken,
      ...(addTokenString ? {token: sessionTokenString} : {}),
    } as SessionToken : null;
  } catch (e) {
        // eslint-disable-next-line no-console
    console.log(`error ${e}`);
    return null;
  }
}

export type SessionConfiguration = {
    storageType: string|StrorageDB,
    sessionCookieName?: string,
    storageTypeSettings?: any,
    keys: SessionTokenKeys,
}

export type TokenType = {
    // eslint-disable-next-line babel/camelcase
    access_token: string,
    // eslint-disable-next-line babel/camelcase
    refresh_token: string,
}

/**
 * Session Manager
 */
export interface SessionManager {

    /**
     * exchange  session Token to  Access Token
     * @param session session token
     */
    getSessionAccessToken(session: SessionToken): Promise<any>

    /**
     * update access and refresh tokens inside storage
     * @param sessionId storageID
     * @param email user email
     * @param externalToken access and refresh tokens
     */
    updateSession(sessionId: string, email: string, externalToken: any): Promise<void>;

    /**
     * Create storage record with access_token,refresh_token and return signed SessionToken
     * @param req - http request
     * @param state - keycloak session id
     * @param token access_token and refresh_token
     */
    createSession(req: RequestObject, state: KeycloakState, token: TokenType): Promise<any>
}

export class DefaultSessionManager implements SessionManager {
  private defaultSessionType: SessionConfiguration;
  private options: Options;

  constructor(options: Options) {
    if (!options.session.sessionConfiguration.keys) {
      throw new Error("Private/Public keys are not defined");
    }
    getSessionName(options);
    this.defaultSessionType = options.session.sessionConfiguration;
    this.options = options;
  }

  async getCurrentStorage(): Promise<StrorageDB> {
    if (this.defaultSessionType.storageType instanceof String) {
      switch (this.defaultSessionType.storageType) {
        case 'InMemoryDB': {
          return new InMemoryDB();
        }
        case 'DynamoDB': {
          if (!this.options.session.sessionConfiguration.storageTypeSettings) {
            throw new Error('dynamoDbSettings setting does not defined');
          }
          return new DynamoDB(this.options.session.sessionConfiguration.storageTypeSettings);
        }
        default: {
          throw new Error(`${this.defaultSessionType.storageType} does not support`);
        }
      }
    } else {
      return <StrorageDB> this.defaultSessionType.storageType;
    }
  }

  async updateSession(sessionId: string, email: string, externalToken: any): Promise<void> {
    await (await this.getCurrentStorage()).updateSession(sessionId, email, externalToken);
  }

  createJWS(sessionId: string) {
    const timeLocal = new Date().getTime();
    const timeSec = Math.floor(timeLocal / 1000);
    return {
      jti: sessionId,
      exp: timeSec + 7200,
      iat: timeSec,
    };
  }

  async createSession(req: RequestObject, state: KeycloakState, token: TokenType): Promise<any> {
    const sessionToken = getSessionToken(req.cookies[getSessionName(this.options)], false);
    const accessToken = getSessionToken(token.access_token);
    const refreshToken = getSessionToken(token.refresh_token);
    if (!accessToken || !refreshToken) {
      throw new Error('accessToken or refreshToken does not exists');
    }
    const sessionId = v4();
    const ret = await clientJWT({
      ...(sessionToken || {}),
      ...this.createJWS(sessionId),
      ...state,
      email: accessToken.email,
      sessionState: accessToken.session_state,
    }, {keys: this.defaultSessionType.keys});
    await (await this.getCurrentStorage())
      .saveSession(sessionId,
                accessToken.session_state,
                refreshToken.exp,
                accessToken.email,
                token);
    return ret;
  }

  async getSessionAccessToken(session: SessionToken): Promise<any> {
    const token = session;
    const sessionId = token.jti;
    const {sessionState} = token;
    const sessionValue = await (await this.getCurrentStorage()).getSessionIfExists(sessionId);
    if (sessionValue) {
      if (sessionValue.keycloakSession === sessionState) {
        return sessionValue.externalToken;
      }
            // eslint-disable-next-line no-console
      console.log(`keycloak session is not the same. Expected ${sessionValue.keycloakSession} but found ${sessionState}`);
    }
    return null;
  }

}
