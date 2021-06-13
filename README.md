# keycloak-api-gateway


# Description
Implementation [Keycloak](https://www.keycloak.org/) adapter for Cloud

## Features
- protect frontend static resources(bundle.js and other files)
- dynamic page handlers for frontend,
- work as Express middleware
- easily transform to aws lambda@edge
- support MultiTenancy

# Examples
- [Single Tenant](./examples/reactJSExample)
- Multitenant Tenant(TODO)

# Installation

```
npm i keycloak-api-gateway -S
```

**Import Adapter**
```
import { KeycloakApiGateWayAdapter } = require('ccccccveldbrflkbjjkfgntjiuffgneehhkkhdbvhinn
');
```
or
```
const { KeycloakApiGateWayAdapter } = require('keycloak-api-gateway/dist');
```

```
const keycloakApiGateWayAdapter = new KeycloakApiGateWayAdapter(
{
  "defaultAdapterOptions": AUTHENTICATION AND AUTHORIZATION OPTIONS,
  "storageType": "InMemoryDB",
  "keys": {
    "privateKey": {
      "key": PRIVATE KEY
    },
    "publicKey": {
      "key": CERTIFICATE OR PUBLIC KEY
    }
  }
}
);
```



 - **[AWS Lambda@edge](https://aws.amazon.com/ru/lambda/edge/) middleWare**

```
module.exports.handler =
    async (awsEvent) => {
      return await keycloakApiGateWayAdapter
            .awsLambdaEdgeAdapter()
            .handler(awsEvent);
    };

```

 - **[ExpressJS](https://www.npmjs.com/package/express) Server**

```
const middlewareServer = express();
middlewareServer.use(cookieParser());
middlewareServer.use(async (req, res, next) => {
  await keycloakApiGateWayAdapter.expressMiddleWare().middleWare(req, res, next);
});
middlewareServer.use(express.static('./static'));

middlewareServer.listen(8080, () => {
  console.info('HTTP server listening on port 8080');
});
```

 - **[https://www.npmjs.com/package/@craco/craco](https://www.npmjs.com/package/@craco/craco) Development Server**
[craco.config.js](./development/craco.config.js)
```

module.exports = {
    devServer: (devServerConfig) => {
        keycloakApiGateWayAdapter.webPackDevServerMiddleWare().applyMiddleWare(devServerConfig);
        return devServerConfig;
    }
};
```

 - **[Webpack](https://www.npmjs.com/package/webpack) Development Server**

```

const config = {
    mode: env,
    ...,
    devServer:{},
    ...
};
keycloakApiGateWayAdapter
  .webPackDevServerMiddleWare()
  .applyMiddleWare(config.devServer);

module.exports = config;
```

# KeycloakApiGateWayAdapter OPTIONS

```
    multiTenantJson: (tenant: string)=>{
           return KeycloakJSONForTenant(tenant)
    };
    multiTenantAdapterOptions: {...};
    defaultAdapterOptions: {
        keycloakJson,
        ...
    }
    storageType: 'DynamoDB',
    storageTypeSettings: {
        tableName,
        region,
        apiVersion,
    }
    keys: RSA KEYS,
```
where
 - **defaultAdapterOptions** authentication and authorization for single-tenant application ([structure](https://github.com/vzakharchenko/keycloak-lambda-authorizer#option-structure))
 - **multiTenantAdapterOptions** authentication and authorization for multi-tenant application ([structure](https://github.com/vzakharchenko/keycloak-lambda-authorizer#option-structure))
 - **multiTenantJson** tenant Keycloak.json resolver
 - **storageType** place where store session data(user access and refresh tokens)
    - DynamoDB store in AWS DynamoDB
    - InMemoryDB store in file
 - **storageTypeSettings** configuration for storageType
 - keys RSA keys which can be used for sign/verify sessionId and also can be used for "Signed JWT" client authentication

# Protect/UnProtect static Resource

```
import { PublicUrlPageHandler } from "keycloak-api-gateway/dist/utils/DefaultPageHandlers";
...
keycloakApiGateWayAdapter.addCustomPageHandler(new SingleTenantUrlPageHandler('/singleUrl'),)
keycloakApiGateWayAdapter.addCustomPageHandler(new MultiTenantUrlPageHandler('/multi'),)
keycloakApiGateWayAdapter.addCustomPageHandler(new PublicUrlPageHandler('/public'),)
```
where
- **PublicUrlPageHandler** - unprotected static resource(s)
- **SingleTenantUrlPageHandler** - require single tenant authentication
- **MultiTenantUrlPageHandler** - require multi-tenant authentication

# Configuration for Single-Tenant Application
```
{
  "defaultAdapterOptions": {
    "keycloakJson": {
      "realm": "express-example",
      "auth-server-url": "http://localhost:8090/auth/",
      "ssl-required": "external",
      "resource": "express-example",
      "credentials": {
        "secret": "express-example"
      },
      "use-resource-role-mappings": true,
      "confidential-port": 0
    }
  },
  "storageType": "InMemoryDB",
  "keys": {
    "privateKey": {
      "key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD40tysViQSnd3E\nIe5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1Jt6ZbZx2l3cNUDt7FQXHL\nvZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pnMCLWUwk1usRwnP7o26SH\nURTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oItLafRzvgBBD7GvJhqvPIW\nTMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+uAjlQYDrPa0wkg+/2KIhx\nGD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xVecYVDJBlpOdQAxE77fUl\nRrw5DzKtAgMBAAECggEASLuyf7nKX5q/2XYltfmLobDadwM6X5dtqMe/pylmp1FV\nz6PqlgiNdzwfgU3qletFclepoieanMRtlCW+Zaj+6r/5bsgHD8tn3tfXvH0H3sNF\nGi3JDaOUgnxBsQoUFNw+4/LNOzHZHY4ewONFm2MC7OUZUqXa35iXdIp77UTEXkBG\nn4QdMraDW1DJUCx8nlUXHPntFN1AJANnx92Nsg6ZbhQrRRH4Lw8ydnUa3bN+Cy12\n9secVwo2RVS8slJgW21UpkVKEdUxe0VIL2++0trMokGK219AwlQV86hzEDmVUum2\nRIR3S0eknzvkJKspYc0tVvy/1uWnZggeJ+mNo1w4DQKBgQD/jpEpcdYJ9tHtBI3L\ne8s2Q4QLqdVPScS5dMDCw0aE6+CQoDSr0l37tHy5hxPJT+WalhyLCvPVtj0H97NP\nZLAoF/pgARpd3qhPM90R7/h7HgqxW/y+n1Qt/bAG+sR6n8LCcriYU+/PeUp1ugSW\nAYipqpexeRHhbwAI6pAWBj9ZXwKBgQD5QU5q6gnzdM20WVzp3K4eevpaOt9w/OUW\neI6o9wgVkvAo0p9irq8OM1SQlL3w3cX/YHktG9iF5oNRW6M2p7aKN1d5ZlUDhr1k\n/ogbtqg2CTWUikac4cUlZcour589DExlpvVL3zQda5/L7Cr0RrBmKRjMb1fyPXsy\nWJIllAgTcwKBgQDta7AlBuNJQotpXe+1+f6jHTqR82h/TxN7EKL8zpq3ZsSs2InW\nj4xNCjNN0dZqEtZHNeqyqqw6AiLVQiTOP8cAmLY9dwjd6LwJSS+7OGxrRU+90q4P\nEssMJ0HgWh0rpz0zlY01x9VltVOd6AHWsvoaVqizcr1P6OXpYrIWJBu6lQKBgQDS\n5isP048v67jRzHsNdafuKmgCSKYe2ByOcttipAK3HmkOYYhy2xNLlKsM2o4Ma9nI\nRzzAqjr+sRiTklH7QNT3BfSBx9BO94bxGVzY9ihF8Gzhjk5JF87T4di8v+SgpvNN\nX4NV+zoBWrsOtHlzzwwapNNSxzNGyDahVsfx+9sJeQKBgFuvm70VulN5Rd4TMcF2\nWixQNHEDStWBWPTa15ehDRIvxqfGZCkuY5o9tGY1vHxnpiHhqVheyRtLuHI6j5b3\nil3T5+cXdt1MnmkXUksqwgwcJdMqI5fmcuO9vdeYuGV4MoXysBdKMhqPybcVIonT\n5coMCbW92hodfPZ3F93PQpJU\n-----END PRIVATE KEY-----\n"
    },
    "publicKey": {
      "key": "-----BEGIN CERTIFICATE-----\nMIIDjzCCAnegAwIBAgIUNC48rSIoaMJC9YAcJ/MnfQcBmDgwDQYJKoZIhvcNAQEL\nBQAwVjELMAkGA1UEBhMCVVMxDzANBgNVBAgMBkRlbmlhbDEUMBIGA1UEBwwLU3By\naW5nZmllbGQxDDAKBgNVBAoMA0RpczESMBAGA1UEAwwJZGV2c2VydmVyMCAXDTIx\nMDYwNzIwMTQzOVoYDzIxMjEwNTE0MjAxNDM5WjBWMQswCQYDVQQGEwJVUzEPMA0G\nA1UECAwGRGVuaWFsMRQwEgYDVQQHDAtTcHJpbmdmaWVsZDEMMAoGA1UECgwDRGlz\nMRIwEAYDVQQDDAlkZXZzZXJ2ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\nAoIBAQD40tysViQSnd3EIe5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1J\nt6ZbZx2l3cNUDt7FQXHLvZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pn\nMCLWUwk1usRwnP7o26SHURTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oIt\nLafRzvgBBD7GvJhqvPIWTMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+u\nAjlQYDrPa0wkg+/2KIhxGD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xV\necYVDJBlpOdQAxE77fUlRrw5DzKtAgMBAAGjUzBRMB0GA1UdDgQWBBRJRP2WG0uR\nvDPnSRmV6Y8Rxu6ErDAfBgNVHSMEGDAWgBRJRP2WG0uRvDPnSRmV6Y8Rxu6ErDAP\nBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQDhKnZDt5VwTroWcTtX\nLSqIDtLLHiZxk6PIE8X9DG+rU//4Rfd+MFHClcKWiyLgYZPdgPaXSDXPiyfxlb7v\njOA0F0PXbEpR/RmjM5A+x3gljSufrWgedEC6rFFEg5Ju1IY+/7nJYkvd3ICMiLB3\ngOczMEp/tI7m89DS+bJAGG8AIYeBjj+3OjuGdEFtXpkt1ri33LYC4wK+rjqkBMyi\njqwex5bEkloSuyWP/IIDa8OpBWUM17H9ZswG74kQr5/wsvvTxc/JvRmMtNrbUyKa\n2JKXA1IJgNPP4/v2FxiGTibidZVf0fyXVqarU5Ngj/fVQyn7EBg+VGqPintiL5xU\ngUsi\n-----END CERTIFICATE-----\n"
    }
  }
}

```
