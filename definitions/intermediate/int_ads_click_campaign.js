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
    publish("int_ads_click_campaign")
    .query(ctx => `with clickCampaign as (
                        select
                            cs.click_view_gclid as gclid,
                            cs.campaign_id as campaign_id,
                            ca.campaign_name as campaign_name
                        from ${ctx.ref('ads_ClickStats_' + constants.GADS_CUSTOMER_ID)} as cs
                        left join ${ctx.ref('ads_Campaign_' + constants.GADS_CUSTOMER_ID)} as ca
                            using (campaign_id)
                        qualify row_number() over (
                            partition by gclid
                        ) = 1
                    )
                    select
                        *
                    from clickCampaign`)
    .type("table")
    .schema(constants.INTERMEDIATE_DATASET)
    ;
}