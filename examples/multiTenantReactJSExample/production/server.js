const fs = require('fs');

const express = require('express');

const cookieParser = require('cookie-parser');
const keycloakApiGateWayAdapter = require('./ApiConfig');

const middlewareServer = express();
middlewareServer.use(cookieParser());
middlewareServer.use(async (req, res, next) => {
  const expressMiddleWarePromise = await keycloakApiGateWayAdapter.expressMiddleWare();
  await expressMiddleWarePromise.middleWare(req, res, next);
});
middlewareServer.use(express.static('../development/build'));

middlewareServer.listen(8081, () => {
  console.info('HTTP server listening on port 8081');
});
