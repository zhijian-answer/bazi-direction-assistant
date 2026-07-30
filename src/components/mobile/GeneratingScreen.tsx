"use client";

import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { resolveGeneratingRoute } from "@/lib/mobile/navigation";
import { MobileShell } from "./MobileShell";
import orbitMark from "../../../public/mobile/xuanshu-orbit-mark.webp";

const steps = [
  { title: "正在整理出生时间", description: "校准历法、日期与时辰信息" },
  { title: "正在建立结构关系", description: "构建四柱、星体与领域结构" },
  { title: "正在转换成容易理解的内容", description: "提炼核心结构并生成观察建议" },
];

export function GeneratingScreen({ next = "bazi" }: { next?: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, index) => window.setTimeout(() => setCurrent(index + 1), 620 * (index + 1)));
    const finish = window.setTimeout(() => router.replace(resolveGeneratingRoute(next)), 2550);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [next, router]);

  return (
    <MobileShell withNav={false} theme="home">
      <header className="generating-topbar">
        <div><Image src={orbitMark} alt="" priority /><strong>玄枢</strong><small>东方命理数据实验室</small></div>
        <span><LoaderCircle />命盘生成中</span>
      </header>

      <section className="generating-screen generating-screen--market">
        <small>本地结构计算</small>
        <h1>命盘正在建立结构</h1>
        <p>请稍候，正在为你生成更容易理解的观察结果</p>

        <figure className="generating-orbit-panel" aria-label="命盘结构生成示意">
          <Image src="/mobile/style-lab-assets/generating-orbit-chart.png" alt="黄铜天文方位数据盘" width={941} height={720} priority loading="eager" />
          <i /><i /><i />
        </figure>

        <div className="generating-steps generating-steps--market">
          {steps.map((step, index) => {
            const done = current > index;
            const active = current === index;
            return (
              <div key={step.title} className={done ? "is-done" : active ? "is-active" : ""}>
                <span>{index + 1}</span>
                <p><strong>{step.title}</strong><small>{step.description}</small></p>
                <i aria-hidden="true" />
              </div>
            );
          })}
        </div>

        <aside className="generating-boundary">
          <p><strong>生成过程由本地逻辑完成，</strong><span>不依赖虚构 AI 分析。</span></p>
        </aside>
      </section>
    </MobileShell>
  );
}
