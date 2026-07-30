import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/noto-serif-sc/wght.css";
import "../../src/app/globals.css";
import "../../src/styles/xuanshu-tokens.css";
import "../../src/app/m/mobile.css";
import "../../src/styles/xuanshu-theme.css";
import "../../src/styles/xuanshu-reports.css";
import "../../src/styles/xuanshu-motion.css";
import "../../src/styles/xuanshu-home.css";
import "../../src/styles/xuanshu-app-final.css";
import "../../src/styles/xuanshu-expansion.css";
import "../../src/styles/xuanshu-home-v2.css";
import "../../src/styles/figma-v22.css";

const basePath = process.env.PAGES_BASE_PATH || "";

export const metadata: Metadata = {
  title: "玄枢｜生辰、星座与紫微报告",
  description: "用更容易看懂的方式阅读生辰、星座和紫微领域报告。",
  icons: { icon: `${basePath}/icon.svg` },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f0ff",
};

export default function StaticRootLayout({ children }: { children: ReactNode }) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
