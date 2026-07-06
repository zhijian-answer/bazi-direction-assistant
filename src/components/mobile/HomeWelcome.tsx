"use client";

import { ArrowRight, Eye, FileText, Orbit, ShieldCheck, Target, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";
import orbitMark from "../../../public/mobile/xuanshu-orbit-mark.webp";

const welcomeSteps = [
  { index: "01", title: "建立一份个人档案", body: "填写出生日期、时间与地点，形成只属于你的观察基础。", icon: UserRound },
  { index: "02", title: "先看此刻最关心的事", body: "从工作、关系、选择和状态里，挑一个问题开始。", icon: Target },
  { index: "03", title: "得到能落到今天的建议", body: "先看结论和行动，再按需要展开生辰、星座与紫微依据。", icon: FileText },
];

export function HomeWelcome({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="home-welcome home-welcome--refined">
      <header className="home-welcome__brand">
        <Image src={orbitMark} alt="" priority />
        <div><strong>玄枢</strong><small>东方命理数据实验室</small></div>
        <span><UserRound />游客模式</span>
      </header>

      <main className="home-welcome__journey">
        <section className="home-welcome__intro">
          <div className="home-welcome__copy">
            <small>让命理，被科学看见</small>
            <h1>先看今天的你，<br />再决定要不要<span>往下挖</span></h1>
            <p>建立你的专属档案，把传统命理结构翻译成更容易理解、也更能行动的观察。</p>
          </div>

          <div className="home-welcome__orbit-stage" aria-hidden="true">
            <span className="home-welcome__orbit home-welcome__orbit--one" />
            <span className="home-welcome__orbit home-welcome__orbit--two" />
            <span className="home-welcome__node home-welcome__node--one" />
            <span className="home-welcome__node home-welcome__node--two" />
            <Image className="home-welcome__instrument" src={armillaryImage} alt="" priority />
          </div>

          <div className="home-welcome__actions">
            <Link href="/m/create" onClick={() => trackMobileEvent("profile_create_start", { source: "onboarding" })}><Target />创建我的档案<ArrowRight /></Link>
            <button type="button" onClick={() => { trackMobileEvent("onboarding_demo_select", { source: "onboarding" }); onDemo(); }}><Eye />先看示例<ArrowRight /></button>
          </div>
        </section>

        <section className="home-welcome__steps" aria-label="开始使用玄枢的三个步骤">
          <header><span>第一次使用</span><h2>三步得到一份能看懂、能行动的观察</h2></header>
          <ol>
            {welcomeSteps.map(({ index, title, body, icon: Icon }) => (
              <li key={index}>
                <span className="home-welcome__step-index">{index}</span>
                <span className="home-welcome__step-icon"><Image src={orbitMark} alt="" /><Icon /></span>
                <span className="home-welcome__step-copy"><strong>{title}</strong><small>{body}</small></span>
              </li>
            ))}
          </ol>
        </section>

        <section className="home-welcome__principles">
          <header><small>我们的边界</small><h2>认真解释，不替你下结论</h2></header>
          <div>
            <p><ShieldCheck /><span><strong>结构化观察</strong><small>内容有依据、有边界</small></span></p>
            <p><Target /><span><strong>不做绝对预测</strong><small>只提供趋势与行动参考</small></span></p>
            <p><Orbit /><span><strong>游客也能使用</strong><small>登录只用于跨设备保存</small></span></p>
          </div>
        </section>
      </main>
    </div>
  );
}
