import Link from "next/link";
import type { MarketInfoContent } from "@/lib/market-info-content";
import styles from "./MarketInfoPage.module.css";

export function MarketInfoPage({ content }: { content: MarketInfoContent }) {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <header className={styles.header}>
          <Link href="/m" className={styles.brand}><span>玄</span><strong>玄枢</strong></Link>
          <small>{content.eyebrow}</small>
          <h1>{content.title}</h1>
          <p>{content.summary}</p>
          <time>更新于 {content.updatedAt}</time>
        </header>
        <div className={styles.sections}>
          {content.sections.map((section, index) => (
            <section key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</div>
            </section>
          ))}
        </div>
        <footer className={styles.footer}><Link href="/m">返回玄枢</Link><nav><Link href="/privacy">隐私说明</Link><Link href="/terms">用户协议</Link><Link href="/about">关于我们</Link></nav></footer>
      </article>
    </main>
  );
}
