import { Crosshair, ShieldCheck, Target } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "结构化观察",
    body: "数据化分析，拆解命理信息，层层有据",
  },
  {
    icon: Crosshair,
    title: "不做绝对预测",
    body: "不贴标签，不下定论，只提供趋势参考",
  },
  {
    icon: Target,
    title: "仅供自我观察",
    body: "帮助你理解自己，做出更好的选择",
  },
];

export function StyleLabActionPanel() {
  return (
    <section className="style-lab-action-panel" aria-label="我们如何与众不同">
      <header>
        <span aria-hidden="true">◇</span>
        <h2>我们如何与众不同</h2>
        <span aria-hidden="true">◇</span>
      </header>
      <div className="style-lab-action-grid">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title}>
              <div className="style-lab-action-icon" aria-hidden="true">
                <Icon />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
