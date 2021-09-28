import AWS from 'aws-sdk';
import {TokenJson} from "keycloak-lambda-authorizer/dist/src/Options";

import {StrorageDB, StrorageDBType} from "./Strorage";

const logger = console;

export type DynamoDbSettings = {
    tableName: string,
    region: string,
    apiVersion: string,
}

export class DynamoDB implements StrorageDB {
  private dynamoDbSettings: DynamoDbSettings;
  private dynamodb: AWS.DynamoDB;

  constructor(dynamoDbSettings: DynamoDbSettings) {
    this.dynamoDbSettings = dynamoDbSettings;
    AWS.config.update({region: dynamoDbSettings.region});
    this.dynamodb = new AWS.DynamoDB({apiVersion: dynamoDbSettings.apiVersion});
  }

  transformResponse(item: any): StrorageDBType {
    return {
      session: item.sessionId.S,
      keycloakSession: item.keycloakSessionId.S,
      email: item.email.S,
      exp: item.exp.N,
      externalToken: JSON.parse(item.externalToken.S),
    };
  }


  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.dynamodb.deleteItem({
        TableName: this.dynamoDbSettings.tableName,
        Key: {
          sessionId: {S: sessionId},
        },
      }).promise();
    } catch (e:any) {
      logger.log(e);
    }
  }

  async getSessionIfExists(sessionId: string): Promise<StrorageDBType | null> {
    try {
      const data = await this.dynamodb.getItem({
        TableName: this.dynamoDbSettings.tableName,
        Key: {
          sessionId: {S: sessionId},
        },
      }).promise();
      logger.log(`session: ${JSON.stringify(data)}`);
      const item = data.Item;
      return !item ||
            (
                Object.keys(item).length === 0 &&
                item.constructor === Object) ? null : this.transformResponse(item);
    } catch (e: any) {
      logger.log(e);
      return null;
    }
  }

  async saveSession(sessionId: string,
                      keycloakSession: string,
                      exp: number, email: string,
                      externalToken: TokenJson): Promise<void> {
    await this.dynamodb.putItem({
      TableName: this.dynamoDbSettings.tableName,
      Item: {
        sessionId: {
          S: sessionId,
        },
        exp: {
          N: String(exp),
        },
        email: {
          S: email,
        },
        keycloakSessionId: {
          S: keycloakSession,
        },
        externalToken: {
          S: JSON.stringify(externalToken),
        },
      },
    }).promise();
    logger.debug(`session: ${sessionId} (${email}) saved`);
  }

  async updateSession(sessionId: string, email: string, externalToken: TokenJson): Promise<void> {
    logger.debug(`begin update session: ${sessionId} (${email}) ${JSON.stringify(externalToken)}`);
    await this.dynamodb.updateItem({
      TableName: this.dynamoDbSettings.tableName,
      Key: {
        sessionId: {S: sessionId},
      },
      UpdateExpression: 'SET externalToken = :e',
      ExpressionAttributeValues: {
        ':e': {S: `${JSON.stringify(externalToken)}`},
      },
    }).promise();
    logger.debug(`session: ${sessionId} (${email}) saved`);
  }

}
