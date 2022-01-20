const fs = require('fs');

const adapter = require('keycloak-api-gateway/dist');

const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    JSON.parse(fs.readFileSync('./ApiConfig.json', 'utf-8')),
);

module.exports.handler =
    async (awsEvent) => {
      return await keycloakApiGateWayAdapter
            .awsLambdaEdgeAdapter()
            .handler(awsEvent);
    };
