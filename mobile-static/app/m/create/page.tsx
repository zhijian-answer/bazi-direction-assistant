"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreateProfileFlow } from "@/components/mobile/CreateProfileFlow";

export default function StaticCreateProfilePage() {
  return <Suspense fallback={null}><StaticCreateProfileContent /></Suspense>;
}

function StaticCreateProfileContent() {
  const searchParams = useSearchParams();
  return <CreateProfileFlow mode={searchParams.get("mode") === "new" ? "new" : "edit"} returnTo={searchParams.get("returnTo") ?? undefined} />;
}
