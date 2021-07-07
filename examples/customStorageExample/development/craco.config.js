const {CustomStorageDB} = require("customstorage/dist");

const adapter = require('keycloak-api-gateway/dist/index');
const fs = require('fs');

const options = JSON.parse(fs.readFileSync('./ApiConfig.json', 'utf-8'));
options.storageType=new CustomStorageDB();
const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    options
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
