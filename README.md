
# GA4 Dataform

**Please note: this is not an officially supported Google product.**

## Contents
- [What it is](#what-it-is)
- [Get Started](#get-started)
- [Example Queries](#example-queries)
- [Disclaimer](#disclaimer)

## What It Is

GA4 Dataform is a Google Cloud Dataform project that provides SQL data models that help transform the raw GA4 BigQuery data exports into user friendly and modular tables, such as sessions, users transactions, etc... The output models are generated in the user-defined output dataset. The code serves as a starter pack to help users build their own models on top of the GA4 raw data exports. 

Note: The solution only supports web properties, and is not yet tested on app properties.

The below features are currently available:

1. Building a unique `event_key`, `user_key`, and `ga_session_key`.
2. Providing as output a digestible **session** table, **user_transaction_daily** table, **event** table, etc...
3. Determining the channels that initiated the session (based on last click) and attributing those channels to the first session traffic sources.
4. Providing an example of how a custom session attribution logic could be implemented by computing the last non-direct traffic source for the session.
5. Gclid widening by mapping the GA4 gclid to the Google Ads Data Transfer click-view gclid (Optional setting)
6. Event level last-click attribution.
7. Mapping the session traffic sources to [source category mappings](https://support.google.com/analytics/answer/9756891?hl=en#list).
8. Mapping the session traffic sources to [Default Channel Groups](https://support.google.com/analytics/answer/9756891?hl=en).

The project also provides helper functions to unnest BigQuery event_params, extract page urls, and apply default channel groupings (GA4 groupings might get updated.)

Depending on your use case, you may consider joining the BigQuery dataset with any relevant first party data, or building your own attribution logic. 

In the future, additional data for GA4 traffic attribution might become natively available through the BigQuery event export.

## Get Started

### Deploy via Cloud Shell

1. Activate Google Cloud Cloud Shell.
2. Click on Open Editor, and then from the menu, select Terminal > New Terminal.
3. Clone this repository using `git clone https://github.com/google-marketing-solutions/ga4_dataform.git`
4. Run this command to navigate to the ga4_dataform directory: `cd ga4_dataform`
5. Run this command to launch the interactive tutorial: `teachme tutorial.md`
6. Follow the on-screen instructions in the interactive Cloud Shell tutorial on the right of the screen.

### Alternative deployment method via connecting to a third-party Git repository (Optional)

An alternative way to deploy the solution is to connect your Dataform to a third-party Git repository by following this [guide](https://cloud.google.com/dataform/docs/connect-repository). 

The dataform project files could be found under the `dataform_source_code/` repository. You might want to keep your repository private.

Note: Please only choose one of the two deployment methods. Regardless of the method you pick, please proceed with the below instructions to run your Dataform project.

### Run the Dataform data models (The instructions for this step are also covered in the Cloud Shell deployment)

1. Navigate to "Dataform" on your Google Cloud project, and locate the new repository named ga4-dataform-timestamp. 

2. Navigate to the created workspace named ga4-workspace-timestamp, and explore
the project's .sqlx files that are responsible for generating the project tables in BigQuery.

3. Optional: Update database names and other constants in your Dataform's includes/constants.js file. Take note
of the output dataset name as this will store the final output tables of the SQL modeling.

4. Click on 'Start Execution' in the upper menu, choose 'All Actions', and select 'Run with Full Refresh'

5. Navigate to BigQuery and spot your output dataset, which is defaulted to "ga4_dataform_output"

### (Optional) Schedule runs with Dataform Workflow Configurations
[Dataform Workflow Configurations](https://cloud.google.com/dataform/docs/workflow-configurations)

## Example Queries

Below is an example on the output table to help you get started!

Retrieve the number of sessions by source and medium:
>
    select
        last_non_direct_traffic_source.source as session_source,
        last_non_direct_traffic_source.medium as session_medium,
        count(distinct ga_session_key) as number_of_sessions
    from `your-project-id.ga4_dataform_output.session`
    group by
        1,
        2
    order by
        3 desc
    limit 1000

## Disclaimer

The attribution models provided here only serve as examples and do not necessarily replicate the GA4 attribution models.

This solution does not intend to replicate the GA4 modeling and attribution logic, and neither intends to match the numbers in the UI. Using the API is better suited for this purpose.

The attribution models in the solution are device based and not user based. The solution uses user_pseudo_id field and not user_id.

The purpose is to create data pipelines to help you implement your own models, with some session attribution models provided as examples such as first source, last non-direct source, etc

The solution only supports web properties, and is not yet tested on app properties.

Copyright Google LLC. Supported by Google LLC and/or its affiliate(s). This solution, including any related sample code or data, is made available on an “as is,” “as available,” and “with all faults” basis, solely for illustrative purposes, and without warranty or representation of any kind. This solution is experimental, unsupported and provided solely for your convenience. Your use of it is subject to your agreements with Google, as applicable, and may constitute a beta feature as defined under those agreements.  To the extent that you make any data available to Google in connection with your use of the solution, you represent and warrant that you have all necessary and appropriate rights, consents and permissions to permit Google to use and process that data.  By using any portion of this solution, you acknowledge, assume and accept all risks, known and unknown, associated with its usage and any processing of data by Google, including with respect to your deployment of any portion of this solution in your systems, or usage in connection with your business, if at all. With respect to the entrustment of personal information to Google, you will verify that the established system is sufficient by checking Google's privacy policy and other public information, and you agree that no further information will be provided by Google.
