import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CalendarRange,
  Check,
  ClipboardCheck,
  Compass,
  FileText,
  GitBranch,
  Layers3,
  MessageCircleQuestion,
  Network,
  Orbit,
  Share2,
  Sparkles,
} from "lucide-react";
import { FormEvent } from "react";
import { DisclaimerFooter } from "@/components/site/DisclaimerFooter";
import { HeroSection } from "@/components/site/HeroSection";
import { FAQSection } from "./FAQSection";
import { OnboardingForm } from "./OnboardingForm";
import { Reveal } from "./Reveal";
import { SiteHeader } from "./SiteHeader";

type Props = {
  busy: boolean;
  error: string;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
};

const values = [
  { icon: Orbit, title: "四柱结构一眼看清", body: "年、月、日、时四柱与藏干、十神、纳音放在同一张表里，基础信息不用来回翻找。" },
  { icon: BarChart3, title: "五行强弱有图可看", body: "用比例和颜色展示五行分布，并说明每一种能量对应的行动倾向。" },
  { icon: Network, title: "关系与节奏有解释", body: "把十神、合冲刑害、大运和流年翻译成普通人读得懂的说明。" },
  { icon: Compass, title: "最后落到现实行动", body: "不止给结论，还会整理适合推进、需要缓一缓和今天能完成的一小步。" },
] as const;

const chapters = [
  ["01", "命盘总览", "日主、四柱与核心能量摘要", FileText],
  ["02", "四柱八字", "干支、藏干、十神与纳音", Layers3],
  ["03", "五行分布", "强弱比例、偏旺与待补方向", BarChart3],
  ["04", "十神分析", "表达、资源、行动与关系模式", GitBranch],
  ["05", "地支关系", "合、冲、刑、害、破的结构说明", Network],
  ["06", "大运周期", "十年阶段与当前所处节奏", CalendarRange],
  ["07", "流年趋势", "年度主题与月度行动提醒", Sparkles],
  ["08", "行动建议", "适合做、暂缓做和复盘问题", ClipboardCheck],
] as const;

