# Example expressjs/lambda-edge/devserver

## Development

1. **Run Docker**
Using the image from https://hub.docker.com/r/jboss/keycloak/
```
docker run -p 8090:8080 -e JAVA_OPTS="-Dkeycloak.profile.feature.scripts=enabled -Dkeycloak.profile.feature.upload_scripts=enabled -server -Xms64m -Xmx512m -XX:MetaspaceSize=96M -XX:MaxMetaspaceSize=256m -Djava.net.preferIPv4Stack=true -Djboss.modules.system.pkgs=org.jboss.byteman -Djava.awt.headless=true" -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin  -v `pwd`:/express  -e KEYCLOAK_IMPORT=/express/example-realm-export.json  jboss/keycloak
```

2. **Run localhost development server**
```bash
cd development
npm i
npm run start
```
users:

| User      | Password   |
|:----------|:-----------|
| user      | user       |

## Deploy production package to Lambda@Edge

1. **Prepare frontend static resources**
```bash
cd development
npm i
npm run build

```
2. **Build Lambda@Edge package**
```
cd production
npm i
npm run build
```
3. **Run Keycloak docker image accessible from the Internet**
```
docker run -p 8090:8080 -e JAVA_OPTS="-Dkeycloak.profile.feature.scripts=enabled -Dkeycloak.profile.feature.upload_scripts=enabled -server -Xms64m -Xmx512m -XX:MetaspaceSize=96M -XX:MaxMetaspaceSize=256m -Djava.net.preferIPv4Stack=true -Djboss.modules.system.pkgs=org.jboss.byteman -Djava.awt.headless=true" -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin  -v `pwd`:/express  -e KEYCLOAK_IMPORT=/express/example-realm-export.json  jboss/keycloak
ngrok http 8090
```

4. **Run CDK Deploy Script**
```
cd production/keycloak-lambda-cdk
npm i
./deploy.sh  -n <BucketName> -r <ARN ROle> --keycloakUrl https://834d39e42544.ngrok.io --profile <AWS PROFILE>
```

users:

| User      | Password   |
|:----------|:-----------|
| user      | user       |

# Run as ExpressJS Server:

```bash
cd development
npm i
npm run build
cd ../production
npm i
npm run build
cd dist/server
node server.js
```

users:

| User      | Password   |
|:----------|:-----------|
| user      | user       |
