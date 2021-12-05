import fs from 'fs';
import path from 'path';

import express from 'express';
import {engine} from 'express-handlebars';
import bodyParser from 'body-parser';
import KeycloakAdapter from 'keycloak-lambda-authorizer/dist/Adapter';
import {getKeycloakUrl, getUrl} from 'keycloak-lambda-authorizer/dist/src/utils/KeycloakUtils';

import {fetchData} from './restCalls';


const app = express();

function getKeycloakJSON() {
  return JSON.parse(fs.readFileSync(`${__dirname}/keycloak.json`, 'utf8'));
}

const serviceAccount = new KeycloakAdapter({keycloakJson: getKeycloakJSON()}).getServiceAccount();

app.use(bodyParser.urlencoded({extended: true}));

app.engine('.hbs', engine({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
}));

app.set('view engine', '.hbs');

app.set('views', path.join(__dirname, 'views'));

function renderUI(request:any, response:any, data:any) {
  response.render('home', {
    ...data,
  });
}


const asyncFilter = async (arr:any, predicate:any) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v:any, index:any) => results[index]);
};
app.get('/', async (request:any, response) => {

  const keycloakJSon = getKeycloakJSON();
  try {
    const token = await serviceAccount.getServiceAccountToken({request});
    let res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms`, 'GET', {
      Authorization: `Bearer ${token}`,
    });
    const tenants = await asyncFilter(JSON
            .parse(res).map((tenant:any) => {
              return {
                name: tenant.realm,
                label: tenant.displayName,
                redirectUri: `${getUrl(request.query.redirectUri || 'http://localhost:3000')}/tenants/${tenant.realm}`,
              };
            }), async (tenant:any) => {
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
      } catch (e:any) {
        throw new Error(e);
      }
    });
    renderUI(request, response, {
      tenants,
    });
  } catch (e:any) {
    renderUI(request, response, {
      tenants: [{name: e}],
    });
  }
});

const server = app.listen(8082, () => {
  const host = 'localhost';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const {port} = server.address();
  // eslint-disable-next-line no-console
  console.log('Example app listening at http://%s:%s', host, port);
});
