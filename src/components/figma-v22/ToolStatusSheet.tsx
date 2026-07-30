// ToolStatusSheet — bottom sheet for unavailable / in-progress tools
// Must be mounted outside any overflow container in App.tsx

import { useEffect, useRef } from "react";

export interface ToolStatusData {
  name: string;
  statusLabel: string;
  statusColor: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  tool: ToolStatusData | null;
  onViewTools: () => void;
}

export default function ToolStatusSheet({ open, onClose, tool, onViewTools }: Props) {
  // Track the element that triggered open so we can restore focus on close
  const triggerRef = useRef<Element | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Capture the current focus target before the sheet steals it
      triggerRef.current = document.activeElement;
      // Move focus into the sheet
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      // Restore focus to the trigger element
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Don't render at all when closed — cleanest a11y: nothing in the tree
  if (!open || !tool) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 62,
          background: "rgba(40,37,61,0.38)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tool.name}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 63,
          background: "rgba(250,248,245,0.96)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          borderTop: "1px solid rgba(255,255,255,0.92)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 32px rgba(100,80,140,0.16)",
          padding: "0 24px 40px",
          animation: "sheet-rise 0.35s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(192,172,222,0.40)",
          margin: "12px auto 24px",
        }} />

        {/* Status badge */}
        <div style={{ marginBottom: 14 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 20,
            fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500,
            color: tool.statusColor,
            background: `${tool.statusColor}18`,
            border: `1px solid ${tool.statusColor}35`,
          }}>{tool.statusLabel}</span>
        </div>

        {/* Tool name */}
        <div style={{
          fontSize: 22, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700, color: "#28253D",
          marginBottom: 12, lineHeight: 1.35,
        }}>{tool.name}</div>

        {/* Description */}
        <div style={{
          fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#6B5E82", lineHeight: 1.72,
          marginBottom: 32,
        }}>{tool.description}</div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "rgba(192,172,222,0.16)",
          marginBottom: 24,
        }} />

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => { onClose(); onViewTools(); }}
            style={{
              padding: "14px 24px", borderRadius: 18,
              background: "linear-gradient(135deg, #6BBFA0, #7BBDE0)",
              border: "none", cursor: "pointer",
              fontSize: 15, fontFamily: "'Noto Sans SC', sans-serif",
              fontWeight: 500, color: "#fff",
              boxShadow: "0 4px 16px rgba(107,191,160,0.30)",
            }}
          >先看看可用工具</button>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            style={{
              padding: "13px 24px", borderRadius: 18,
              background: "rgba(255,255,255,0.68)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(192,172,222,0.28)",
              cursor: "pointer",
              fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
              fontWeight: 400, color: "#6B607E",
            }}
          >关闭</button>
        </div>
      </div>
    </>
  );
}
