import {Options} from "./src";
import {ApiGateway, APIGateWayOptions, DefaultApiGateway} from "./src/apigateway/ApiGateway";
import {DefaultLambdaEdgeAdapter, LambdaEdgeAdapter} from "./src/lambdaedge/LambdaEdgeAdapter";
import {WebPackDevServerMiddleWare} from "./src/express/DefaultWebPackDevServerMiddleWare";
import {initOptions} from "./src/utils/DefaultPageHandlers";
import {PageHandler} from "./src/handlers/PageHandler";
import {ExpressMiddleWare} from "./src/express/DefaultExpressMiddleWare";

export interface IKeycloakApiGateWayAdapter {
    /**
     * Add custom Page Handler
     * @param customPageHandler can be used for set protection level ('public', 'multi-tenant', 'single') of static resource(s),
     * redirect to another resource based on your authentication/authorization or you can redirect request to another service or page
     */
    addCustomPageHandler(customPageHandler: PageHandler): IKeycloakApiGateWayAdapter;

    /**
     * delete custom Page Handler
     * @param url
     */
    deleteCustomPageHandler(url:string): IKeycloakApiGateWayAdapter;

    /**
     * protect expressjs(https://expressjs.com/)
     *
     * add express middleware before your static resources(js, css, images, pdf or etc...):
     *
     *   const adapter = require('keycloak-api-gateway/dist');
     *   const express = require('express');
     *   const cookieParser = require('cookie-parser');
     *   const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
     *    options
     * );
     *
     *  const server = express();
     *  server.use(cookieParser());
     *  server server.use(async (req, res, next) => {
     *      const expressMiddleWarePromise = await keycloakApiGateWayAdapter.expressMiddleWare();
     *      await expressMiddleWarePromise.middleWare(req, res, next);
     *  });
     *  middlewareServer.use(express.static('./staticResources'));
     *
     */
    expressMiddleWare(): Promise<ExpressMiddleWare>;

    /**
     * Generic implementation Method, all other middleware use this method
     * To use with another cloud or service you should transform request to RequestObject and ResponseObject to response system.
     *  example for aws lambda@edge: LambdaEdgeAdapter.ts
     */
    apiGatewayMiddleWare(): ApiGateway;

    /**
     * aws Lambda@Edge implementation:
     *
     *   const adapter = require('keycloak-api-gateway/dist');
     *   const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(options);
     *
     *   module.exports.handler =
     *   async (awsEvent) => {
     *    return await keycloakApiGateWayAdapter
     *          .awsLambdaEdgeAdapter()
     *          .handler(awsEvent);
     *   };
     */
    awsLambdaEdgeAdapter(): void;

    /**
     * WebPack Dev Server implementation (for development static resources(reactjs, angular etc...)):
     *    const adapter = require('keycloak-api-gateway/dist/index');
     *    const fs = require('fs');
     *    const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(options);
     *    module.exports = {
     *      devServer: (devServerConfig) => {
     *          keycloakApiGateWayAdapter.webPackDevServerMiddleWare().applyMiddleWare(devServerConfig);
     *           return devServerConfig;
     *      }
     *    };
     */
    webPackDevServerMiddleWare():any;
}

export class KeycloakApiGateWayAdapter implements IKeycloakApiGateWayAdapter {
    readonly options: APIGateWayOptions | Options;

    constructor(options: APIGateWayOptions | Options) {
        this.options = initOptions(options);
    }

    addCustomPageHandler(customPageHandler: PageHandler): IKeycloakApiGateWayAdapter {
        const existingIndex = this.options.pageHandlers?.findIndex((pageHandler) => {
            return pageHandler.getUrl() === customPageHandler.getUrl();
        });
        if (existingIndex !== undefined && existingIndex !== null && existingIndex > -1) {
           {
               this.options.pageHandlers?.splice(existingIndex,1);
            }
        }
        this.options.pageHandlers?.push(customPageHandler);
        this.options.pageHandlers = this.options.pageHandlers?.sort((a:PageHandler,b:PageHandler)=>{
            return b.order() > a.order()?1: -1;
        })
        return this;
    }

    deleteCustomPageHandler(url:string): IKeycloakApiGateWayAdapter{
        const existingIndex = this.options.pageHandlers?.findIndex((pageHandler) => {
            return pageHandler.getUrl() === url;
        });
        if (existingIndex !== undefined && existingIndex !== null && existingIndex > -1) {
            {
                this.options.pageHandlers?.splice(existingIndex,1);
            }
        }
        return this;
    }

    async expressMiddleWare(): Promise<ExpressMiddleWare> {
        const {DefaultExpressMiddleWare} = await import("./src/express/DefaultExpressMiddleWare");
        return new DefaultExpressMiddleWare(this.options);
    }

    apiGatewayMiddleWare(): ApiGateway {
        return new DefaultApiGateway(this.options)
    }

    awsLambdaEdgeAdapter():LambdaEdgeAdapter {
        return new DefaultLambdaEdgeAdapter(this.apiGatewayMiddleWare());
    }

    webPackDevServerMiddleWare(): any {
        return new WebPackDevServerMiddleWare(this.options);
    }
}
