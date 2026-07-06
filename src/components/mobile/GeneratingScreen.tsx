"use client";

import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileShell } from "./MobileShell";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";
import orbitMark from "../../../public/mobile/xuanshu-orbit-mark.webp";

const steps = [
  { title: "正在整理出生时间", description: "校准历法、日期与时辰信息" },
  { title: "正在建立结构关系", description: "构建四柱、星体与领域结构" },
  { title: "正在转换成容易理解的内容", description: "提炼核心结构并生成观察建议" },
];

function nextRoute(next: string) {
  if (next === "zodiac") return "/m/report/zodiac";
  if (next === "ziwei") return "/m/report/ziwei";
  return "/m/report/bazi";
}

export function GeneratingScreen({ next = "bazi" }: { next?: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, index) => window.setTimeout(() => setCurrent(index + 1), 620 * (index + 1)));
    const finish = window.setTimeout(() => router.replace(nextRoute(next)), 2550);
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
          <Image src={armillaryImage} alt="黄铜天体仪结构" priority loading="eager" />
          <i /><i /><i />
        </figure>

        <div className="generating-steps generating-steps--market">
          {steps.map((step, index) => {
            const done = current > index;
            const active = current === index;
            return (
              <div key={step.title} className={done ? "is-done" : active ? "is-active" : ""}>
                <span>{done ? <Check /> : active ? <LoaderCircle className="is-spinning" /> : index + 1}</span>
                <p><strong>{step.title}</strong><small>{step.description}</small></p>
              </div>
            );
          })}
        </div>

        <aside className="generating-boundary">
          <ShieldCheck />
          <p><strong>不会生成绝对判断，只提供结构化观察</strong><span>玄枢基于传统结构与本地规则整理内容，帮助你看清趋势与关系，做出更适合自己的选择。</span></p>
        </aside>
      </section>
    </MobileShell>
  );
}
