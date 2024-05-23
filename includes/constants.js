/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const SOURCE_PROJECT = "ica-banken-276906" /* specify a value here only in case your source data sits in a project other than the default defined in workflow_settings.yaml defaultDatabase variable. You would need to grant the Dataform service account BigQuery Data Viewer and BigQuery Job User access to the dataset. */
const SOURCE_DATASET = "analytics_264548651"; /* the database containing the GA4 BigQuery exports */
const REPORTING_TIME_ZONE = "Europe/Stockholm"; /* replace with your property reporting time zone, this will update the timestamp columns from UTC to your GA4 property timezone (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) */
const SEEDS_DATASET = "ga4_dataform_seed"; /* the database containing the GA4 BigQuery data mapping seeds such as source categories */
const STAGING_DATASET = "ga4_dataform_staging";
const INTERMEDIATE_DATASET = "ga4_dataform_intermediate";
const OUTPUT_DATASET = "ga4_dataform_output";
const START_DATE = 20240520; /* data will be pulled starting this date */
const ALL_EVENTS_LOOKBACK_WINDOW = 7776000; /* number of lookback days in seconds when looking at last non-direct session source and non-acquisition conversion events, default is 90 days (86400 seconds in a day)*/
const AQUISITION_EVENTS_LOOKBACK_WINDOW = 2592000; /* number of lookback days in seconds when looking at acquisition conversion events (first_open and first_visit), default is 30 days (86400 seconds in a day)*/

/* Google Ads specific variables (optional) */
const GADS_GET_DATA = false; /* set to true in case you would like to retrieve campaign information from Google Ads based on the GA4 gclid */
const GADS_SOURCE_PROJECT = ""; /* your Google Ads data transfer project. you would need to grant the Dataform service account BigQuery Data Viewer and BigQuery Job User access to the dataset. */
const GADS_SOURCE_DATASET = ""; /* your Google Ads data transfer source dataset */
const GADS_CUSTOMER_ID = ""; /* your Google Ads customer id, excluding the dashes (-), example "1234567890" */

module.exports = {
    SOURCE_PROJECT,
    SOURCE_DATASET,
    REPORTING_TIME_ZONE,
    SEEDS_DATASET,
    STAGING_DATASET,
    INTERMEDIATE_DATASET,
    OUTPUT_DATASET,
    START_DATE,
    ALL_EVENTS_LOOKBACK_WINDOW,
    GADS_SOURCE_PROJECT,
    GADS_SOURCE_DATASET,
    GADS_GET_DATA,
    GADS_CUSTOMER_ID,
    AQUISITION_EVENTS_LOOKBACK_WINDOW
};
