import {TokenJson} from "keycloak-lambda-authorizer/dist/src/Options";

export type StrorageDBType = {
    session: string,
    exp:number,
    keycloakSession:string,
    email:string,
    externalToken: TokenJson,
}

export interface StrorageDB {

    /**
     * save access and refresh token and link them to sessionId
     * @param sessionId a new sessionId
     * @param keycloakSession related keycloak session
     * @param exp - session expiration time
     * @param email user email
     * @param externalToken access and refresh token
     */
    saveSession(sessionId: string,
                keycloakSession: string,
                exp: number,
                email: string,
                externalToken: TokenJson):Promise<void>;

    /**
     * update session with new access and refresh token
     * @param sessionId session Id
     * @param email user email
     * @param externalToken new access and refresh token
     */
    updateSession(sessionId:string, email:string, externalToken:TokenJson):Promise<void>;

    /**
     * get access and refresh token by sessionId
     * @param sessionId session Id
     */
    getSessionIfExists(sessionId:string):Promise<StrorageDBType|null>;

    /**
     * delete session
     * @param sessionId session Id
     */
    deleteSession(sessionId:string):Promise<void>;
}
