# ReactJs FrontEnd Environment for development

1. **Run Docker**
Using the image from https://hub.docker.com/r/jboss/keycloak/
```
 cd ..
docker run -p 8090:8080 -e JAVA_OPTS="-Dkeycloak.profile.feature.scripts=enabled -Dkeycloak.profile.feature.upload_scripts=enabled -server -Xms64m -Xmx512m -XX:MetaspaceSize=96M -XX:MaxMetaspaceSize=256m -Djava.net.preferIPv4Stack=true -Djboss.modules.system.pkgs=org.jboss.byteman -Djava.awt.headless=true" -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin  -v `pwd`:/express  -e KEYCLOAK_IMPORT=/express/example-realm-export.json  jboss/keycloak
```

2. **Run localhost development server**
```bash
npm i
npm run start
```

## 4. Open UI
[http://localhost:3000](http://localhost:3000)

users:

| User      | Password   |
|:----------|:-----------|
| user      | user       |

