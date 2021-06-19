
export type StrorageDBType = {
    session: string,
    exp:number,
    keycloakSession:string,
    email:string,
    externalToken:any,
}

export interface StrorageDB {
    saveSession(sessionId: string,
                keycloakSession: string,
                exp: number,
                email: string,
                externalToken: any):Promise<void>;

    updateSession(sessionId:string, email:string, externalToken:any):Promise<void>;
    getSessionIfExists(sessionId:string):Promise<StrorageDBType|null>;
    deleteSession(sessionId:string):Promise<void>;
}
