"use client";

import { useEffect, useMemo, useState } from "react";
import type { NarrativeCard, NarrativeRequest, NarrativeResponse } from "./contracts";
import { buildLocalNarrative } from "./local";

const remoteEnabled = process.env.NEXT_PUBLIC_NARRATIVE_API_ENABLED === "true";
const remoteBase = (process.env.NEXT_PUBLIC_NARRATIVE_API_URL || "").replace(/\/$/, "");

export function useNarrativeCard(input: NarrativeRequest | null): NarrativeCard | null {
  const serialized = useMemo(() => input ? JSON.stringify(input) : "", [input]);
  const localCard = useMemo(() => serialized ? buildLocalNarrative(JSON.parse(serialized) as NarrativeRequest) : null, [serialized]);
  const [remote, setRemote] = useState<{ key: string; response: NarrativeResponse } | null>(null);

  useEffect(() => {
    if (!remoteEnabled || !serialized) return;
    const controller = new AbortController();
    const url = `${remoteBase}/api/narratives`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialized,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Narrative API ${response.status}`);
        return response.json() as Promise<NarrativeResponse>;
      })
      .then((response) => setRemote({ key: serialized, response }))
      .catch(() => undefined);

    return () => controller.abort();
  }, [serialized]);

  return remote?.key === serialized ? remote.response.card : localCard;
}
