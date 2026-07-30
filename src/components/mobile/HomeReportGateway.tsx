import { ArrowRight, CalendarRange, CircleDotDashed, Sparkles } from "lucide-react";
import Link from "next/link";

const reports = [
  { title: "生辰", note: "看行动方式与环境适配", href: "/m/report/bazi", icon: CalendarRange },
  { title: "星座", note: "看情绪回应与关系需要", href: "/m/report/zodiac", icon: Sparkles },
  { title: "紫微", note: "看精力投向与阶段重点", href: "/m/report/ziwei", icon: CircleDotDashed },
] as const;

export function HomeReportGateway() {
  return (
    <section className="home-v2-reports" aria-labelledby="home-v2-reports-title">
      <header><small>继续理解自己</small><h2 id="home-v2-reports-title">想看得更深，再回到报告</h2><p>今天的观察只是入口，完整依据留在你的个人报告里。</p></header>
      <div className="home-v2-report-list">
        {reports.map((report) => {
          const Icon = report.icon;
          return <Link href={report.href} key={report.title}><Icon /><span><strong>{report.title}</strong><small>{report.note}</small></span><ArrowRight /></Link>;
        })}
      </div>
      <Link className="home-v2-reports__all" href="/m/report">查看全部报告<ArrowRight /></Link>
    </section>
  );
}
