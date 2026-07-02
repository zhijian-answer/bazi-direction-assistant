import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MobileAppFrame } from "@/components/mobile/MobileAppFrame";
import "./mobile.css";

export const metadata: Metadata = {
  title: "玄枢｜生辰与星座报告",
  description: "用更容易看懂的方式阅读生辰、五行、大运和星座报告。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f1eb",
};

export default function MobileLayout({ children }: { children: ReactNode }) {
  return <MobileAppFrame>{children}</MobileAppFrame>;
}
