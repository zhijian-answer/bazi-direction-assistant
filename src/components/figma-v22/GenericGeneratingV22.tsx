"use client";

import { useRouter } from "next/navigation";
import GeneratingScreen from "./GeneratingScreen";
import { resolveGeneratingRoute } from "@/lib/mobile/navigation";
import { useMobileProfile } from "@/lib/mobile/profile";

export function GenericGeneratingV22({ next }: { next?: string }) {
  const router = useRouter();
  const profile = useMobileProfile();
  return <div className="figma-v22-app" style={{ minHeight: "100svh", background: "linear-gradient(140deg, #EDE8F8 0%, #E4F4EE 50%, #FCEEE9 100%)" }}><div className="figma-v22-shell" style={{ width: "100%", maxWidth: 430, height: "100svh", maxHeight: 932, position: "relative", overflow: "hidden", margin: "0 auto" }}><GeneratingScreen profileName={profile.name || "你"} onComplete={() => router.replace(resolveGeneratingRoute(next || "bazi"))} /></div></div>;
}
