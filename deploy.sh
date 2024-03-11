#!/bin/bash

# Check if all required arguments are provided
if [ $# -ne 3 ]; then
    echo "Usage: $0 project_id dataform_location dataset_location"
    exit 1
fi

# Assign the arguments to variables for clarity
PROJECT_ID="$1"
DATAFORM_LOCATION="$2"
DATASET_LOCATION="$3"

# Set the project
gcloud config set project $PROJECT_ID

# Authorize the user
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")

if [[ -z "$ACTIVE_ACCOUNT" ]]; then
  gcloud auth login
fi

# Pip install requirements
pip install -q --require-hashes --no-deps -r requirements.txt

# Enable the Dataform API
gcloud services enable dataform.googleapis.com --project="$PROJECT_ID"

# Run the main.py script with the provided arguments
python main.py -p="$PROJECT_ID" -df="$DATAFORM_LOCATION" -ds="$DATASET_LOCATION"

PROJECT_NUMBER=`gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)"`

# Get the Dataform default service account email
SERVICE_ACCOUNT_EMAIL=service-"$PROJECT_NUMBER"@gcp-sa-dataform.iam.gserviceaccount.com

# Grant roles/bigquery.user and roles/bigquery.dataViewer roles to the service account
gcloud projects add-iam-policy-binding --quiet "$PROJECT_ID" \
    --member "serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role "roles/bigquery.user" \
    --no-user-output-enabled

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member "serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role "roles/bigquery.dataViewer" \
    --no-user-output-enabled