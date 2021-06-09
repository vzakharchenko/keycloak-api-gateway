import {Options} from "./src";
import {ExpressMiddleWare} from "./src/express/ExpressMiddleWare";
import {ApiGateway, APIGateWayOptions, DefaultApiGateway} from "./src/apigateway/ApiGateway";
import {WebPackDevServerMiddleWare} from "./src/express/WebPackDevServerMiddleWare";
import {DefaultLambdaEdgeAdapter} from "./src/lambdaedge/lambdaEdgeAdapter";

export class KeycloakApiGateWayAdapter {
    private options: APIGateWayOptions | Options;

    constructor(options: APIGateWayOptions | Options) {
        this.options = options;
    }

    expressMiddleWare(): ExpressMiddleWare {
        return new ExpressMiddleWare(this.options);
    }

    apiGatewayMiddleWare(): ApiGateway {
        return new DefaultApiGateway(this.options)
    }

    awsLambdaEdgeAdapter() {
        return new DefaultLambdaEdgeAdapter(this.apiGatewayMiddleWare());
    }

    webPackDevServerMiddleWare(devServerConfig: any): void {
        new WebPackDevServerMiddleWare(devServerConfig, this.options)
            .applyMiddleWare()
    }
}
