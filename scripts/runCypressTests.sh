#!/bin/bash
ENVIRONMENT=$1
CREDENTIAL_IDS=$2
LAUNCH_TEST_RUNNER=${3:-true}

baseUrlLocal=http://localhost:8888
baseUrlIntegration=https://console.magma.product.dev.alertlogic.com

# Setting up warning color.
shw_warn () {
    echo $(tput bold)$(tput setaf 2) $@ $(tput sgr 0)
}

if [ "$#" -lt "2" ]; then
    echo "ENVIRONMENT     = $ENVIRONMENT"
    echo "CREDENTIAL_IDS  = $CREDENTIAL_IDS"
    echo "Illegal number of parameters - check you have provided both an ENVIRONMENT and CREDENTIAL_IDS argument"
    exit 1
fi

# Set space as the delimiter
IFS=','
#Read the split words into an array based on space delimiter
read -a IDS <<< "$CREDENTIAL_IDS"
# # setup email credentials
for CREDENTIAL_ID in "${IDS[@]}";
do
        read -r -s -p "Please write PASSWORD for $CREDENTIAL_ID and hit ENTER: " PASSWORD
        # Define environment variable for each Credential
        export CYPRESS_$CREDENTIAL_ID=$PASSWORD
        echo ""
done

if [ $ENVIRONMENT == "local" ]
then
  if [ $LAUNCH_TEST_RUNNER == true ]
  then
    npx cypress open --project apps/console-e2e --config baseUrl=$baseUrlLocal
  else
    npx cypress run --project apps/console-e2e --config baseUrl=$baseUrlLocal
  fi
else
  if [ $LAUNCH_TEST_RUNNER == true ]
  then
    npx cypress open --project apps/console-e2e --config baseUrl=$baseUrlIntegration
  else
    npx cypress run --project apps/console-e2e --config baseUrl=$baseUrlIntegration
  fi
fi
exit 0
