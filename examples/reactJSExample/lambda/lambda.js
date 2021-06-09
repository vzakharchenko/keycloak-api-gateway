import {keycloakApiGateWayAdapter} from "../craco.config";

module.exports.handler =
    async (awsEvent) => {
        await keycloakApiGateWayAdapter
            .awsLambdaEdgeAdapter()
            .handler(awsEvent);
    }
