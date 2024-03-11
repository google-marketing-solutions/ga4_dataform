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

/**
 * Unnests a column in a SQL query.

 * Args:
 *   column_to_unnest: The column to unnest.
 *   key_to_extract: The key to extract from the unnested column.
 *   value_type: The type of the value to extract.

 * Returns:
 *   A SQL query that unnests the column.
 */
function unnest_column(column_to_unnest, key_to_extract, value_type="string_value") {
    return `(select value.${value_type} from unnest(${column_to_unnest}) where key = '${key_to_extract}')`;
};

/**
 * Extracts the main URL from a page path with parameters.

 * Args:
 *   input_string: The string to extract the URL from.

 * Returns:
 *   A SQL query that extracts the URL from the string.
 */
function extract_url(input_string) {
    return `regexp_extract(${input_string}, '(?:http[s]?://)?(?:www\\\\.)?(.*?)(?:(?:/|:)(?:.)*|$)')`;
};

/**
 * Returns the defualt channel group by source, medium,
 * and source category as per https://support.google.com/analytics/answer/9756891?hl=en

 * Args:
 *   source: The source of the channel.
 *   medium: The medium of the channel.
 *   source_category: The source category of the channel.

 * Returns:
 *   A string representing the channel group.
 */

function group_channels(source, medium, source_category) {
    return `case
                when
                    (
                    ${source} is null
                        and ${medium} is null
                    )
                    or (
                    ${source} = '(direct)'
                    and (${medium} = '(none)' or ${medium} = '(not set)')
                    )
                    then 'Direct'
                when
                    ${source_category} = 'SOURCE_CATEGORY_SHOPPING'
                    and regexp_contains(${medium},r"^(.*cp.*|ppc|retargeting|paid.*)$")
                    then 'Paid Shopping'
                when
                    ${source_category} = 'SOURCE_CATEGORY_SEARCH'
                    and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
                    then 'Paid Search'
                when
                    (
                    regexp_contains(${source}, r"^(facebook|instagram|pinterest|reddit|twitter|linkedin)")
                    or ${source_category} = 'SOURCE_CATEGORY_SOCIAL'
                    )
                    and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
                    then 'Paid Social'
                when
                    (${source_category} = 'SOURCE_CATEGORY_VIDEO' AND regexp_contains(${medium},r"^(.*cp.*|ppc|retargeting|paid.*)$"))
                    or ${source} = 'dv360_video'
                    then 'Paid Video'
                when
                    regexp_contains(${medium}, r"^(display|cpm|banner|expandable|interstitial)$")
                    or ${source} = 'dv360_display'
                    then 'Display'
                when
                    regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
                    then 'Paid Other'
                when
                    ${source_category} = 'SOURCE_CATEGORY_SHOPPING'
                    then 'Organic Shopping'
                when
                    regexp_contains(${source}, r"^(facebook|instagram|pinterest|reddit|twitter|linkedin)")
                    or ${medium} in ("social","social-network","social-media","sm","social network","social media")
                    or ${source_category} = 'SOURCE_CATEGORY_SOCIAL'
                    then 'Organic Social'
                when
                    ${source_category} = 'SOURCE_CATEGORY_VIDEO'
                    or regexp_contains(${medium}, r"^(.*video.*)$")
                    then 'Organic Video'
                when
                    ${medium} = 'organic'
                    or ${source_category} = 'SOURCE_CATEGORY_SEARCH'
                    then 'Organic Search'
                when
                    ${medium} in ("referral", "app", "link")
                    then 'Referral'
                when
                    regexp_contains(${medium}, r"email|e-mail|e_mail|e mail")
                    or regexp_contains(${source}, r"email|e-mail|e_mail|e mail")
                    then 'Email'
                when
                    regexp_contains(${medium}, r"affiliate|affiliates")
                    then 'Affiliates'
                when
                    ${medium} = 'audio'
                    then 'Audio'
                when
                    ${medium} = 'sms'
                    or ${source} = 'sms'
                    then 'SMS'
                when
                    regexp_contains(${medium}, r"(mobile|notification|push$)") or ${source} = 'firebase'
                    then 'Push Notifications'
                else '(Other)'
                end`
}

