const adapter = require('keycloak-api-gateway/dist/index');
const fs = require('fs');
const cookieParser = require("cookie-parser");

const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    JSON.parse(fs.readFileSync('./ApiConfig.json', 'utf-8'))
);


module.exports = {
    webpack: {
        configure: (webpackConfig, {env, paths}) => {
            webpackConfig.devServer = {};
            keycloakApiGateWayAdapter.webPackDevServerMiddleWare(webpackConfig.devServer);
            return webpackConfig;
        }
    },
    devServer: (devServerConfig) => {
        keycloakApiGateWayAdapter.webPackDevServerMiddleWare().applyMiddleWare(devServerConfig);
        return devServerConfig;
    },
    keycloakApiGateWayAdapter
};
