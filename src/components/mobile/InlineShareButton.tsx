"use client";

import { Share2 } from "lucide-react";
import { motion } from "framer-motion";

export function InlineShareButton({ title, onShare }: { title: string; onShare: () => void }) {
  return (
    <motion.button type="button" className="inline-share-button" onClick={onShare} whileTap={{ scale: 0.9 }} aria-label={`生成分享图：${title}`} title="生成分享图">
      <Share2 />
    </motion.button>
  );
}