/**
 * Updates the traffic source, medium, and campaign to paid search when gclid is present.
 * Updates the user's first session source to the user traffic source. (This logic
 * could be excluded in case the first visit event source matches the user source)

 * Args:
 *   struct: The name of the struct to update.
 *   struct_column: The name of the struct column to update.
 *   table_alias: The alias of the table whose fields are being updated.
 *   gads_campaign_name: The name of the google ads campaign retrieved from the gads exports.

 * Returns:
 *   A SQL expression that updates the struct_column
 */
function update_paid_search_traffic_source(struct, struct_column, table_alias, gads_campaign_name) {
    let traffic_source = {
        cpc_value: '',
        cpm_value: ''
    };
    let user_traffic_source_column = '';
    if (struct_column === 'manual_source') {
        traffic_source.cpc_value = 'google';
        traffic_source.cpm_value = 'dbm';
        user_traffic_source_column = 'source';
    } else if (struct_column === 'manual_medium') {
        traffic_source.cpc_value = 'cpc';
        traffic_source.cpm_value = 'cpm';
        user_traffic_source_column = 'medium';
    } else if (struct_column === 'manual_campaign_name') {
        traffic_source.cpc_value = '(cpc)';
        traffic_source.cpm_value = '(cpm)';
        user_traffic_source_column = 'campaign';
    }

    return `if(${table_alias}.event_name in ('first_visit', 'first_open') and ${table_alias}.${struct}.${struct_column} is null,
                ${table_alias}.traffic_source.${user_traffic_source_column},
                if(${table_alias}.event_traffic_source.gclid is not null or ${table_alias}.page_location like '%gbraid%' or ${table_alias}.page_location like '%wbraid%',
                    if ('${struct_column}' in ('manual_campaign_name'),
                        if (${gads_campaign_name} is null,
                            '${traffic_source.cpc_value}',
                             ${gads_campaign_name}
                        ),
                        '${traffic_source.cpc_value}'
                    ),
                    if(${table_alias}.event_traffic_source.dclid is not null and ${table_alias}.event_traffic_source.gclid is null,
                            '${traffic_source.cpm_value}',
                            ${table_alias}.${struct}.${struct_column}
                    )
                )
            )`;
}

/**
 * Backdates the timestamp for firebase_campaign and campaign_details events
 * in case they arrive late (within 4 seconds of session start)
 * while preserving campaign event orders

 * Args:
 *   table_alias: The alias of the table whose fields are being updated.

 * Returns:
 *   A SQL expression with the backdated timestamps
 */
function adjust_campaign_timestamp(table_alias){
    let microseconds_in_second = 1000000;
    return `if(${table_alias}.event_name in ('firebase_campaign', 'campaign_details'),
                if((${table_alias}.event_timestamp/${microseconds_in_second}) <= (${table_alias}.ga_session_id + 4),
                    (${table_alias}.ga_session_id * ${microseconds_in_second}) - ((4 * ${microseconds_in_second}) - (${table_alias}.event_timestamp - (${table_alias}.ga_session_id * ${microseconds_in_second}))),
                    ${table_alias}.event_timestamp
                ),
                ${table_alias}.event_timestamp
            )`
}

/**
 * Build a query that will be used for retrieving source categories.
 * Returns:
 *   A SQL expression that selects source categories
*/
function select_source_categories(){
    let select_statement = '';
    let i = 0;
    let { source_categories } = require("./source_categories.js");
    let source_categories_length = Object.keys(source_categories).length;
    for (row of source_categories) {
        i++;
        select_statement = select_statement.concat(`select "` + row.source + `" as source, "`+  row.source_category + `" as source_category`);
        if (i < source_categories_length) {
            select_statement = select_statement.concat(` union distinct `)
        }
    }
    return select_statement;
}

/**
 * Build a query that will be used for retrieving custom events.
 * Returns:
 *   A SQL expression that selects custom events
*/
function select_non_custom_events(){
    let select_statement = '';
    let i = 0;
    let { non_custom_events } = require("./non_custom_events.js");
    let non_custom_events_length = Object.keys(non_custom_events).length;
    for (row of non_custom_events) {
        i++;
        select_statement = select_statement.concat(`select "` + row.event_name + `" as event_name`);
        if (i < non_custom_events_length) {
            select_statement = select_statement.concat(` union distinct `)
        }
    }
    return select_statement;
}

module.exports = { unnest_column, extract_url, group_channels, update_paid_search_traffic_source, adjust_campaign_timestamp, select_source_categories, select_non_custom_events };