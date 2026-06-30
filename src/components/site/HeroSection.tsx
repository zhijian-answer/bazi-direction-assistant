import { ArrowDown, BookOpenText, Compass, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="hero-paper relative isolate flex min-h-[calc(100svh-92px)] items-center overflow-hidden border-b border-[var(--line)]">
      <div className="bazi-orbit" aria-hidden="true">
        <div className="orbit-core">命</div>
        <span className="orbit-mark orbit-mark-1">甲</span>
        <span className="orbit-mark orbit-mark-2">丙</span>
        <span className="orbit-mark orbit-mark-3">戊</span>
        <span className="orbit-mark orbit-mark-4">庚</span>
        <span className="orbit-mark orbit-mark-5">壬</span>
        <span className="orbit-mark orbit-mark-6">子</span>
        <span className="orbit-mark orbit-mark-7">辰</span>
        <span className="orbit-mark orbit-mark-8">申</span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 text-sm text-[var(--cinnabar)]">
            <span className="h-px w-8 bg-[var(--cinnabar)]" />
            传统文化的结构化呈现
          </div>
          <h1 className="font-display text-5xl leading-[1.08] text-[var(--ink)] sm:text-6xl lg:text-7xl">
            让命理，
            <br />
            被科学看见
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            以传统八字为基础，通过结构化排盘、五行分析与可视化解读，让复杂的命盘信息更清楚、更容易理解。
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            输入出生信息，即可查看四柱八字、五行分布、十神关系、大运流年。内容仅供传统文化研究与娱乐参考。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#tool" className="btn-primary min-h-12 px-7">
              <Compass className="h-4 w-4" />
              开始排盘
              <ArrowDown className="h-4 w-4" />
            </a>
            <a href="#learn" className="btn-secondary min-h-12 px-7">
              <BookOpenText className="h-4 w-4" />
              了解八字
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
            <span>四柱排盘</span>
            <span>五行权重</span>
            <span>十神藏干</span>
            <span>大运流年</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[var(--jade)]" />克制解读</span>
          </div>
        </div>
      </div>
    </section>
  );
}
