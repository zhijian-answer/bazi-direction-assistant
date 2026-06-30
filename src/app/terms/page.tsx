import Link from "next/link";

export const metadata = {
  title: "使用边界 - 八字命盘助手",
  description: "八字命盘助手的传统文化研究、娱乐参考和自我探索边界。",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-10 text-[#27231d]">
      <article className="mx-auto max-w-3xl border border-[#d6c8b8] bg-white p-6">
        <Link href="/" className="text-sm text-[#9c4f35]">
          返回首页
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">使用边界</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-[#4f473e]">
          <p>
            本站内容仅用于文化娱乐、自我探索和参考解读，不构成医疗、法律、投资、心理咨询、职业咨询或其他专业建议。
          </p>
          <p>
            系统回答不能替代用户自己的判断。涉及健康、投资、法律、重大职业和亲密关系决策时，请结合现实信息，并咨询合格专业人士。
          </p>
          <p>
            本站不提供恐吓式判断，不鼓励宿命论，也不承诺任何结果一定发生。更建议用户把回答当作复盘、行动计划和情绪整理的辅助工具。
          </p>
        </div>
      </article>
    </main>
  );
}
