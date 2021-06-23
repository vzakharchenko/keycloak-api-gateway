const {TenantExternalPage} = require("keycloak-api-gateway/dist/src/handlers/TenantExternalPage");
const fs = require('fs');
const adapter = require('keycloak-api-gateway/dist');

function multiTenantJson(tenantName) {
    return {
        "realm": tenantName,
        "auth-server-url": "http://localhost:8080/auth/",
        "ssl-required": "external",
        "resource": "multiTenantreactJsExample"
    }
}

const apiConfig = {
    ...JSON.parse(fs.readFileSync(
        './ApiConfig.json'
        , 'utf-8')),
    ...{
        multiTenantJson
    }
};

const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    apiConfig
)
    .addCustomPageHandler(new TenantExternalPage("/tenantSelector",
        {
            redirectedUrl: "http://localhost:8083",
            applicationName: 'multiTenantreactJsExample',
            defaultAccessLevel: 'public',
            sessionAccessLevel: 'public',
            alwaysRedirect: true,
        }
        , 32000))
    .addCustomPageHandler(new TenantExternalPage("/", {
        redirectedUrl: "http://localhost:8083",
        applicationName: 'multiTenantreactJsExample'
    }, 0))
    .addCustomPageHandler(new TenantExternalPage("/index.html", {
        redirectedUrl: "http://localhost:8083",
        applicationName: 'multiTenantreactJsExample'
    }, 32000))

module.exports = keycloakApiGateWayAdapter
