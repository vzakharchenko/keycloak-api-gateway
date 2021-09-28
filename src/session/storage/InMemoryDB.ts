import fs from 'fs';

import {TokenJson} from "keycloak-lambda-authorizer/dist/src/Options";

import {pathUtils} from './PathUtils';
import {StrorageDB, StrorageDBType} from "./Strorage";


const logger = console;

type InMemoryType = {
    [key: string]: StrorageDBType
}


export class InMemoryDB implements StrorageDB {
  private inMemory: InMemoryType = this.updateStorage();

  readStorage() {
    try {
      return fs.readFileSync(`${pathUtils.currentDir() || '.'}/storage.json`, 'utf8');
    } catch (e:any) {
      if (e.code === 'ENOENT') {
        logger.log('Expected storage.json to be included in Lambda deployment package');
                // fallthrough
      }
      return '{}';
    }
  }

  updateStorage(): InMemoryType {
    const timeLocal = new Date().getTime();
    const timeSec = Math.floor(timeLocal / 1000);
    const jsonFile = this.readStorage();
    const json = JSON.parse(jsonFile);
    Object.keys(json).forEach((sessionId) => {
      const {exp} = json[sessionId];
      if (exp < timeSec) {
        delete json[sessionId];
      }
    });
    this.saveStorage(json);
    return json;
  }

  saveStorage(storage: InMemoryType) {
    try {
      fs.writeFileSync(`${pathUtils.currentDir() || '.'}/storage.json`, JSON.stringify(storage), 'utf8');
    } catch (e:any) {
      if (e.code === 'ENOENT') {
        logger.log('Expected storage.json to be included in Lambda deployment package');
                // fallthrough
      }
      throw new Error(e);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    delete this.inMemory[sessionId];
    this.saveStorage(this.inMemory);
  }

  async getSessionIfExists(sessionId: string): Promise<StrorageDBType> {
    return this.inMemory[sessionId];
  }

  async saveSession(sessionId: string,
                      keycloakSession: string,
                      exp: number,
                      email: string,
                      externalToken: TokenJson):
        Promise<void> {
    this.inMemory[sessionId] = {
      session: sessionId,
      exp,
      keycloakSession,
      email,
      externalToken,
    };
    this.saveStorage(this.inMemory);
  }

  async updateSession(sessionId: string, email: string, externalToken: TokenJson): Promise<void> {
    const sessionObject = this.inMemory[sessionId];
    if (sessionObject) {
      sessionObject.externalToken = externalToken;
    } else {
      throw new Error("Session Does not Exists");
    }
    this.saveStorage(this.inMemory);
  }

}
