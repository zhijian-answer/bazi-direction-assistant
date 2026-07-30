import Image from "next/image";
import { StyleLabActionPanel } from "./StyleLabActionPanel";
import { StyleLabBottomNav } from "./StyleLabBottomNav";
import { StyleLabHeroCard } from "./StyleLabHeroCard";
import { StyleLabQuestionCard } from "./StyleLabQuestionCard";

const questionCards = [
  {
    iconSrc: "/mobile/style-lab-assets/question-today.png",
    title: "今日观察",
    body: "快速了解今天的能量重点与行动建议",
  },
  {
    iconSrc: "/mobile/style-lab-assets/question-bazi.png",
    title: "生辰报告",
    body: "你的命理结构与人生领域深度解析",
  },
  {
    iconSrc: "/mobile/style-lab-assets/question-zodiac.png",
    title: "星座 / 紫微",
    body: "融合东西方体系，看见更完整的你自己",
  },
];

export function StyleLabHomePage() {
  return (
    <div className="style-lab-home">
      <div className="style-lab-space" aria-hidden="true" />
      <header className="style-lab-brand">
        <Image src="/mobile/style-lab-assets/brand-mark.png" alt="" width={112} height={112} priority />
        <div>
          <strong>玄枢</strong>
          <span>东方命理数据实验室</span>
        </div>
      </header>
      <main className="style-lab-main">
        <StyleLabHeroCard />
        <section className="style-lab-question-grid" aria-label="首页入口">
          {questionCards.map((card) => (
            <StyleLabQuestionCard key={card.title} {...card} />
          ))}
        </section>
        <StyleLabActionPanel />
      </main>
      <StyleLabBottomNav />
    </div>
  );
}
