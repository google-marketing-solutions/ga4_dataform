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
const DASHBOARDS_DATASET = "ga4_dataform_dashboards";
const START_DATE = 20231101; /* data will be pulled starting this date */
const ALL_EVENTS_LOOKBACK_WINDOW = 7776000; /* number of lookback days in seconds when looking at last non-direct session source and non-acquisition conversion events, default is 90 days (86400 seconds in a day)*/
const AQUISITION_EVENTS_LOOKBACK_WINDOW = 2592000; /* number of lookback days in seconds when looking at acquisition conversion events (first_open and first_visit), default is 30 days (86400 seconds in a day)*/

/* Google Ads specific variables (optional) */
const GADS_GET_DATA = true; /* set to true in case you would like to retrieve campaign information from Google Ads based on the GA4 gclid */
const GADS_SOURCE_PROJECT = "ica-banken-276906"; /* your Google Ads data transfer project. you would need to grant the Dataform service account BigQuery Data Viewer and BigQuery Job User access to the dataset. */
const GADS_SOURCE_DATASET = "google_ads"; /* your Google Ads data transfer source dataset */
const GADS_CUSTOMER_ID = "9918257412"; /* your Google Ads customer id, excluding the dashes (-), example "1234567890" */

/* Meta Ads specific variables (optional) */
const FB_GET_DATA = true; 
const FB_SOURCE_PROJECT = "ica-banken-276906"; 
const FB_SOURCE_DATASET = "platform_data"; 

/* Snapchat Ads specific variables (optional) */
const SC_GET_DATA = true; 
const SC_SOURCE_PROJECT = "ica-banken-276906"; 
const SC_SOURCE_DATASET = "platform_data"; 

/* Adform specific variables (optional) */
const AF_GET_DATA = true; 
const AF_SOURCE_PROJECT = "ica-banken-276906"; 
const AF_SOURCE_DATASET = "platform_data"; 

/* Bing specific variables (optional) */
const B_GET_DATA = true; 
const B_SOURCE_PROJECT = "ica-banken-276906"; 
const B_SOURCE_DATASET = "platform_data"; 


module.exports = {
    SOURCE_PROJECT,
    SOURCE_DATASET,
    REPORTING_TIME_ZONE,
    SEEDS_DATASET,
    STAGING_DATASET,
    INTERMEDIATE_DATASET,
    OUTPUT_DATASET,
    DASHBOARDS_DATASET,
    START_DATE,
    ALL_EVENTS_LOOKBACK_WINDOW,
    GADS_SOURCE_PROJECT,
    GADS_SOURCE_DATASET,
    GADS_GET_DATA,
    GADS_CUSTOMER_ID,
    FB_SOURCE_PROJECT,
    FB_SOURCE_DATASET,
    FB_GET_DATA,
    SC_SOURCE_PROJECT,
    SC_SOURCE_DATASET,
    SC_GET_DATA,
    AF_SOURCE_PROJECT,
    AF_SOURCE_DATASET,
    AF_GET_DATA,
    B_SOURCE_PROJECT,
    B_SOURCE_DATASET,
    B_GET_DATA,
    AQUISITION_EVENTS_LOOKBACK_WINDOW
};
