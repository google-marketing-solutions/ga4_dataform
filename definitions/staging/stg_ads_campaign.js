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

if (constants.GADS_GET_DATA){
    publish("stg_ads_campaign")
    .query(ctx => `with source as (
                        select *
                        from ${ctx.ref('ads_Campaign_' + constants.GADS_CUSTOMER_ID)}
                        where _data_date > cast('${constants.START_DATE}' as date format 'yyyymmdd')
                        and _data_date = _latest_date
                    )
                    select
                        *
                    from source`)
    .type("table")
    .schema(constants.STAGING_DATASET);
}