"use client";

import { ArrowRight, BookOpenText, CircleGauge, Compass, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { PointerEvent } from "react";

const samplePillars = [
  ["年柱", "丙午", "天河水"],
  ["月柱", "癸巳", "长流水"],
  ["日柱", "己巳", "大林木"],
  ["时柱", "己巳", "大林木"],
];

export function HeroSection() {
  function moveInstrument(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    event.currentTarget.style.setProperty("--hero-x", `${x}px`);
    event.currentTarget.style.setProperty("--hero-y", `${y}px`);
  }

  function resetInstrument(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--hero-x", "0px");
    event.currentTarget.style.setProperty("--hero-y", "0px");
  }

  return (
    <section
      className="xuanshu-hero"
      onPointerMove={moveInstrument}
      onPointerLeave={resetInstrument}
      aria-labelledby="xuanshu-hero-title"
    >
      <div className="xuanshu-instrument" aria-hidden="true">
        <Image src="/xuanshu-hero-reference.png" alt="" fill priority sizes="(max-width: 760px) 120vw, 70vw" />
      </div>

      <div className="xuanshu-hero-content">
        <div className="xuanshu-kicker"><span />传统文化 · 结构化 · 可视化</div>
        <h1 id="xuanshu-hero-title" className="xuanshu-title">
          让命理，
          <br />
          被<span>科学</span>看见
        </h1>
        <p className="xuanshu-lead">
          结构化八字排盘、五行强弱分析、十神关系解读与大运流年推演，让复杂命盘以清晰的数据视角呈现。
        </p>
        <p className="xuanshu-boundary">服务于传统文化研究与娱乐参考，不替代现实证据与专业判断。</p>

        <div className="xuanshu-actions">
          <a href="#tool" className="xuanshu-primary">
            <Compass className="h-4 w-4" />
            开始排盘
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#learn" className="xuanshu-secondary">
            <BookOpenText className="h-4 w-4" />
            了解八字
          </a>
        </div>

        <div className="xuanshu-signals" aria-label="产品能力">
          <span><CircleGauge className="h-4 w-4" />双引擎核对</span>
          <span><ShieldCheck className="h-4 w-4" />克制解读</span>
        </div>
      </div>

      <div className="xuanshu-data-strip" aria-label="实时命盘示例">
        <div className="data-live"><i />实时排盘示例</div>
        <div className="data-date"><small>公历</small><strong>2026-05-20 09:30</strong></div>
        <div className="data-date data-lunar"><small>农历</small><strong>二〇二六年四月初四 巳时</strong></div>
        <div className="data-pillars">
          {samplePillars.map(([name, value, note]) => (
            <div key={name}><small>{name}</small><strong>{value}</strong><em>{note}</em></div>
          ))}
        </div>
        <div className="data-master"><small>日主</small><strong>己土</strong><em>阴土</em></div>
        <div className="data-elements"><small>五行统计</small><strong><b>木 2</b><b>火 3</b><b>土 4</b><b>金 1</b><b>水 1</b></strong></div>
        <a href="#tool" className="data-link">查看完整命盘 <ArrowRight className="h-3.5 w-3.5" /></a>
      </div>
    </section>
  );
}
