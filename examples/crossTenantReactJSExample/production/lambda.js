const keycloakApiGateWayAdapter = require('./ApiConfig');

module.exports.handler =
    async (awsEvent) => {
      return await keycloakApiGateWayAdapter
            .awsLambdaEdgeAdapter()
            .handler(awsEvent);
    };
