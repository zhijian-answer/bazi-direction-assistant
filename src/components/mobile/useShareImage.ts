"use client";

import { toPng } from "html-to-image";
import { useCallback, useState } from "react";
import type { RefObject } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";

export function useShareImage(targetRef: RefObject<HTMLElement | null>, analyticsContext: { posterId: string; category: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setDataUrl(null);
    setStatus("idle");
    setError("");
  }, []);

  const generate = useCallback(async () => {
    if (!targetRef.current || status === "generating") return null;
    const startedAt = performance.now();
    trackMobileEvent("share_image_generate_start", analyticsContext);
    setStatus("generating");
    setError("");
    try {
      await document.fonts?.ready;
      const next = await toPng(targetRef.current, {
        width: 360,
        height: 640,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#243536",
      });
      setDataUrl(next);
      setStatus("ready");
      trackMobileEvent("share_image_generate_success", analyticsContext, Math.round((performance.now() - startedAt) * 10) / 10);
      return next;
    } catch {
      setStatus("error");
      setError("图片生成失败，请检查网络后重试。预览内容仍会保留。");
      trackMobileEvent("share_image_generate_failure", analyticsContext, Math.round((performance.now() - startedAt) * 10) / 10);
      return null;
    }
  }, [analyticsContext, status, targetRef]);

  return { dataUrl, status, error, generate, reset };
}
