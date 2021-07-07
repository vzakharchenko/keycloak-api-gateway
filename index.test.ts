import 'jest';

import {KeycloakApiGateWayAdapter} from "./index";
import {PublicUrlPageHandler} from "./src/handlers/PublicUrlPageHandler";

describe('index tests', () => {
    test('test', async () => {
        const adapter = new KeycloakApiGateWayAdapter({
            storageType:'InMemoryDB',
            keys:{
                privateKey:{
                    key:''
                },
                publicKey:{
                    key:''
                }
            }
        });
        adapter.awsLambdaEdgeAdapter();
        await adapter.expressMiddleWare();
        adapter.apiGatewayMiddleWare();
        adapter.webPackDevServerMiddleWare();
        adapter.addCustomPageHandler(new PublicUrlPageHandler("test"));
        adapter.addCustomPageHandler(new PublicUrlPageHandler("/"));
        adapter.deleteCustomPageHandler("test");
    });
});
