import { ChevronDown, HelpCircle } from "lucide-react";

const questions = [
  ["排盘结果准确吗？", "四柱计算基于你填写的历法、出生日期、时间和时区。出生信息越准确，排盘基础越可靠。解读内容用于传统文化研究与自我观察，不是对未来的确定预测。"],
  ["我的出生信息会被公开吗？", "不会。命盘档案只用于你的账号内查看和生成报告。请不要在提问中填写身份证号、详细住址、银行卡等与排盘无关的敏感信息。"],
  ["不清楚出生时间怎么办？", "可以勾选“不清楚出生时间”。系统会使用参考时刻生成页面，并明确标注时柱相关内容需要谨慎阅读。之后确认时间后，可以重新建立档案。"],
  ["这里能替我做人生决定吗？", "不能。报告适合帮助你整理思路、观察节奏和制定小行动。健康、法律、投资、职业和亲密关系等重大决定，请结合现实信息与专业意见。"],
  ["为什么需要注册？", "注册用于保存命盘、报告、提问记录和每日行动。当前服务免费开放，一个账号最多保存 3 个命盘档案。"],
] as const;

export function FAQSection() {
  return (
    <section id="faq" className="product-section product-faq-section">
      <div className="product-shell product-faq-layout">
        <div className="product-section-heading product-section-heading-sticky">
          <span className="product-eyebrow"><HelpCircle aria-hidden="true" />常见问题</span>
          <h2>开始之前，<br />你可能想知道这些</h2>
          <p>我们把准确性、隐私和使用边界说清楚，不用含糊的承诺换取信任。</p>
        </div>
        <div className="product-faq-list">
          {questions.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary><span>{question}</span><ChevronDown aria-hidden="true" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

