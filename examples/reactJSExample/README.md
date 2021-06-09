# Example expressjs/lambda-edge/devserver

## 1. Start Keycloak

### Docker
Using the image from https://hub.docker.com/r/jboss/keycloak/
```
docker run -p 8090:8080 -e JAVA_OPTS="-Dkeycloak.profile.feature.scripts=enabled -Dkeycloak.profile.feature.upload_scripts=enabled -server -Xms64m -Xmx512m -XX:MetaspaceSize=96M -XX:MaxMetaspaceSize=256m -Djava.net.preferIPv4Stack=true -Djboss.modules.system.pkgs=org.jboss.byteman -Djava.awt.headless=true" -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin  -v `pwd`:/express  -e KEYCLOAK_IMPORT=/express/example-realm-export.json  jboss/keycloak
```

## 2. Run Services Locally
- Express Service
```bash
npm i
npm run start
```

## 3. Run Webpack Dev Server:

```bash
npm i
npm run start
```
## 4. Run Express Server:

```bash
cd lambda
npm i
npm run build
cd dist
node server.js
```

## 4. Open UI
[http://localhost:3001](http://localhost:3001)

users:

| User      | Password   |
|:----------|:-----------|
| user      | user       |

