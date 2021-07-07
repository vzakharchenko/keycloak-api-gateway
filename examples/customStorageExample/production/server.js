const fs = require('fs');

const adapter = require('keycloak-api-gateway/dist');
const express = require('express');
const cookieParser = require('cookie-parser');
const {CustomStorageDB} = require("customstorage/dist");

const options = JSON.parse(fs.readFileSync('./ApiConfig.json', 'utf-8'));
options.storageType=new CustomStorageDB();
const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    options,
);

const middlewareServer = express();
middlewareServer.use(cookieParser());
middlewareServer.use(async (req, res, next) => {
  const expressMiddleWarePromise = await keycloakApiGateWayAdapter.expressMiddleWare();
  await expressMiddleWarePromise.middleWare(req, res, next);
});
middlewareServer.use(express.static('../../../development/build'));

middlewareServer.listen(8081, () => {
  console.info('HTTP server listening on port 8081');
});
