const fs = require('fs');
const path = require('path');

const express = require('express');
const exphbs = require('express-handlebars');
const KeycloakAdapter = require('keycloak-lambda-authorizer/dist/Adapter');
const {getKeycloakUrl, getUrl} = require('keycloak-lambda-authorizer/dist/src/utils/KeycloakUtils');
const bodyParser = require('body-parser');

const {fetchData, sendData} = require('./restCalls');

const app = express();

function getKeycloakJSON() {
  return JSON.parse(fs.readFileSync(`${__dirname}/keycloak.json`, 'utf8'));
}

const serviceAccount = new KeycloakAdapter.default({keycloakJson:getKeycloakJSON,}).getServiceAccount();
app.use(bodyParser.urlencoded({extended: true}));

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
}));

app.set('view engine', '.hbs');

app.set('views', path.join(__dirname, 'views'));

function renderUI(request, response, data) {
  response.render('home', {
    ...data,
  });
}


const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};
app.get('/', async (request, response) => {

  const keycloakJSon = getKeycloakJSON();
  try {
    const token = await serviceAccount.getServiceAccountToken({request});
    let res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms`, 'GET', {
      Authorization: `Bearer ${token}`,
    });
    const tenants = await asyncFilter(JSON
            .parse(res).map((tenant) => {
              return {
                name: tenant.realm,
                label: tenant.displayName,
                redirectUri: `${getUrl(request.query.redirectUri || 'http://localhost:3000')}/tenants/${tenant.realm}`,
              };
            }), async (tenant) => {
      try {
        if (!request.query.app && tenant.name !== 'master') {
          return true;
        }
        res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms/${tenant.name}/clients?clientId=${request.query.app}&first=0&max=20&search=true`, 'GET', {
          Authorization: `Bearer ${token}`,
        });
        const clients = JSON.parse(res);
        return clients.length > 0 &&
                    clients[0].clientAuthenticatorType === 'client-jwt' &&
                    (clients[0].clientId === request.query.app);
      } catch (e) {
        throw new Error(e);
      }
    });
    renderUI(request, response, {
      tenants,
    });
  } catch (e) {
    renderUI(request, response, {
      tenants: [{name: e}],
    });
  }
});

const server = app.listen(8082, () => {
  const host = 'localhost';
  const {port} = server.address();
  // eslint-disable-next-line no-console
  console.log('Example app listening at http://%s:%s', host, port);
});