export function PublicHome({ busy, error, onRegister, onLogin }: Props) {
  return (
    <main className="product-home">
      <SiteHeader />
      <HeroSection />

      <section id="value" className="product-section product-value-section">
        <div className="product-shell">
          <Reveal>
            <div className="product-section-heading product-heading-row">
              <div><span className="product-eyebrow">为什么使用玄枢</span><h2>复杂命盘，应该清楚地讲</h2></div>
              <p>排盘只是开始。真正有用的是把命盘结构、阶段节奏和现实行动放在同一份报告里，让你知道自己正在看什么。</p>
            </div>
          </Reveal>
          <div className="product-value-grid">
            {values.map(({ icon: Icon, title, body }, index) => (
              <Reveal key={title} className={`product-delay-${index + 1}`}>
                <article className="product-value-item"><Icon aria-hidden="true" /><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="product-section product-how-section">
        <div className="product-shell">
          <Reveal><div className="product-section-heading product-center-heading"><span className="product-eyebrow">使用流程</span><h2>三步生成你的命盘报告</h2><p>不需要了解命理术语，按照出生信息填写即可。</p></div></Reveal>
          <div className="product-step-grid">
            {[
              ["01", "填写出生信息", "选择阳历或农历，填写出生日期、时间、地点和性别。", "约 1 分钟"],
              ["02", "生成命盘结构", "系统计算四柱、五行、十神、关系和大运流年。", "即时生成"],
              ["03", "阅读并保存报告", "按章节阅读，复制重点或生成适合手机保存的分享图。", "随时回来查看"],
            ].map(([number, title, body, meta], index) => (
              <Reveal key={number} className={`product-delay-${index + 1}`}><article className="product-step"><span>{number}</span><div><h3>{title}</h3><p>{body}</p><small>{meta}</small></div>{index < 2 && <ArrowRight aria-hidden="true" />}</article></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="chapters" className="product-section product-chapters-section">
        <div className="product-shell product-chapters-layout">
          <Reveal className="product-chapters-intro">
            <div className="product-section-heading product-section-heading-sticky">
              <span className="product-eyebrow"><BookOpenText aria-hidden="true" />完整报告</span>
              <h2>不是一张表，<br />而是一份能读懂的报告</h2>
              <p>从基础命盘到阶段趋势，每一章先展示数据，再解释它与现实生活的关系。</p>
              <a href="#start" className="product-inline-link">生成我的报告 <ArrowRight aria-hidden="true" /></a>
            </div>
          </Reveal>
          <div className="product-chapter-grid">
            {chapters.map(([number, title, body, Icon], index) => (
              <Reveal key={number} className={`product-delay-${(index % 2) + 1}`}><article className="product-chapter-card"><div><span>CH {number}</span><Icon aria-hidden="true" /></div><h3>{title}</h3><p>{body}</p><small><Check aria-hidden="true" />报告包含</small></article></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="start" className="product-section product-start-section">
        <div className="product-shell product-start-layout">
          <Reveal className="product-start-copy">
            <div className="product-section-heading product-section-heading-sticky">
              <span className="product-eyebrow"><Compass aria-hidden="true" />开始排盘</span>
              <h2>从你的出生信息开始</h2>
              <p>免费注册后即可保存命盘和报告。我们不会把出生信息公开展示，也不会用绝对结论替你做决定。</p>
              <ul>
                <li><Check aria-hidden="true" />一个账号最多保存 3 个命盘</li>
                <li><Check aria-hidden="true" />每天可免费获得行动建议</li>
                <li><Check aria-hidden="true" />可查看大运、流年和历史记录</li>
              </ul>
            </div>
          </Reveal>
          <Reveal className="product-delay-1"><OnboardingForm busy={busy} error={error} onRegister={onRegister} onLogin={onLogin} /></Reveal>
        </div>
      </section>

      <section id="preview" className="product-section product-preview-section">
        <div className="product-shell">
          <Reveal><div className="product-section-heading product-center-heading"><span className="product-eyebrow">报告示例</span><h2>数据、解释和行动放在一起</h2><p>结果页按章节组织，手机端一屏一张重点卡，方便阅读和保存。</p></div></Reveal>
          <Reveal className="product-preview-wrap">
            <div className="product-report-demo" id="share-card">
              <header><div><small>命盘总览 · 阳历</small><h3>示例命盘报告</h3><p>1990 年 6 月 15 日 09:30 · 四川省成都市</p></div><span><small>日主</small><strong>辛金</strong><em>阴金</em></span></header>
              <div className="product-report-demo-body">
                <div className="product-demo-pillars">
                  {["庚午", "壬午", "辛亥", "癸巳"].map((item, index) => <div key={item}><small>{["年柱", "月柱", "日柱", "时柱"][index]}</small><strong>{item}</strong><span>{["劫财", "伤官", "日主", "食神"][index]}</span></div>)}
                </div>
                <div className="product-demo-insight"><span><Sparkles aria-hidden="true" />结构摘要</span><p>辛金日主，命盘中水与火的表达较明显。适合先把信息收拢、建立判断标准，再推进需要公开表达或快速决定的事项。</p></div>
                <div className="product-demo-actions"><div><small>适合推进</small><strong>整理方向、明确边界、完成一个可验证的小步骤</strong></div><div><small>暂缓处理</small><strong>情绪高点做重大承诺、信息不足时仓促选择</strong></div></div>
              </div>
              <footer><span>传统文化研究与娱乐参考</span><strong>玄枢 · 结构化命盘报告</strong></footer>
            </div>
            <div className="product-preview-note"><Share2 aria-hidden="true" /><div><strong>适合手机阅读与截图</strong><p>重点卡片保持固定层级，保存后可以作为自己的阶段复盘记录。</p></div></div>
          </Reveal>
        </div>
      </section>

      <FAQSection />

      <section className="product-final-cta">
        <div className="product-shell"><Reveal><span className="product-eyebrow">免费使用</span><h2>看清结构，再决定下一步</h2><p>用一份清楚的命盘报告，整理你此刻最需要关注的方向。</p><a href="#start" className="product-cta-primary"><MessageCircleQuestion aria-hidden="true" />免费生成我的命盘<ArrowRight aria-hidden="true" /></a></Reveal></div>
      </section>

      <DisclaimerFooter />
    </main>
  );
}

