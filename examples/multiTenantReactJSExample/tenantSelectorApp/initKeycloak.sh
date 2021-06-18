set -e

function help
{
echo '
Usage addTenant.sh OPTIONS
Create client realm and default admin
Options:
  -n,  --name                      Tenant name
  -r,  --realm-import              Path to the realm import file
  -s,  --server                    Keycloak server URL
  -a,  --admin-name                Keycloak Admin username
  -p,  --admin-pass                Keycloak Admin password
       --help                      Help Screen
'
}
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -r|--realm-import)
    REALM_IMPORT_PATH="$2"
    shift
    shift
    ;;
    -s|--server)
    KEYCLOAK_SERVER="$2"
    shift
    shift
    ;;
    -n|--name)
    TENANT_NAME="$2"
    shift
    shift
    ;;
    -a|--admin-name)
    KEYCLOAK_ADMIN_NAME="$2"
    shift
    shift
    ;;
    -p|--admin-pass)
    KEYCLOAK_ADMIN_PASS="$2"
    shift
    shift
    ;;
    --help)
    help
    exit
    ;;
    --default)
    DEFAULT=YES
    shift # past argument
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done

set -- "${POSITIONAL[@]}" # restore positional parameters

if [[ "x${REALM_IMPORT_PATH}" = "x" ]]; then
  REALM_IMPORT_PATH=./example-realm-export.json
fi
if [[ "x${KEYCLOAK_SERVER}" = "x" ]]; then
  KEYCLOAK_SERVER=http://localhost:8090/auth
fi

if [[ "x${KEYCLOAK_ADMIN_NAME}" = "x" ]]; then
  KEYCLOAK_ADMIN_NAME=admin
fi

if [[ "x${KEYCLOAK_ADMIN_PASS}" = "x" ]]; then
  KEYCLOAK_ADMIN_PASS=admin
fi

if [[ "x${TENANT_NAME}" = "x" ]]; then
  echo "Error: Tenant Name is required"
  help
  exit 1;
fi

REGEX_TENANT_NAME=$(echo $TENANT_NAME| sed -e 's/\//\\\//g')

export REALM=$(cat ${REALM_IMPORT_PATH} \
  | sed -e "s/tenant1/${REGEX_TENANT_NAME}/g" \
)


export authResponse=$(curl -k -X POST "${KEYCLOAK_SERVER}/realms/master/protocol/openid-connect/token" \
 -H "Content-Type: application/x-www-form-urlencoded" \
 -d "username=${KEYCLOAK_ADMIN_NAME}" \
 -d "password=${KEYCLOAK_ADMIN_PASS}" \
 -d 'grant_type=password' \
 -d 'client_id=admin-cli' )
access_token=$(echo $authResponse | awk -F"," '{print $1}' | awk -F":" '{print $2}' | sed s/\"//g | tr -d ' ')
#echo $access_token

curl -k -X POST "${KEYCLOAK_SERVER}/admin/realms" -d "${REALM}" \
-H "Accept: application/json" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $access_token"


