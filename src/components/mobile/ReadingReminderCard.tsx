"use client";

import { MessageCircleMore } from "lucide-react";
import { motion } from "framer-motion";

export function ReadingReminderCard({ title, note }: { title: string; note: string }) {
  return (
    <motion.aside className="reading-reminder-card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <MessageCircleMore />
      <div><small>给今天的你</small><strong>{title}</strong><p>{note}</p></div>
    </motion.aside>
  );
}
