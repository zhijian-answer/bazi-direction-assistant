import Link from "next/link";

export const metadata = {
  title: "关于我们 - 八字方向助手",
  description: "了解八字方向助手的免费定位、产品边界和运营理念。",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-10 text-[#27231d]">
      <article className="mx-auto max-w-3xl border border-[#d6c8b8] bg-white p-6">
        <Link href="/" className="text-sm text-[#9c4f35]">
          返回首页
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">关于八字方向助手</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-[#4f473e]">
          <p>
            八字方向助手是一个免费的四柱八字参考工具，目标是在用户迷茫、犹豫、不知道下一步如何行动时，提供温和、清晰、可执行的参考建议。
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
