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
function updatePaidTrafficSource(struct, structColumn, tableAlias, gadsCampaignName) {
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
        trafficSource.cpcValue = '(not set)';
        trafficSource.cpmValue = '(not set)';
        userTrafficSourceColumn = 'campaign';
    }

    return `if(${tableAlias}.event_name in ('first_visit', 'first_open') and ${tableAlias}.${struct}.${structColumn} is null,
                ${tableAlias}.traffic_source.${userTrafficSourceColumn},
                if(${tableAlias}.collected_traffic_source.gclid is not null or ${tableAlias}.page_location like '%gbraid%' or ${tableAlias}.page_location like '%wbraid%',
                    if ('${structColumn}' in ('manual_campaign_name'),
                        if (${gadsCampaignName} is null,
                            if (${tableAlias}.${struct}.${structColumn} is null or ${tableAlias}.${struct}.${structColumn} like '(organic)' ,
                                '${trafficSource.cpcValue}',
                                ${tableAlias}.${struct}.${structColumn}
                            ),
                            ${gadsCampaignName}
                        ),
                        if('${structColumn}' in ('manual_source'),
                            ifnull(${tableAlias}.${struct}.${structColumn}, '${trafficSource.cpcValue}'),
                            '${trafficSource.cpcValue}'
                        )
                    ),
                    if(${tableAlias}.collected_traffic_source.dclid is not null and ${tableAlias}.collected_traffic_source.gclid is null,
                        '${trafficSource.cpmValue}',
                        ${tableAlias}.${struct}.${structColumn}
                    )
                )
            )`;
}

module.exports = { unnestColumn, extractUrl, updatePaidTrafficSource};