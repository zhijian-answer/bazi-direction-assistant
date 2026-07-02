"use client";

import { Check, Download, ImageDown, RefreshCw, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import type { SharePosterData } from "@/lib/mobile/types";
import { finishMobileTiming, startMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import { MobileSheet } from "./MobileSheet";
import { SharePoster } from "./SharePoster";
import { useShareImage } from "./useShareImage";

export function SharePosterSheet({ open, onClose, items, initialIndex = 0 }: { open: boolean; onClose: () => void; items: SharePosterData[]; initialIndex?: number }) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [notice, setNotice] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);
  const selected = items[selectedIndex] ?? items[0];
  const analyticsContext = { posterId: selected?.id ?? "unknown", category: selected?.category ?? "unknown" };
  const { dataUrl, status, error, generate, reset } = useShareImage(exportRef, analyticsContext);

  function choose(index: number) {
    setSelectedIndex(index);
    setNotice("");
    reset();
  }

  async function ensureImage() {
    return dataUrl ?? await generate();
  }

  async function saveImage() {
    const image = await ensureImage();
    if (!image) return;
    const link = document.createElement("a");
    link.download = `玄枢-${selected.id}-1080x1920.png`;
    link.href = image;
    link.click();
    trackMobileEvent("share_image_save_success", { ...analyticsContext, delivery: "browser_download_triggered" });
    setNotice("已生成 1080×1920 PNG。若浏览器未直接保存，可长按下方完整图片。 ");
  }

  async function shareImage() {
    const image = await ensureImage();
    if (!image) return;
    startMobileTiming("share_image_share");
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], `玄枢-${selected.id}.png`, { type: "image/png" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: selected.title, text: "玄枢 · 让命理，被科学看见", files: [file] });
        trackMobileEvent("share_image_share_success", analyticsContext, finishMobileTiming("share_image_share"));
        setNotice("图片分享面板已打开。 ");
      } else {
        trackMobileEvent("share_image_share_failure", { ...analyticsContext, reason: "file_share_unsupported" }, finishMobileTiming("share_image_share"));
        setNotice("当前设备不支持直接分享文件，请长按下方完整图片保存。 ");
      }
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        trackMobileEvent("share_image_share_failure", { ...analyticsContext, reason: "user_cancelled" }, finishMobileTiming("share_image_share"));
        return;
      }
      trackMobileEvent("share_image_share_failure", { ...analyticsContext, reason: "share_api_error" }, finishMobileTiming("share_image_share"));
      setNotice("未能打开图片分享，请长按下方完整图片保存。 ");
    }
  }

  if (!selected) return null;

  return (
    <MobileSheet open={open} title="生成分享图" onClose={onClose} layerClassName="share-poster-sheet-layer">
      <div className="share-poster-sheet">
        {items.length > 1 ? (
          <div className="share-poster-options" aria-label="选择分享图内容">
            {items.map((item, index) => <button key={item.id} type="button" className={selectedIndex === index ? "is-active" : ""} onClick={() => choose(index)}>{item.eyebrow}</button>)}
          </div>
        ) : null}
        <div className="share-poster-preview-frame">
          {/* Generated data URLs must remain verbatim so users can long-press the exact export. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {dataUrl ? <img src={dataUrl} alt={`${selected.title}分享图`} /> : <SharePoster data={selected} />}
        </div>
        <div className="share-poster-export-node" aria-hidden="true"><SharePoster ref={exportRef} data={selected} exportMode /></div>
        <div className="share-poster-actions">
          <button type="button" onClick={generate} disabled={status === "generating"}>
            {status === "ready" ? <Check /> : status === "error" ? <RefreshCw /> : <ImageDown />}
            {status === "generating" ? "正在生成" : status === "ready" ? "已生成" : status === "error" ? "重新生成" : "生成高清图"}
          </button>
          <button type="button" onClick={saveImage} disabled={status === "generating"}><Download />保存 PNG</button>
          <button type="button" onClick={shareImage} disabled={status === "generating"}><Share2 />分享图片</button>
        </div>
        <p className="share-poster-spec">实际输出 1080×1920 PNG。iOS 或微信无法直接下载时，可长按生成后的完整图片保存。</p>
        {error ? <p className="share-poster-error" role="alert">{error}</p> : null}
        {notice ? <p className="share-poster-notice" role="status">{notice}</p> : null}
      </div>
    </MobileSheet>
  );
}
