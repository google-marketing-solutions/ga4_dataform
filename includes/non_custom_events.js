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

/* source: https://support.google.com/analytics/answer/9234069?hl=en */

const nonCustomEvents = [
    { eventName:"ad_click" },
    { eventName:"ad_exposure" },
    { eventName:"ad_impression" },
    { eventName:"ad_query" },
    { eventName:"ad_reward" },
    { eventName:"adunit_exposure" },
    { eventName:"app_clear_data" },
    { eventName:"app_exception" },
    { eventName:"app_remove" },
    { eventName:"app_store_refund" },
    { eventName:"app_store_subscription_cancel" },
    { eventName:"app_store_subscription_convert" },
    { eventName:"app_store_subscription_renew" },
    { eventName:"app_update" },
    { eventName:"click" },
    { eventName:"dynamic_link_app_open" },
    { eventName:"dynamic_link_app_update" },
    { eventName:"dynamic_link_first_open" },
    { eventName:"error" },
    { eventName:"file_download" },
    { eventName:"firebase_campaign" },
    { eventName:"firebase_in_app_message_action" },
    { eventName:"firebase_in_app_message_dismiss" },
    { eventName:"firebase_in_app_message_impression" },
    { eventName:"first_open" },
    { eventName:"first_visit" },
    { eventName:"form_start" },
    { eventName:"form_submit" },
    { eventName:"in_app_purchase" },
    { eventName:"notification_dismiss" },
    { eventName:"notification_foreground" },
    { eventName:"notification_open" },
    { eventName:"notification_receive" },
    { eventName:"os_update" },
    { eventName:"page_view" },
    { eventName:"screen_view" },
    { eventName:"scroll" },
    { eventName:"session_start" },
    { eventName:"user_engagement" },
    { eventName:"video_complete" },
    { eventName:"video_progress" },
    { eventName:"video_start" },
    { eventName:"view_search_results" },
    { eventName:"earn_virtual_currency" },
    { eventName:"generate_lead" },
    { eventName:"join_group" },
    { eventName:"login" },
    { eventName:"purchase" },
    { eventName:"refund" },
    { eventName:"search" },
    { eventName:"select_content" },
    { eventName:"share" },
    { eventName:"sign_up" },
    { eventName:"spend_virtual_currency" },
    { eventName:"tutorial_begin" },
    { eventName:"tutorial_complete" },
    { eventName:"add_payment_info" },
    { eventName:"add_shipping_info" },
    { eventName:"add_to_cart" },
    { eventName:"add_to_wishlist" },
    { eventName:"begin_checkout" },
    { eventName:"purchase" },
    { eventName:"refund" },
    { eventName:"remove_from_cart" },
    { eventName:"select_item" },
    { eventName:"select_promotion" },
    { eventName:"view_cart" },
    { eventName:"view_item" },
    { eventName:"view_item_list" },
    { eventName:"view_promotion" },
    { eventName:"earn_virtual_currency" },
    { eventName:"join_group" },
    { eventName:"level_end" },
    { eventName:"level_start" },
    { eventName:"level_up" },
    { eventName:"post_score" },
    { eventName:"select_content" },
    { eventName:"spend_virtual_currency" },
    { eventName:"tutorial_begin" },
    { eventName:"tutorial_complete" },
    { eventName:"unlock_achievement"},
    { eventName:"campaign_details"},
];
module.exports = { nonCustomEvents };