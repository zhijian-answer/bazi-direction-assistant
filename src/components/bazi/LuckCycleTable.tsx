import type { BaziChart } from "@/lib/types";

export function LuckCycleTable({ chart }: { chart: BaziChart }) {
  const cycles = chart.luckCycles || [];
  const annual = chart.annualLuck || [];

  return (
    <section id="luck" className="panel overflow-hidden" aria-labelledby="luck-title">
      <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <div className="section-kicker">时间节奏</div>
        <h3 id="luck-title" className="mt-1 font-display text-xl">大运与流年</h3>
      </div>
      {cycles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="bazi-table min-w-[760px]">
            <thead><tr><th>大运</th>{cycles.map((cycle) => <th key={`${cycle.startYear}-${cycle.ganZhi}`}>{cycle.ganZhi}</th>)}</tr></thead>
            <tbody>
              <tr><th>年龄</th>{cycles.map((cycle) => <td key={cycle.startYear}>{cycle.startAge}—{cycle.endAge} 岁</td>)}</tr>
              <tr><th>年份</th>{cycles.map((cycle) => <td key={cycle.startYear}>{cycle.startYear}—{cycle.endYear}</td>)}</tr>
            </tbody>
          </table>
        </div>
      ) : <p className="px-5 py-6 text-sm text-[var(--muted)]">旧档案尚未生成大运信息，重新排盘后即可查看。</p>}

      {annual.length > 0 && (
        <div className="border-t border-[var(--line)] px-5 py-5 sm:px-6">
          <h4 className="text-sm font-semibold">近年流年简表</h4>
          <div className="mt-3 grid grid-cols-4 gap-px overflow-hidden rounded-md border border-[var(--line)] bg-[var(--line)] sm:grid-cols-7">
            {annual.map((item) => (
              <div key={item.year} className="bg-[var(--paper)] px-2 py-3 text-center">
                <div className="text-xs text-[var(--muted)]">{item.year}</div>
                <div className="mt-1 font-display text-lg">{item.ganZhi}</div>
                <div className="mt-1 text-[11px] text-[var(--muted)]">{item.age} 岁</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
