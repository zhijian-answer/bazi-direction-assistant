import type { BaziChart, ElementKey } from "@/lib/types";

const order: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];
const labels: Record<ElementKey, string> = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };
const notes: Record<ElementKey, string> = { wood: "生长与规划", fire: "表达与行动", earth: "稳定与承接", metal: "规则与取舍", water: "观察与积累" };

export function FiveElementsCard({ chart }: { chart: BaziChart }) {
  const balance = chart.engine?.weightedBalance || chart.wuxing.balance;
  const total = Object.values(balance).reduce((sum, value) => sum + value, 0) || 1;

  return (
    <section id="wuxing" className="panel p-5 sm:p-6" aria-labelledby="wuxing-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="section-kicker">能量结构</div>
          <h3 id="wuxing-title" className="mt-1 font-display text-xl">五行分布</h3>
        </div>
        <span className="text-xs text-[var(--muted)]">{chart.engine?.weightedBalance ? "综合藏干权重" : "八字字数统计"}</span>
      </div>
      <div className="mt-5 space-y-4">
        {order.map((key) => {
          const percent = Math.round((balance[key] / total) * 100);
          return (
            <div key={key} className="grid grid-cols-[44px_1fr_42px] items-center gap-3">
              <div className={`element-swatch element-${key}`}>{labels[key]}</div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-[var(--muted)]"><span>{notes[key]}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--soft)]"><div className={`h-full element-bar-${key}`} style={{ width: `${Math.max(3, percent)}%` }} /></div>
              </div>
              <div className="text-right font-medium tabular-nums">{percent}%</div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 border-t border-[var(--line)] pt-4 text-xs leading-6 text-[var(--muted)]">
        {chart.engine?.validationStatus === "matched" && `已完成双引擎核对，四柱 ${chart.engine.matchedPillars}/4 一致。`}
        {chart.engine?.validationStatus === "different" && `双引擎核对有 ${chart.engine.matchedPillars}/4 柱一致；不同算法可能存在节气或时辰口径差异，当前以主排盘结果为准。`}
        {chart.engine?.validationStatus === "unavailable" && "当前出生年份或输入类型不在辅助引擎校验范围内，结果由主排盘引擎生成。"}
      </div>
    </section>
  );
}
