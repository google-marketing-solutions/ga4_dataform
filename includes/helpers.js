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
 *   columnToUnnest: The column to unnest.
 *   keyToExtract: The key to extract from the unnested column.
 *   valueType: The type of the value to extract.

 * Returns:
 *   A SQL query that unnests the column.
 */
function unnestColumn(columnToUnnest, keyToExtract, valueType="string_value") {
    return `(select value.${valueType} from unnest(${columnToUnnest}) where key = '${keyToExtract}')`;
};

/**
 * Extracts the main URL from a page path with parameters.

 * Args:
 *   inputString: The string to extract the URL from.

 * Returns:
 *   A SQL query that extracts the URL from the string.
 */
function extractUrl(inputString) {
    return `regexp_extract(${inputString}, '(?:http[s]?://)?(?:www\\\\.)?(.*?)(?:(?:/|:)(?:.)*|$)')`;
};

/**
 * Returns the defualt channel group by source, medium,
 * and source category as per https://support.google.com/analytics/answer/9756891?hl=en

 * Args:
 *   source: The source of the channel.
 *   medium: The medium of the channel.
 *   sourceCategory: The source category of the channel.

 * Returns:
 *   A string representing the channel group.
 */

function groupChannels(source, medium, sourceCategory) {
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
                    ${sourceCategory} = 'SOURCE_CATEGORY_SHOPPING'
                    and regexp_contains(${medium},r"^(.*cp.*|ppc|retargeting|paid.*)$")
                    then 'Paid Shopping'
                when
                    ${sourceCategory} = 'SOURCE_CATEGORY_SEARCH'
                    and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
                    then 'Paid Search'
                when
                    (
                    regexp_contains(${source}, r"^(facebook|instagram|pinterest|reddit|twitter|linkedin)")
                    or ${sourceCategory} = 'SOURCE_CATEGORY_SOCIAL'
                    )
                    and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
                    then 'Paid Social'
                when
                    (${sourceCategory} = 'SOURCE_CATEGORY_VIDEO' AND regexp_contains(${medium},r"^(.*cp.*|ppc|retargeting|paid.*)$"))
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
                    ${sourceCategory} = 'SOURCE_CATEGORY_SHOPPING'
                    then 'Organic Shopping'
                when
                    regexp_contains(${source}, r"^(facebook|instagram|pinterest|reddit|twitter|linkedin)")
                    or ${medium} in ("social","social-network","social-media","sm","social network","social media")
                    or ${sourceCategory} = 'SOURCE_CATEGORY_SOCIAL'
                    then 'Organic Social'
                when
                    ${sourceCategory} = 'SOURCE_CATEGORY_VIDEO'
                    or regexp_contains(${medium}, r"^(.*video.*)$")
                    then 'Organic Video'
                when
                    ${medium} = 'organic'
                    or ${sourceCategory} = 'SOURCE_CATEGORY_SEARCH'
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
 *   structColumn: The name of the struct column to update.
 *   tableAlias: The alias of the table whose fields are being updated.
 *   gadsCampaignName: The name of the google ads campaign retrieved from the gads exports.

 * Returns:
 *   A SQL expression that updates the structColumn
 */
function updatePaidSearchTrafficSource(struct, structColumn, tableAlias, gadsCampaignName) {
    let trafficSource = {
        cpcValue: '',
        cpmValue: ''
    };
    let userTrafficSourceColumn = '';
    if (structColumn === 'manual_source') {
        trafficSource.cpcValue = 'google';
        trafficSource.cpmValue = 'dbm';
        userTrafficSourceColumn = 'source';
    } else if (structColumn === 'manual_medium') {
        trafficSource.cpcValue = 'cpc';
        trafficSource.cpmValue = 'cpm';
        userTrafficSourceColumn = 'medium';
    } else if (structColumn === 'manual_campaign_name') {
        trafficSource.cpcValue = '(cpc)';
        trafficSource.cpmValue = '(cpm)';
        userTrafficSourceColumn = 'campaign';
    }

    return `if(${tableAlias}.event_name in ('first_visit', 'first_open') and ${tableAlias}.${struct}.${structColumn} is null,
                ${tableAlias}.traffic_source.${userTrafficSourceColumn},
                if(${tableAlias}.event_traffic_source.gclid is not null or ${tableAlias}.page_location like '%gbraid%' or ${tableAlias}.page_location like '%wbraid%',
                    if ('${structColumn}' in ('manual_campaign_name'),
                        if (${gadsCampaignName} is null,
                            '${trafficSource.cpcValue}',
                             ${gadsCampaignName}
                        ),
                        '${trafficSource.cpcValue}'
                    ),
                    if(${tableAlias}.event_traffic_source.dclid is not null and ${tableAlias}.event_traffic_source.gclid is null,
                            '${trafficSource.cpmValue}',
                            ${tableAlias}.${struct}.${structColumn}
                    )
                )
            )`;
}

/**
 * Backdates the timestamp for firebase_campaign and campaign_details events
 * in case they arrive late (within 4 seconds of session start)
 * while preserving campaign event orders

 * Args:
 *   tableAlias: The alias of the table whose fields are being updated.

 * Returns:
 *   A SQL expression with the backdated timestamps
 */
function adjustCampaignTimestamp(tableAlias){
    let microsecondsInSecond = 1000000;
    return `if(${tableAlias}.event_name in ('firebase_campaign', 'campaign_details'),
                if((${tableAlias}.event_timestamp/${microsecondsInSecond}) <= (${tableAlias}.ga_session_id + 4),
                    (${tableAlias}.ga_session_id * ${microsecondsInSecond}) - ((4 * ${microsecondsInSecond}) - (${tableAlias}.event_timestamp - (${tableAlias}.ga_session_id * ${microsecondsInSecond}))),
                    ${tableAlias}.event_timestamp
                ),
                ${tableAlias}.event_timestamp
            )`
}

/**
 * Build a query that will be used for retrieving source categories.
 * Returns:
 *   A SQL expression that selects source categories
*/
function selectSourceCategories(){
    let selectStatement = '';
    let i = 0;
    let { sourceCategories } = require("./source_categories.js");
    let sourceCategoriesLength = Object.keys(sourceCategories).length;
    for (row of sourceCategories) {
        i++;
        selectStatement = selectStatement.concat(`select "` + row.source + `" as source, "`+  row.sourceCategory + `" as source_category`);
        if (i < sourceCategoriesLength) {
            selectStatement = selectStatement.concat(` union distinct `)
        }
    }
    return selectStatement;
}

/**
 * Build a query that will be used for retrieving custom events.
 * Returns:
 *   A SQL expression that selects custom events
*/
function selectNonCustomEvents(){
    let selectStatement = '';
    let i = 0;
    let { nonCustomEvents } = require("./non_custom_events.js");
    let nonCustomEventsLength = Object.keys(nonCustomEvents).length;
    for (row of nonCustomEvents) {
        i++;
        selectStatement = selectStatement.concat(`select "` + row.eventName + `" as event_name`);
        if (i < nonCustomEventsLength) {
            selectStatement = selectStatement.concat(` union distinct `)
        }
    }
    return selectStatement;
}

module.exports = { unnestColumn, extractUrl, groupChannels, updatePaidSearchTrafficSource, adjustCampaignTimestamp, selectSourceCategories, selectNonCustomEvents };