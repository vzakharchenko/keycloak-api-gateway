const {TenantExternalPage} = require("keycloak-api-gateway/dist/src/handlers/TenantExternalPage");
const fs = require('fs');
const adapter = require('keycloak-api-gateway/dist');
const {SingleTenantRestApiHandler} = require("keycloak-api-gateway/dist/src/handlers/SingleTenantRestApiHandler");


const apiConfig = {
    ...JSON.parse(fs.readFileSync(
        './ApiConfig.json'
        , 'utf-8')),
};

const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    apiConfig
)
    .addCustomPageHandler(new SingleTenantRestApiHandler("/api",
        {
            url: "http://localhost:8083",
            method: 'get',
        }
        , 32000))


module.exports = keycloakApiGateWayAdapter
