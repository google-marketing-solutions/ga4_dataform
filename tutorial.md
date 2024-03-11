# Get Started with GA4 Dataform

## What is GA4 Dataform

GA4 Dataform is a Dataform project that provides SQL data models that help transform the raw BigQuery data into user friendly and modular tables, such as sessions, items, etc... The code serves as a starter pack to help you build your own attribution model on top of the GA4 data.

### Prerequisites

In order to deploy GA4 Dataform, you need:
- Google Cloud Project with billing enabled.
- A BigQuery table with GA4 data exports.

<h4>Estimated time to complete:</h4>
<walkthrough-tutorial-duration duration="~10"></walkthrough-tutorial-duration>

To begin, click **Start**.

<h2 id="set-up-a-project" data-text="Set up a project">Set up a project</h2>

<walkthrough-project-setup billing></walkthrough-project-setup>

`Note:` In order to be able to install GA4 Dataform successfully, you need to have billing enabled for your project.

<h2 id="enable-apis" data-text="enable APIs">Enable APIs</h2>

First set the project Id to gcloud config:

```sh
gcloud config set project <walkthrough-project-id/>
```

`Note:` In order to install GA4 Dataform successfully, you need to have following APIs enabled. Note: sometimes it might take a few minutes after enabling the Dataform API to be able to use the Dataform service account.

For your project - `<walkthrough-project-name/>` following APIs must be enabled.

<walkthrough-enable-apis apis="workflows.googleapis.com,cloudscheduler.googleapis.com,bigquery.googleapis.com, dataform.googleapis.com, iam.googleapis.com"></walkthrough-enable-apis>

<h2 id="modify-constants-file" data-text="Modify constants.js file">Configure GA4 Datform Installation</h2>
Execute following command to edit the constants.js file

```sh
cloudshell edit $(git rev-parse --show-toplevel)/dataform_source_code/includes/constants.js
```
Info to fill values for deployment:

- `SOURCE_DATASET`: Your GA4 BQ export dataset. Example: "analytics_123456789"
- `REPORTING_TIMEZONE`: Your GA4 property reporting timezone. List of timezones can be found [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

Did you save the config file with relevant information? Then click **Next**.

<h2 id="run-deploy.sh" data-text="Run deploy.sh">Execute the deploy.sh file</h2>

Run the following command in CloudShell terminal to make the .sh file executable: 

```sh
chmod +x deploy.sh
```

Followed by the following command.
```sh
./deploy.sh YOUR-PROJECT-ID DATAFORM_LOCATION DATASET_LOCATION
```

For example:
```sh
./deploy.sh project-1234567890 us-central1 US
``` 

Note: `DATAFORM_LOCATION` defines the region where the Dataform source code will be stored, [Dataform locations](https://cloud.google.com/dataform/docs/locations) and `DATASET_LOCATION` defines the region where Dataform will create the BigQuery tables [BigQuery locations](https://cloud.google.com/bigquery/docs/locations). **When choosing the region of BigQuery tables, make sure it matches the region of your GA4 BigQuery export tables.**

<h2 id="run-models" data-text="Run Dataform models">Run the Dataform models</h2>

- Navigate to `Dataform` on your Google Cloud project, and locate the new repository named `ga4-dataform-timestamp`. 

- Navigate to the created workspace named ga4-workspace-timestamp, and explore
the project's .sqlx files that are responsible for generating the project tables in BigQuery.

- Optional: Update database names and other constants in your Dataform's includes/constants.js file. Take note
of the output dataset name as this will store the final output tables of the SQL modeling.

- Click on `Start Execution` in the upper menu, choose 'All Actions', and select 'Run with Full Refresh'

- Navigate to `BigQuery` and spot your output dataset, which is defaulted to "ga4_dataform_output"

<h2>Congratulations</h2>
<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>