const fs = require('fs');
const express = require('express');
const exphbs = require('express-handlebars');
const {serviceAccountJWT} = require('keycloak-lambda-authorizer/src/serviceAccount');
const {getKeycloakUrl, getUrl} = require('keycloak-lambda-authorizer/src/utils/restCalls');
const path = require('path');
const bodyParser = require('body-parser');
const {fetchData, sendData} = require('./restCalls');

const app = express();

function getKeycloakJSON() {
    return JSON.parse(fs.readFileSync(`${__dirname}/keycloak.json`, 'utf8'));
}

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
}
app.get('/', async (request, response) => {

    const keycloakJSon = getKeycloakJSON();
    try {
        const token = await serviceAccountJWT(keycloakJSon, {});
        const res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms`, 'GET', {
            Authorization: `Bearer ${token}`,
        });
        const tenants = await asyncFilter(JSON
            .parse(res).map((tenant) => {
                return {
                    name: tenant.realm,
                    label: tenant.displayName,
                    redirectUri: `${getUrl(request.query.redirectUri|| 'http://localhost:3000')}/tenants/${tenant.realm}`,
                }
            }), async (tenant) => {
            try {
                if (!request.query.app && tenant.name!== 'master') {
                    return true;
                }
                const res = await fetchData(`${getKeycloakUrl(keycloakJSon)}/admin/realms/${tenant.name}/clients?clientId=${request.query.app}&first=0&max=20&search=true`, 'GET', {
                    Authorization: `Bearer ${token}`,
                });
                const clients = JSON.parse(res);
                return clients.length > 0 &&
                    clients[0].clientAuthenticatorType === 'client-jwt'
                    && (clients[0].clientId === request.query.app);
            } catch (e) {
                throw new Error(e);
            }
        });
        renderUI(request, response, {
            tenants: tenants,
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
    console.log('Example app listening at http://%s:%s', host, port);
});
