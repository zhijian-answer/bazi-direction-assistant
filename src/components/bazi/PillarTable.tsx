import type { BaziChart, ChartPosition } from "@/lib/types";

const positions: ChartPosition[] = ["year", "month", "day", "time"];
const labels: Record<ChartPosition, string> = { year: "年柱", month: "月柱", day: "日柱", time: "时柱" };

export function PillarTable({ chart, timeUnknown }: { chart: BaziChart; timeUnknown: boolean }) {
  return (
    <section className="panel overflow-hidden" aria-labelledby="pillar-title">
      <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <div className="section-kicker">基础命盘</div>
        <h3 id="pillar-title" className="mt-1 font-display text-xl">四柱八字</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="bazi-table min-w-[640px]">
          <thead>
            <tr><th>命盘信息</th>{positions.map((position) => <th key={position}>{labels[position]}</th>)}</tr>
          </thead>
          <tbody>
            <tr className="pillar-main"><th>干支</th>{positions.map((position) => <td key={position}>{position === "time" && timeUnknown ? "参考" : chart.pillars[position]}</td>)}</tr>
            <tr><th>天干十神</th>{positions.map((position) => <td key={position}>{chart.tenGods[position] || "日主"}</td>)}</tr>
            <tr><th>藏干</th>{positions.map((position) => <td key={position}>{chart.hiddenStems?.[position]?.join(" · ") || "—"}</td>)}</tr>
            <tr><th>藏干十神</th>{positions.map((position) => <td key={position}>{chart.hiddenTenGods?.[position]?.join(" · ") || "—"}</td>)}</tr>
            <tr><th>纳音</th>{positions.map((position) => <td key={position}>{chart.nayin[position]}</td>)}</tr>
          </tbody>
        </table>
      </div>
      {timeUnknown && <p className="border-t border-[var(--line)] bg-[var(--soft)] px-5 py-3 text-xs leading-5 text-[var(--muted)]">出生时间未知，时柱暂按中午生成，仅用于了解页面结构；涉及时柱的内容请谨慎参考。</p>}
    </section>
  );
}
