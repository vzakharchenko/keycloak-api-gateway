# keycloak-api-gateway


# Description
Implementation [Keycloak](https://www.keycloak.org/) adapter for Cloud
## Features
- work as Express middleware
- easily transform to aws lambda@edge
- support MultiTenancy

# Installation
```
todo
```

## webpack DevServer integration
```js
const adapter = require('keycloak-api-gateway/src/index');

const keycloakApiGateWayAdapter =
new adapter.KeycloakApiGateWayAdapter({...});

const webPackConfig = {
  ...
  devServer:{
  }
      keycloakApiGateWayAdapter
      .webPackDevServerMiddleWare(webPackConfig.devServer);
  ...
};

```

