import { Fingerprint, Orbit, Sparkles } from "lucide-react";
import { forwardRef } from "react";
import type { SharePosterData } from "@/lib/mobile/types";

export const SharePoster = forwardRef<HTMLDivElement, { data: SharePosterData; exportMode?: boolean }>(function SharePoster({ data, exportMode = false }, ref) {
  const Icon = data.category === "zodiac" ? Orbit : data.category === "question" ? Sparkles : Fingerprint;
  return (
    <div ref={ref} className={`share-poster share-poster--${data.tone} ${exportMode ? "share-poster--export" : ""}`} data-testid={exportMode ? "share-poster-export" : "share-poster-preview"}>
      <header>
        <span><Icon />玄枢</span>
        <small>{data.eyebrow}</small>
      </header>
      <div className="share-poster-mark" aria-hidden="true">玄</div>
      <main>
        <span className="share-poster-kicker">让命理，被科学看见</span>
        <h2>{data.title}</h2>
        <p>{data.body}</p>
        <div className="share-poster-tags">{data.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </main>
      <footer>
        <strong>玄枢 · 结构化自我观察</strong>
        <span>{data.footer}</span>
        <small>仅供传统文化研究与自我观察</small>
      </footer>
    </div>
  );
});
