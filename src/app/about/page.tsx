import Link from "next/link";

export const metadata = {
  title: "关于我们 - 玄枢",
  description: "了解玄枢的免费定位、产品边界和运营理念。",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--rice)] px-5 py-10 text-[var(--ink)]">
      <article className="mx-auto max-w-3xl border border-[var(--line)] bg-[var(--paper)] p-6">
        <Link href="/" className="text-sm text-[var(--cinnabar)]">
          返回首页
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">关于玄枢</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--muted)]">
          <p>
            玄枢是一个免费的四柱八字参考工具，目标是把复杂的命盘信息整理得更清楚，并在用户迷茫、犹豫时提供温和、可执行的参考建议。
          </p>
          <p>
            我们不把命盘解读包装成确定预测，也不鼓励用户把人生选择完全交给系统。产品更关注现实行动：现在适合做什么、暂时不适合做什么、接下来可以先做哪几件小事。
          </p>
          <p>
            网站前期免费开放，后续如果用户体量增长，会通过少量广告或内容合作维持服务器和模型运行成本。
          </p>
        </div>
      </article>
    </main>
  );
}
