const fs = require('fs');

const adapter = require('keycloak-api-gateway/dist');
const {CustomStorageDB} = require("customstorage/dist");

const options = JSON.parse(fs.readFileSync('./ApiConfig.json', 'utf-8'));
options.storageType = new CustomStorageDB();
const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    options,
);

module.exports.handler =
    async (awsEvent) => {
      return await keycloakApiGateWayAdapter
            .awsLambdaEdgeAdapter()
            .handler(awsEvent);
    };
