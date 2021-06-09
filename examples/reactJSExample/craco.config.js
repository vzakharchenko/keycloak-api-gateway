const adapter = require('keycloak-api-gateway/dist/index');
const fs = require('fs');

const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    JSON.parse(fs.readFileSync('./ApiConfig.json','utf-8'))
);


module.exports = {
    devServer: (devServerConfig) => {
        keycloakApiGateWayAdapter.webPackDevServerMiddleWare(devServerConfig);
        return devServerConfig;
    },
    keycloakApiGateWayAdapter
};
