import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "玄枢",
    short_name: "玄枢",
    description: "用更容易看懂的方式阅读生辰、星盘、紫微与关系报告。",
    id: "/m",
    start_url: "/m",
    scope: "/m",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f0ff",
    theme_color: "#f4f0ff",
    lang: "zh-CN",
    categories: ["lifestyle", "utilities"],
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/maskable-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
