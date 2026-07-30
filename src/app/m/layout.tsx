import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/noto-serif-sc/wght.css";
import { MobileAppFrame } from "@/components/mobile/MobileAppFrame";
import "@/styles/xuanshu-tokens.css";
import "./mobile.css";
import "@/styles/xuanshu-theme.css";
import "@/styles/xuanshu-reports.css";
import "@/styles/xuanshu-motion.css";
import "@/styles/xuanshu-home.css";
import "@/styles/xuanshu-style-lab-home.css";
import "@/styles/xuanshu-app-final.css";
import "@/styles/xuanshu-expansion.css";
import "@/styles/xuanshu-home-v2.css";
import "@/styles/xuanshu-figma-redesign.css";
import "@/styles/figma-v22.css";

export const metadata: Metadata = {
  title: "玄枢｜生辰、星座与紫微报告",
  description: "用更容易看懂的方式阅读生辰、星座和紫微领域报告。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f0ff",
};

export default function MobileLayout({ children }: { children: ReactNode }) {
  return <MobileAppFrame>{children}</MobileAppFrame>;
}
