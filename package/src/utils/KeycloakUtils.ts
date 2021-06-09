import {v4} from "uuid";

import {Options, RequestObject} from "../index";

const {clientJWT} = require('keycloak-lambda-authorizer/src/clientAuthorization');
const {commonOptions} = require('keycloak-lambda-authorizer/src/utils/optionsUtils');
const {getKeycloakUrl, sendData} = require('keycloak-lambda-authorizer/src/utils/restCalls');

export type KeycloakState = {
    multiFlag: boolean,
    url: string,
    tenant: string,
}

export function getHostName(req: RequestObject) {
    return req.headers.host;
}

export function getCurrentHost(req: RequestObject) {
    return `http${req.secure ? 's' : ''}://${getHostName(req)}`;
}

async function createJWS(options: any) {
    const timeLocal = new Date().getTime();
    const timeSec = Math.floor(timeLocal / 1000);
    const keycloakJson = await options.keycloakJson(options);
    return {
        jti: v4(),
        sub: keycloakJson.resource,
        aud: `${getKeycloakUrl(keycloakJson)}/realms/${keycloakJson.realm}`,
        exp: timeSec + 30,
        iat: timeSec,
    };
}

async function clientIdAuthorization(options: any) {
    const keycloakJson = await options.keycloakJson(options);
    let authorization = `client_id=${keycloakJson.resource}`;
    if (keycloakJson.credentials && keycloakJson.credentials.secret) {
        const {secret} = keycloakJson.credentials;
        if (secret) {
            authorization += `&client_secret=${secret}`;
        }
    } else if (options.keys && options.keys.privateKey) {
        authorization += `&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=${await clientJWT(await createJWS(options), options)}`;
    } else {
        throw new Error('Unsupported Credential Type');
    }
    return authorization;
}

export async function getTokenByCode(code: string,
                                     host: string,
                                     adapterOptions: any,
                                     keycloakJson: any) {
    const options = commonOptions(adapterOptions, keycloakJson);
    const keycloakJson0 = options.keycloakJson(options);
    const url = `${getKeycloakUrl(keycloakJson0)}/realms/${keycloakJson0.realm}/protocol/openid-connect/token`;
    const authorization = await clientIdAuthorization(options);
    const data = `code=${code}&grant_type=authorization_code&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&${authorization}&redirect_uri=${encodeURIComponent(`${host}/callbacks/${keycloakJson0.realm}/${keycloakJson0.resource}/callback`)}`;
    const tokenResponse = await sendData(url,
        'POST',
        data,
        {'Content-Type': 'application/x-www-form-urlencoded'});
    const tokenJson = tokenResponse;
    return JSON.parse(tokenJson);
}

export function getSessionName(options: Options) {
    if (!options.session.sessionConfiguration.sessionCookieName) {
        options.session.sessionConfiguration.sessionCookieName = "KAP";
    }
    return options.session.sessionConfiguration.sessionCookieName;
}

export async function getKeycloakJsonFunction(keycloakJson: any): Promise<any> {
    return await commonOptions( {},keycloakJson).keycloakJson();
}
