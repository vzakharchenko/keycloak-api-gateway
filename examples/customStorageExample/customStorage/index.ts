import {StrorageDB, StrorageDBType} from 'keycloak-api-gateway/dist/src/session/storage/Strorage';

type InMemoryType = {
    [key: string]: StrorageDBType
}


export class CustomStorageDB implements StrorageDB {

  private inMemory: InMemoryType = {};

  async deleteSession(sessionId: string): Promise<void> {
    delete this.inMemory[sessionId];
  }

  async getSessionIfExists(sessionId: string): Promise<StrorageDBType | null> {
    return this.inMemory[sessionId];
  }

  async saveSession(sessionId: string, keycloakSession: string, exp: number, email: string, externalToken: any): Promise<void> {
    this.inMemory[sessionId] = {
      session: sessionId,
      exp,
      keycloakSession,
      email,
      externalToken,
    };
  }

  async updateSession(sessionId: string, email: string, externalToken: any): Promise<void> {
    const sessionObject = this.inMemory[sessionId];
    if (sessionObject) {
      sessionObject.externalToken = externalToken;
    } else {
      throw new Error("Session Does not Exists");
    }
  }

}
