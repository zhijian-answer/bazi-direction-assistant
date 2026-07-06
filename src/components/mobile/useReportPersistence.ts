"use client";

import { useEffect } from "react";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { ReportType } from "@/lib/types";

export function useReportPersistence(type: ReportType, content: Record<string, unknown> | undefined, versionKey: string) {
  const profile = useMobileProfile();

  useEffect(() => {
    if (!profile.cloudProfileId || (type !== "bazi" && !content)) return;
    const storageKey = `xuanshu-report-persisted:${profile.cloudProfileId}:${type}:${versionKey}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "pending");
    void fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.cloudProfileId, type, content, ruleVersion: versionKey }),
    }).then((response) => {
      if (!response.ok) window.sessionStorage.removeItem(storageKey);
      else window.sessionStorage.setItem(storageKey, "saved");
    }).catch(() => window.sessionStorage.removeItem(storageKey));
  }, [content, profile.cloudProfileId, type, versionKey]);
}
