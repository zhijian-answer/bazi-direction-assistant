import { ArrowRight, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import styles from "./ChatEntryCard.module.css";

export function ChatEntryCard() {
  return (
    <Link className={styles.entry} href="/m/chat">
      <span className={styles.icon} aria-hidden="true"><MessageCircleMore /></span>
      <span className={styles.copy}>
        <small>继续问玄枢</small>
        <strong>把你真正想了解的事情直接说出来</strong>
        <em>回答会注明使用了哪些命盘依据</em>
      </span>
      <ArrowRight className={styles.arrow} aria-hidden="true" />
    </Link>
  );
}
