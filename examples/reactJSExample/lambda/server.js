const express = require('express');
const cookieParser = require('cookie-parser');
const {keycloakApiGateWayAdapter} = require("../craco.config");

const middlewareServer = express();
middlewareServer.use(cookieParser());
middlewareServer.use(async (req,res,next)=>{
  await keycloakApiGateWayAdapter.expressMiddleWare().middleWare(req, res , next)
});
middlewareServer.use(express.static('../../build'));

middlewareServer.listen(8081, () => {
  console.info('HTTP server listening on port 8081');
});
