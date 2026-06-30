import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: "八字命盘助手",
    short_name: "命盘助手",
    description: "免费的中文四柱八字排盘与五行、大运流年参考工具。",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f0e7",
    theme_color: "#26231f",
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
