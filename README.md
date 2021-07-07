# keycloak-api-gateway
- [![Node.js 10.x, 12.x, 13.x, 14.x, 15.x CI](https://github.com/vzakharchenko/keycloak-api-gateway/actions/workflows/nodejs.yml/badge.svg)](https://github.com/vzakharchenko/keycloak-api-gateway/actions/workflows/nodejs.yml)
- [![npm version](https://badge.fury.io/js/keycloak-api-gateway.svg)](https://badge.fury.io/js/keycloak-api-gateway)
- [![Coverage Status](https://coveralls.io/repos/github/vzakharchenko/keycloak-api-gateway/badge.svg?branch=master)](https://coveralls.io/github/vzakharchenko/keycloak-api-gateway?branch=master)
- [![Maintainability](https://api.codeclimate.com/v1/badges/7d57b4bb709970045ad3/maintainability)](https://codeclimate.com/github/vzakharchenko/keycloak-api-gateway/maintainability)
  
- [![donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://secure.wayforpay.com/button/b95af1a9b9ed3)

Login flow gateway through [Keycloak](https://www.keycloak.org/) for static Web resources(bundle.js, images, pdf etc...)

## Features
- lambda@edge or expressjs middleware
- protect frontend static web resources(bundle.js and other files)
- support Multi-Tenancy
- change behaviour of static web resource (dynamically replace to another resource)
- dynamically create web resources.
- redirect to another services
- work as Express middleware
- easily transform to aws lambda@edge

# Examples
- [Single Tenant ReactJS Application](./examples/reactJSExample)
- [Multi-tenant  ReactJS Application with Tenant selector](./examples/multiTenantReactJSExample)
- [Cross-tenant  ReactJS Application with Tenant selector and approval proccess](./examples/crossTenantReactJSExample)
- [Custom Storage example](./examples/customStorageExample)

# Installation

```
npm i keycloak-api-gateway -S
```

**Import Adapter**
```js
import { KeycloakApiGateWayAdapter } from 'keycloak-api-gateway/dist';
```
or
```js
const { KeycloakApiGateWayAdapter } = require('keycloak-api-gateway/dist');
```

# Configuration for Single-Tenant Application
![](./imgs/keycloak-api-gateway.png)
```json
{
  "defaultAdapterOptions": {
    "keycloakJson": {
      "realm": "express-example",
      "auth-server-url": "http://localhost:8090/auth/",
      "ssl-required": "external",
      "resource": "express-example",
      "credentials": {
        "secret": "express-example"
      },
      "use-resource-role-mappings": true,
      "confidential-port": 0
    }
  },
  "storageType": "InMemoryDB",
  "keys": {
    "privateKey": {
      "key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD40tysViQSnd3E\nIe5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1Jt6ZbZx2l3cNUDt7FQXHL\nvZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pnMCLWUwk1usRwnP7o26SH\nURTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oItLafRzvgBBD7GvJhqvPIW\nTMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+uAjlQYDrPa0wkg+/2KIhx\nGD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xVecYVDJBlpOdQAxE77fUl\nRrw5DzKtAgMBAAECggEASLuyf7nKX5q/2XYltfmLobDadwM6X5dtqMe/pylmp1FV\nz6PqlgiNdzwfgU3qletFclepoieanMRtlCW+Zaj+6r/5bsgHD8tn3tfXvH0H3sNF\nGi3JDaOUgnxBsQoUFNw+4/LNOzHZHY4ewONFm2MC7OUZUqXa35iXdIp77UTEXkBG\nn4QdMraDW1DJUCx8nlUXHPntFN1AJANnx92Nsg6ZbhQrRRH4Lw8ydnUa3bN+Cy12\n9secVwo2RVS8slJgW21UpkVKEdUxe0VIL2++0trMokGK219AwlQV86hzEDmVUum2\nRIR3S0eknzvkJKspYc0tVvy/1uWnZggeJ+mNo1w4DQKBgQD/jpEpcdYJ9tHtBI3L\ne8s2Q4QLqdVPScS5dMDCw0aE6+CQoDSr0l37tHy5hxPJT+WalhyLCvPVtj0H97NP\nZLAoF/pgARpd3qhPM90R7/h7HgqxW/y+n1Qt/bAG+sR6n8LCcriYU+/PeUp1ugSW\nAYipqpexeRHhbwAI6pAWBj9ZXwKBgQD5QU5q6gnzdM20WVzp3K4eevpaOt9w/OUW\neI6o9wgVkvAo0p9irq8OM1SQlL3w3cX/YHktG9iF5oNRW6M2p7aKN1d5ZlUDhr1k\n/ogbtqg2CTWUikac4cUlZcour589DExlpvVL3zQda5/L7Cr0RrBmKRjMb1fyPXsy\nWJIllAgTcwKBgQDta7AlBuNJQotpXe+1+f6jHTqR82h/TxN7EKL8zpq3ZsSs2InW\nj4xNCjNN0dZqEtZHNeqyqqw6AiLVQiTOP8cAmLY9dwjd6LwJSS+7OGxrRU+90q4P\nEssMJ0HgWh0rpz0zlY01x9VltVOd6AHWsvoaVqizcr1P6OXpYrIWJBu6lQKBgQDS\n5isP048v67jRzHsNdafuKmgCSKYe2ByOcttipAK3HmkOYYhy2xNLlKsM2o4Ma9nI\nRzzAqjr+sRiTklH7QNT3BfSBx9BO94bxGVzY9ihF8Gzhjk5JF87T4di8v+SgpvNN\nX4NV+zoBWrsOtHlzzwwapNNSxzNGyDahVsfx+9sJeQKBgFuvm70VulN5Rd4TMcF2\nWixQNHEDStWBWPTa15ehDRIvxqfGZCkuY5o9tGY1vHxnpiHhqVheyRtLuHI6j5b3\nil3T5+cXdt1MnmkXUksqwgwcJdMqI5fmcuO9vdeYuGV4MoXysBdKMhqPybcVIonT\n5coMCbW92hodfPZ3F93PQpJU\n-----END PRIVATE KEY-----\n"
    },
    "publicKey": {
      "key": "-----BEGIN CERTIFICATE-----\nMIIDjzCCAnegAwIBAgIUNC48rSIoaMJC9YAcJ/MnfQcBmDgwDQYJKoZIhvcNAQEL\nBQAwVjELMAkGA1UEBhMCVVMxDzANBgNVBAgMBkRlbmlhbDEUMBIGA1UEBwwLU3By\naW5nZmllbGQxDDAKBgNVBAoMA0RpczESMBAGA1UEAwwJZGV2c2VydmVyMCAXDTIx\nMDYwNzIwMTQzOVoYDzIxMjEwNTE0MjAxNDM5WjBWMQswCQYDVQQGEwJVUzEPMA0G\nA1UECAwGRGVuaWFsMRQwEgYDVQQHDAtTcHJpbmdmaWVsZDEMMAoGA1UECgwDRGlz\nMRIwEAYDVQQDDAlkZXZzZXJ2ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\nAoIBAQD40tysViQSnd3EIe5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1J\nt6ZbZx2l3cNUDt7FQXHLvZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pn\nMCLWUwk1usRwnP7o26SHURTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oIt\nLafRzvgBBD7GvJhqvPIWTMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+u\nAjlQYDrPa0wkg+/2KIhxGD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xV\necYVDJBlpOdQAxE77fUlRrw5DzKtAgMBAAGjUzBRMB0GA1UdDgQWBBRJRP2WG0uR\nvDPnSRmV6Y8Rxu6ErDAfBgNVHSMEGDAWgBRJRP2WG0uRvDPnSRmV6Y8Rxu6ErDAP\nBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQDhKnZDt5VwTroWcTtX\nLSqIDtLLHiZxk6PIE8X9DG+rU//4Rfd+MFHClcKWiyLgYZPdgPaXSDXPiyfxlb7v\njOA0F0PXbEpR/RmjM5A+x3gljSufrWgedEC6rFFEg5Ju1IY+/7nJYkvd3ICMiLB3\ngOczMEp/tI7m89DS+bJAGG8AIYeBjj+3OjuGdEFtXpkt1ri33LYC4wK+rjqkBMyi\njqwex5bEkloSuyWP/IIDa8OpBWUM17H9ZswG74kQr5/wsvvTxc/JvRmMtNrbUyKa\n2JKXA1IJgNPP4/v2FxiGTibidZVf0fyXVqarU5Ngj/fVQyn7EBg+VGqPintiL5xU\ngUsi\n-----END CERTIFICATE-----\n"
    }
  }
}

```
example: [Single Tenant ReactJS Application](./examples/reactJSExample)
# Configuration for Multi-Tenant Application
![](/imgs/multi-tenant-keycloak-api-gateway.png)
```js
{
  multiTenantJson(tenantName) {
    return {
        "realm": tenantName,
        "auth-server-url": "http://localhost:8090/auth/",
        "ssl-required": "external",
        "resource": "multiTenantreactJsExample"
    }
  },
  multiTenantAdapterOptions: {
    "multiTenantAdapterOptions": {},
    keys:{
      privateKey:{
        key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDe8j3ZTRd2Rpaz\niLG33ItRWrL/p5wS+IEM3c4WFDzJvLKSTafFS78l3EuJz5bXuOQtKd6TrpXLkCG/\n1CQqaD7EPiMK11AQ3/mmALO6PSsXtFqTBk50NgUU64XmLt7nLG9FFgfK0Ez0p2HV\nTTkzbTCczUyktPte596b/7YMCFT7OozNjvCuSpNEFrGvSd3W1TN9nvlSy/YDb5x6\n+d8AWGGgyv7e/ziOLhvkD9XpsxApXbK6VxS6LHaZs5rYz5oIc10Q3Oizw5lSmW6P\nj9Izu0NxySQNNIa1RUaZnxUYratO0J8sqn0UwH6S6opUwYWmrRMJ+Ke6tWIzjlEx\n8hh+V/55AgMBAAECggEBALeY4dobpGCgjOZYgZIaKxjaCmKC0wLEZvIDjv2buNuh\na6UUEj9lu4ogOozIyT3pYu7WdhdERNOYZFKnDwllQ5s0WINLAQKEkABmv5t1WBFz\nUsuU+/KzsceilWgT3Tie3RsVo2Ef3N/1H5oauCpjlw7p+l4BNKjZZfctw+twyRsB\neMKUaRyjelbsfyK8iuT/ghPUHXCaxELcahagGy153q2YQBsBzb7dVz/MMaDtAEvF\noQDhs3Rnwz8WbY6+GwGGh+yivLiA2dFZGaZNHC3MZZf7uOogb/gmG7EA7hM8/EwW\nds81xYzuZBIWLaCwsQ8SvlmnSrGX/2X07BHkuZh6M6ECgYEA+C+uu3JHNmmNpzLg\nW0ZJeNpaIGn788G5O5fSvWTnYrRxk/RLc7Fs7IpXcS7RZ1v6hOJHnvf6ZGMt2JnN\nGF3HAcefOLev3G2fEF3F/+zPJP+Ul/86Z9UmQZXb5PrFWkInCFeVRHp9AOl9DLBD\nROkHgRdL5NYJqTxsyT2gQC4wsd0CgYEA5fchkErztHY/NI3LHIlrWutqLl9Fys7y\nrmYM1b5d3DuUBzlbeOOldtF5ZQmqfPXZSRP5sh9NYpmErwen/DCZlbzo6ErKbDfZ\nk7ZLs8XXxdGu5LpdJwC6DYdNhMaa+SsopBisWddBFgHfGwEyOi1V0VYnlaprOhSM\nQcR71fRmC00CgYA2ku2eREvKeD1w1awmBfej/oew9v0zJZcgtordoLGMr9cFzMNG\npm4oOWdu+PeM/dnBnKxZFXhW2MQ9C9zgjcZz6rxlUWb3VpeSlrwyQZVvMlAveC0U\npfcqltRqroX1CfThTbkB/Nk9+RnJT30LSx6eUUwb/sDTGPlm6wkw87c7dQKBgQCh\nzBTDTtjUmXWy5iiHtW/hEk0svz99h8lbRtW09TFYqFpoEsT280QRqyQ8IGbhcKAm\nOHWwCzIJM3YVJ8/bMd59aeJ8vVJafZkJwnLU01gTCIqCx1SPAoXkytORnaKfuOvp\nOKraswZKE5sDhv3tzMPae0Fyneq/fIGKLFHsoP3C6QKBgQDnFxoXmn5k3BFgW9aK\ne/BguKqg7JxUh153b9LcQWKvKs+Tz48t30/aHCH9mRgs1ebL7Z0TVKqSq5Y1G/Aq\nodiJX67LkQSsPTorFY+yPynHdIEyduGuiTE2dUUgtNwZUPwTxHIah9WmvhGth9kh\n7oXH27nU0UCpkWtgvHpDHZPevg==\n-----END PRIVATE KEY-----\n"
      },
      publicKey:{
        key: "-----BEGIN CERTIFICATE-----\nMIIDrTCCApWgAwIBAgIUOCkhWHsiDBi+aZXdx0/ItJ4dtkcwDQYJKoZIhvcNAQEL\nBQAwZjELMAkGA1UEBhMCVVMxDzANBgNVBAgMBkRlbmlhbDEUMBIGA1UEBwwLU3By\naW5nZmllbGQxDDAKBgNVBAoMA0RpczEiMCAGA1UEAwwZbXVsdGlUZW5hbnRyZWFj\ndEpzRXhhbXBsZTAeFw0yMTA2MTYwODI1MTFaFw0yMjA2MTYwODI1MTFaMGYxCzAJ\nBgNVBAYTAlVTMQ8wDQYDVQQIDAZEZW5pYWwxFDASBgNVBAcMC1NwcmluZ2ZpZWxk\nMQwwCgYDVQQKDANEaXMxIjAgBgNVBAMMGW11bHRpVGVuYW50cmVhY3RKc0V4YW1w\nbGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDe8j3ZTRd2RpaziLG3\n3ItRWrL/p5wS+IEM3c4WFDzJvLKSTafFS78l3EuJz5bXuOQtKd6TrpXLkCG/1CQq\naD7EPiMK11AQ3/mmALO6PSsXtFqTBk50NgUU64XmLt7nLG9FFgfK0Ez0p2HVTTkz\nbTCczUyktPte596b/7YMCFT7OozNjvCuSpNEFrGvSd3W1TN9nvlSy/YDb5x6+d8A\nWGGgyv7e/ziOLhvkD9XpsxApXbK6VxS6LHaZs5rYz5oIc10Q3Oizw5lSmW6Pj9Iz\nu0NxySQNNIa1RUaZnxUYratO0J8sqn0UwH6S6opUwYWmrRMJ+Ke6tWIzjlEx8hh+\nV/55AgMBAAGjUzBRMB0GA1UdDgQWBBS+MiDLDReuMpw4d2iF1si0IxfHKzAfBgNV\nHSMEGDAWgBS+MiDLDReuMpw4d2iF1si0IxfHKzAPBgNVHRMBAf8EBTADAQH/MA0G\nCSqGSIb3DQEBCwUAA4IBAQBaozLIBUH1aMCRL5LtVc9GaJt9NNT4O1dWJFShOfnH\nFqZ6VHfcBKrEDwLerG2PgGiDZABkCZe31KvQQk3eib3uGZnIWyaCr8uE3b/GOUds\nKpqTbjrSlYfP0rTi4CqT2PNLDkC78FtL4m7J8OF1nwFDIExaBz+75K0wDnGMOv84\nPLwjX2TrtQ53IVvkMgxVGC9gyK7SsuOHTDKzHwai5R00gs7m5+AHrh8fxb+aOyz5\ntz9OHtBMWO8qMcdblooUcs6CqgkwPVEbZtaJBzVNDgeVHC1NklpK6294e7ZIGv8c\nv2oAw8mMhvD4txqXW6S8oelZOKN4pcpSELTL6Kj/+L/D\n-----END CERTIFICATE-----\n"
      }
    }
  },
  storageType: "InMemoryDB",
  keys: {
    privateKey: {
      key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD40tysViQSnd3E\nIe5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1Jt6ZbZx2l3cNUDt7FQXHL\nvZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pnMCLWUwk1usRwnP7o26SH\nURTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oItLafRzvgBBD7GvJhqvPIW\nTMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+uAjlQYDrPa0wkg+/2KIhx\nGD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xVecYVDJBlpOdQAxE77fUl\nRrw5DzKtAgMBAAECggEASLuyf7nKX5q/2XYltfmLobDadwM6X5dtqMe/pylmp1FV\nz6PqlgiNdzwfgU3qletFclepoieanMRtlCW+Zaj+6r/5bsgHD8tn3tfXvH0H3sNF\nGi3JDaOUgnxBsQoUFNw+4/LNOzHZHY4ewONFm2MC7OUZUqXa35iXdIp77UTEXkBG\nn4QdMraDW1DJUCx8nlUXHPntFN1AJANnx92Nsg6ZbhQrRRH4Lw8ydnUa3bN+Cy12\n9secVwo2RVS8slJgW21UpkVKEdUxe0VIL2++0trMokGK219AwlQV86hzEDmVUum2\nRIR3S0eknzvkJKspYc0tVvy/1uWnZggeJ+mNo1w4DQKBgQD/jpEpcdYJ9tHtBI3L\ne8s2Q4QLqdVPScS5dMDCw0aE6+CQoDSr0l37tHy5hxPJT+WalhyLCvPVtj0H97NP\nZLAoF/pgARpd3qhPM90R7/h7HgqxW/y+n1Qt/bAG+sR6n8LCcriYU+/PeUp1ugSW\nAYipqpexeRHhbwAI6pAWBj9ZXwKBgQD5QU5q6gnzdM20WVzp3K4eevpaOt9w/OUW\neI6o9wgVkvAo0p9irq8OM1SQlL3w3cX/YHktG9iF5oNRW6M2p7aKN1d5ZlUDhr1k\n/ogbtqg2CTWUikac4cUlZcour589DExlpvVL3zQda5/L7Cr0RrBmKRjMb1fyPXsy\nWJIllAgTcwKBgQDta7AlBuNJQotpXe+1+f6jHTqR82h/TxN7EKL8zpq3ZsSs2InW\nj4xNCjNN0dZqEtZHNeqyqqw6AiLVQiTOP8cAmLY9dwjd6LwJSS+7OGxrRU+90q4P\nEssMJ0HgWh0rpz0zlY01x9VltVOd6AHWsvoaVqizcr1P6OXpYrIWJBu6lQKBgQDS\n5isP048v67jRzHsNdafuKmgCSKYe2ByOcttipAK3HmkOYYhy2xNLlKsM2o4Ma9nI\nRzzAqjr+sRiTklH7QNT3BfSBx9BO94bxGVzY9ihF8Gzhjk5JF87T4di8v+SgpvNN\nX4NV+zoBWrsOtHlzzwwapNNSxzNGyDahVsfx+9sJeQKBgFuvm70VulN5Rd4TMcF2\nWixQNHEDStWBWPTa15ehDRIvxqfGZCkuY5o9tGY1vHxnpiHhqVheyRtLuHI6j5b3\nil3T5+cXdt1MnmkXUksqwgwcJdMqI5fmcuO9vdeYuGV4MoXysBdKMhqPybcVIonT\n5coMCbW92hodfPZ3F93PQpJU\n-----END PRIVATE KEY-----\n"
    },
    publicKey: {
      key: "-----BEGIN CERTIFICATE-----\nMIIDjzCCAnegAwIBAgIUNC48rSIoaMJC9YAcJ/MnfQcBmDgwDQYJKoZIhvcNAQEL\nBQAwVjELMAkGA1UEBhMCVVMxDzANBgNVBAgMBkRlbmlhbDEUMBIGA1UEBwwLU3By\naW5nZmllbGQxDDAKBgNVBAoMA0RpczESMBAGA1UEAwwJZGV2c2VydmVyMCAXDTIx\nMDYwNzIwMTQzOVoYDzIxMjEwNTE0MjAxNDM5WjBWMQswCQYDVQQGEwJVUzEPMA0G\nA1UECAwGRGVuaWFsMRQwEgYDVQQHDAtTcHJpbmdmaWVsZDEMMAoGA1UECgwDRGlz\nMRIwEAYDVQQDDAlkZXZzZXJ2ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\nAoIBAQD40tysViQSnd3EIe5+6hDM/7ixHND8UoxYAKWwnA2/PdH2lq/pzjOo1t1J\nt6ZbZx2l3cNUDt7FQXHLvZeEn0w75/LVe/gIeoKJIUTWrXyVOrrPn50oWiaKX5pn\nMCLWUwk1usRwnP7o26SHURTebSfBI7kQfh22aiv68qgGvo4lMWISVrWNCNej4oIt\nLafRzvgBBD7GvJhqvPIWTMFyqDzGRtVk8nYi9x3Wwp72eUW9aY/j/akPTLdU5a+u\nAjlQYDrPa0wkg+/2KIhxGD/ffyggjvUaopzOEbnNGyBVXiOS3rQwwQnXNq+ip0xV\necYVDJBlpOdQAxE77fUlRrw5DzKtAgMBAAGjUzBRMB0GA1UdDgQWBBRJRP2WG0uR\nvDPnSRmV6Y8Rxu6ErDAfBgNVHSMEGDAWgBRJRP2WG0uRvDPnSRmV6Y8Rxu6ErDAP\nBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQDhKnZDt5VwTroWcTtX\nLSqIDtLLHiZxk6PIE8X9DG+rU//4Rfd+MFHClcKWiyLgYZPdgPaXSDXPiyfxlb7v\njOA0F0PXbEpR/RmjM5A+x3gljSufrWgedEC6rFFEg5Ju1IY+/7nJYkvd3ICMiLB3\ngOczMEp/tI7m89DS+bJAGG8AIYeBjj+3OjuGdEFtXpkt1ri33LYC4wK+rjqkBMyi\njqwex5bEkloSuyWP/IIDa8OpBWUM17H9ZswG74kQr5/wsvvTxc/JvRmMtNrbUyKa\n2JKXA1IJgNPP4/v2FxiGTibidZVf0fyXVqarU5Ngj/fVQyn7EBg+VGqPintiL5xU\ngUsi\n-----END CERTIFICATE-----\n"
    }
  }
}
```

Example: [Multi-tenant  ReactJS Application with Tenant selector](./examples/multiTenantReactJSExample)

# Configuration for Cross-Tenant Application
[Cross-tenant  ReactJS Application with Tenant selector and approval proccess](./examples/crossTenantReactJSExample)


# Url Protection Level

| Access Level | Page Handlers                 | Description                                                     |
|--------------|-------------------------------|-----------------------------------------------------------------|
| public       | PublicUrlPageHandler.ts       | Get resource without authentication and authorization           |
| multi-tenant | MultiTenantUrlPageHandler.ts  | Get Multi-tenant resource with authentication and authorization |
| single       | SingleTenantUrlPageHandler.ts | Default Tenant authentication and authorization                 |

- default public urls
   |              Public Urls                  |
   |-------------------------------------------|
   | (.*)(/public)(.*)                         |
   | (.*)(.(jpg \| jpeg \| png \| gif \| bmp)) |
   | (.*)(.(ico \| tiff))                      |
   | (.* )(.(css))                             |

- default tenant urls

   |              Single tenant Urls           |
   |-------------------------------------------|
   | /                                         |
   | /index.html                               |

# Custom Page Handlers

- Existing page handlers

| Page Handler               | Description                                                                                                                                                         |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PublicUrlPageHandler       | Handler for public web resources                                                                                                                                    |
| SingleTenantUrlPageHandler | Handler for default tenant web resources                                                                                                                             |
| MultiTenantUrlPageHandler  | Handler for multi-tenant web resources                                                                                                                              |
| TokenPageHandler           | Handler for /token path.  Return single tenant access_token if use single tenant authentication Return multi-tenant access_token if use multi-tenant authentication |
| TenantInternalPage         | Internal Tenant selector. If open /tenants/<REALM NAME> then redirect to <REALM NAME> login page                                                                    |
| TenantExternalPage         | External Tenant selector. Redirect to external Service to select tenant.                                                                                            |

- Add Custom Page Handler
```js
const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    options
)
    .addCustomPageHandler(new PublicUrlPageHandler('icon.ico', 15000));
```

- Delete custom Page Handler
```js
const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    options
)
    .deleteCustomPageHandler('icon.ico');
```

- Replace custom Page Handler

```
const keycloakApiGateWayAdapter = new adapter.KeycloakApiGateWayAdapter(
    options
)
    .addCustomPageHandler(new TenantExternalPage("/", {
        redirectedUrl: "http://localhost:8082",
        applicationName: 'multiTenantreactJsExample'
    }, 0))
    .addCustomPageHandler(new TenantExternalPage("/index.html", {
        redirectedUrl: "http://localhost:8082",
        applicationName: 'multiTenantreactJsExample'
    }, 32000))
```

# KeycloakApiGateWayAdapter OPTIONS

```js
    multiTenantJson: (tenant: string)=>{
           return KeycloakJSONForTenant(tenant)
    };
    multiTenantAdapterOptions: {...};
    defaultAdapterOptions: {
        keycloakJson,
        ...
    }
    storageType: 'DynamoDB',
    identityProviders: {
        "multiTenant":"IdentityProvider Alias",
        "singleTenant":"IdentityProvider Alias"
      },
    storageTypeSettings: {
        tableName,
        region,
        apiVersion,
    }
    keys: RSA KEYS,
```
where
 - **defaultAdapterOptions** authentication and authorization for single-tenant application ([structure](https://github.com/vzakharchenko/keycloak-lambda-authorizer#option-structure))
 - **multiTenantAdapterOptions** authentication and authorization for multi-tenant application ([structure](https://github.com/vzakharchenko/keycloak-lambda-authorizer#option-structure))
 - **multiTenantJson** tenant Keycloak.json resolver
 - **storageType** place where store session data(user access and refresh tokens)
    - DynamoDB store in AWS DynamoDB
    - InMemoryDB store in file
    - own implementation of StorageDB ([example](./examples/customStorageExample))
 - **identityProviders** Identity Provider Alias name.
    - multiTenant - Identity Provider for Multitenant application. need use the same alias name between tenants. can be overridden by request parameter kc_idp_hint
    - singleTenant - Identity Provider for application.
 - **storageTypeSettings** configuration for storageType
 - keys RSA keys which can be used for sign/verify sessionId and also can be used for "Signed JWT" client authentication

```js
const keycloakApiGateWayAdapter = new KeycloakApiGateWayAdapter(
{
  "defaultAdapterOptions": AUTHENTICATION AND AUTHORIZATION OPTIONS,
  "storageType": "InMemoryDB",
  "keys": {
    "privateKey": {
      "key": PRIVATE KEY
    },
    "publicKey": {
      "key": CERTIFICATE OR PUBLIC KEY
    }
  }
}
);
```
#  **[AWS Lambda@edge](https://aws.amazon.com/ru/lambda/edge/) middleWare**

```js
module.exports.handler =
    async (awsEvent) => {
      return await keycloakApiGateWayAdapter
            .awsLambdaEdgeAdapter()
            .handler(awsEvent);
    };

```

# **[ExpressJS](https://www.npmjs.com/package/express) Server**

```js
const middlewareServer = express();
middlewareServer.use(cookieParser());
middlewareServer.use(async (req, res, next) => {
  await keycloakApiGateWayAdapter.expressMiddleWare().middleWare(req, res, next);
});
middlewareServer.use(express.static('./static'));

middlewareServer.listen(8080, () => {
  console.info('HTTP server listening on port 8080');
});
```

# **[https://www.npmjs.com/package/@craco/craco](https://www.npmjs.com/package/@craco/craco) Development Server**
[craco.config.js](./development/craco.config.js)
```js

module.exports = {
    devServer: (devServerConfig) => {
        keycloakApiGateWayAdapter.webPackDevServerMiddleWare().applyMiddleWare(devServerConfig);
        return devServerConfig;
    }
};
```

# **[Webpack](https://www.npmjs.com/package/webpack) Development Server**

```js

const config = {
    mode: env,
    ...,
    devServer:{},
    ...
};
keycloakApiGateWayAdapter
  .webPackDevServerMiddleWare()
  .applyMiddleWare(config.devServer);

module.exports = config;
```

# Session Token RSA Keys Generation
```
openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=clientId" -keyout server.key -out server.crt
```
# Signed JWT Token RSA Generation
```
openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=clientId" -keyout server.key -out server.crt

```

