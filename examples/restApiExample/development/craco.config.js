const keycloakApiGateWayAdapter = require('./ApiConfig');


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
