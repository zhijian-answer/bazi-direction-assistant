import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: "八字方向助手",
    short_name: "方向助手",
    description: "免费的四柱八字人生方向参考工具，帮助用户在迷茫时找到下一步行动。",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7f2",
    theme_color: "#23231f",
    lang: "zh-CN",
    categories: ["lifestyle", "utilities"],
    icons: [
      {
        src: `${siteUrl}/app-icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `${siteUrl}/maskable-icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
