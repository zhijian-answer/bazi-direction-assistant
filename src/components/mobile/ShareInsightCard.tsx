"use client";

import { Compass, Eye, Fingerprint, Heart, MessagesSquare, Share2, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import type { ShareInsightData } from "@/lib/mobile/types";

export function ShareInsightCard({ item, onShare }: { item: ShareInsightData; onShare: () => void }) {
  const Icon = {
    poster: Fingerprint,
    zones: ShieldCheck,
    today: SunMedium,
    signature: Sparkles,
    social: MessagesSquare,
    memory: Eye,
    love: Heart,
    week: Compass,
  }[item.id] || Sparkles;

  return (
    <motion.article className={`share-insight-card share-insight-card--${item.tone}`} whileTap={{ scale: 0.986, y: -2 }}>
      <header>
        <small><Icon />{item.eyebrow}</small>
        <button type="button" onClick={onShare} aria-label={`生成分享图：${item.title}`} title="生成这张分享图">
          <Share2 />
        </button>
      </header>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <footer><span>玄枢</span><small>{item.footer}</small></footer>
    </motion.article>
  );
}
