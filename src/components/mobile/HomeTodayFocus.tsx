import { Check, Focus, Pause } from "lucide-react";
import type { DailyInsightData } from "@/lib/mobile/types";

function splitItems(value: string) {
  return value.split("、").map((item) => item.trim()).filter(Boolean).slice(0, 3);
}

export function HomeTodayFocus({ insight }: { insight: DailyInsightData }) {
  const suitable = splitItems(insight.suitable);
  const avoid = splitItems(insight.avoid);

  return (
    <section className="home-v2-focus" id="home-today-focus" aria-labelledby="home-v2-focus-title">
      <header><small><Focus />今日落点</small><h2 id="home-v2-focus-title">今天只做这一件</h2></header>
      <p className="home-v2-focus__action">{insight.action}</p>
      <div className="home-v2-focus__balance">
        <div><small><Check />适合</small><p>{suitable.join(" · ")}</p></div>
        <div><small><Pause />先放下</small><p>{avoid.join(" · ")}</p></div>
      </div>
    </section>
  );
}
