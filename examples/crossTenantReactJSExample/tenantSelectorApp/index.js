const fs = require('fs');
const path = require('path');

const session = require('express-session');
const Keycloak = require('keycloak-connect');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const KeycloakAdapter = require('keycloak-lambda-authorizer/dist/Adapter');
const {getKeycloakUrl,getUrl} = require('keycloak-lambda-authorizer/dist/src/utils/KeycloakUtils');

const {fetchData, sendData} = require('./restCalls');

const app = express();

function getMaterKeycloakJSON() {
  return JSON.parse(fs.readFileSync(`${__dirname}/master-keycloak.json`, 'utf8'));
}

const serviceAccount = new KeycloakAdapter.default({keycloakJson:getMaterKeycloakJSON}).getServiceAccount();

const memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
}));
const keycloak = new Keycloak({
  store: memoryStore,
});

app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/',
}));

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
app.post('/requestAccess', keycloak.protect(), keycloak.enforcer(['Request-access']), async (request, response) => {
  const userName = request.kauth.grant.access_token.content.preferred_username;
  const userId = request.kauth.grant.access_token.content.sub;
  const keycloakJSon = getMaterKeycloakJSON();
  const token = await serviceAccount.getServiceAccountToken({request:request});
  let res = await sendData(`${getKeycloakUrl(keycloakJSon)}/admin/realms/${request.query.tenant}/users`, 'POST', JSON.stringify({
    enabled: false,
    attributes: {},
    groups: [],
    username: userName,
    emailVerified: true,
  }), {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });
  res = await fetchData(`${res.headers.location}`, 'GET', {
    Authorization: `Bearer ${token}`,
  });
  const userInfo = JSON.parse(res.data);
  const newUserId = userInfo.id;
    // http://localhost:8090/auth/admin/realms/tenant1/users/e98cdb88-3556-44a6-afa4-5698e35122a2/federated-identity/portal
  await sendData(`${getKeycloakUrl(keycloakJSon)}/admin/realms/${request.query.tenant}/users/${newUserId}/federated-identity/portal`, 'POST', JSON.stringify({
    identityProvider: "portal", userId, userName,
  }), {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });
  response.redirect("/");
});

app.get('/', keycloak.protect(), keycloak.enforcer(['Tenant-List']), async (request, response) => {
  const userName = request.kauth.grant.access_token.content.preferred_username;
  const keycloakJSon = getMaterKeycloakJSON();
  try {
    const token = await serviceAccount.getServiceAccountToken({request:request});
    let res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms`, 'GET', {
      Authorization: `Bearer ${token}`,
    });
    const tenants = await asyncFilter(await Promise.all(JSON
            .parse(res.data).map(async (tenant) => {
              const state = {state: 'NEW'};
              res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms/${tenant.realm}/users?briefRepresentation=true&first=0&max=20&search=${userName}`, 'GET', {
                Authorization: `Bearer ${token}`,
              });
              const parseUsers = JSON.parse(res.data);
              if (parseUsers.filter((user) => {
                return user.username === userName;
              }).length > 0) {
                const user = parseUsers[0];
                if (user.enabled) {
                  state.state = 'ACTIVE';
                } else {
                  state.state = 'PENDING';
                }
              }
              return {
                state: state.state,
                requestAccess: state.state === 'NEW',
                hasAccess: state.state === 'ACTIVE',
                name: tenant.realm,
                label: tenant.displayName,
                redirectUri: `${getUrl(request.query.redirectUri || 'http://localhost:3000')}/tenants/${tenant.realm}`,
              };
            })), async (tenant) => {
      try {
        if (!request.query.app && tenant.name !== 'master' && tenant.name !== 'Portal' && tenant.name !== 'portal') {
          return true;
        }
        res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms/${tenant.name}/clients?clientId=${request.query.app}&first=0&max=20&search=true`, 'GET', {
          Authorization: `Bearer ${token}`,
        });
        const clients = JSON.parse(res.data);
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

const server = app.listen(8083, () => {
  const host = 'localhost';
  const {port} = server.address();
    // eslint-disable-next-line no-console
  console.log('Example app listening at http://%s:%s', host, port);
});
