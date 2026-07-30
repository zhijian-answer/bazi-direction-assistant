import { ArrowRight, Compass } from "lucide-react";
import Image from "next/image";

export function StyleLabHeroCard() {
  return (
    <section className="style-lab-hero-card" aria-label="今日观察封面">
      <Image
        className="style-lab-hero-instrument"
        src="/mobile/style-lab-assets/hero-plate-v3.png"
        alt=""
        width={1396}
        height={1127}
        priority
      />
      <div className="style-lab-hero-rings" aria-hidden="true" />
      <div className="style-lab-hero-content">
        <span className="style-lab-hero-kicker" aria-hidden="true">
          <Image src="/mobile/style-lab-assets/hero-marker.png" alt="" width={56} height={60} />
        </span>
        <h1>
          先看今天的你，
          <br />
          再决定要不要<span>往下挖</span>
        </h1>
        <p>建立你的专属命理档案前，你可以先查看今日观察，了解结构化的命理视角与趋势，感受玄枢的分析方式。</p>
        <div className="style-lab-hero-actions" aria-label="首页主要操作">
          <button className="style-lab-primary-button" type="button">
            <Compass aria-hidden="true" />
            创建我的档案
            <ArrowRight aria-hidden="true" />
          </button>
          <button className="style-lab-secondary-button" type="button">
            先看示例
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
