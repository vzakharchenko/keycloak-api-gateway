import {CustomPageHandler, Options, PageHandler} from "./src";
import {ApiGateway, APIGateWayOptions, DefaultApiGateway} from "./src/apigateway/ApiGateway";
import {DefaultLambdaEdgeAdapter} from "./src/lambdaedge/lambdaEdgeAdapter";
import {WebPackDevServerMiddleWare} from "./src/express/DefaultWebPackDevServerMiddleWare";

export interface ExpressMiddleWare {
    middleWare(req: any, res: any, next: any): Promise<void>
}

export class KeycloakApiGateWayAdapter {
    readonly options: APIGateWayOptions | Options;

    constructor(options: APIGateWayOptions | Options) {
        this.options = options;
    }

    addCustomPageHandler(customPageHandler: PageHandler | CustomPageHandler): KeycloakApiGateWayAdapter {
        this.options.pageHandlers?.push(customPageHandler);
        return this;
    }

    async expressMiddleWare(): Promise<ExpressMiddleWare> {
        const {DefaultExpressMiddleWare} = await import("./src/express/DefaultExpressMiddleWare");
        return new DefaultExpressMiddleWare(this.options);
    }

    apiGatewayMiddleWare(): ApiGateway {
        return new DefaultApiGateway(this.options)
    }

    awsLambdaEdgeAdapter() {
        return new DefaultLambdaEdgeAdapter(this.apiGatewayMiddleWare());
    }

    webPackDevServerMiddleWare(): any {
        return new WebPackDevServerMiddleWare(this.options);
    }
}
