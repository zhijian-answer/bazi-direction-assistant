export const mobileAnalyticsEvents = [
  "home_hero_impression",
  "question_click",
  "question_sheet_open",
  "question_change",
  "share_image_generate_start",
  "share_image_generate_success",
  "share_image_generate_failure",
  "share_image_save_success",
  "share_image_share_success",
  "share_image_share_failure",
] as const;

export type MobileAnalyticsEventName = (typeof mobileAnalyticsEvents)[number];
