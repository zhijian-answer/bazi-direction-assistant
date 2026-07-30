"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CompatibilityCreateFlow } from "@/components/mobile/CompatibilityCreateFlow";

export default function StaticCompatibilityCreatePage() {
  return <Suspense fallback={null}><StaticCompatibilityCreateContent /></Suspense>;
}

function StaticCompatibilityCreateContent() {
  const searchParams = useSearchParams();
  return <CompatibilityCreateFlow initialMode={searchParams.get("mode") === "bazi" ? "bazi" : "astrology"} />;
}
