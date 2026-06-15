export const appId = "bazi-direction-assistant";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "http://localhost:3000")
    .replace(/\/+$/, "");
}
