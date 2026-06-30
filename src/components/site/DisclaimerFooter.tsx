import { LockKeyhole, ShieldCheck } from "lucide-react";

export function DisclaimerFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--ink)] text-white/75">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-9 sm:px-8 md:grid-cols-2 lg:px-10">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
          <div>
            <div className="font-medium text-white">使用边界</div>
            <p className="mt-2 text-sm leading-6">本工具仅供传统文化研究与娱乐参考，不作为人生决策依据，也不替代专业建议。</p>
          </div>
        </div>
        <div className="flex gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
          <div>
            <div className="font-medium text-white">隐私说明</div>
            <p className="mt-2 text-sm leading-6">勾选“记住信息”时，表单内容保存在当前浏览器；已创建的命盘档案会保存到账号中，方便下次查看。</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>八字命盘助手 · 免费使用</span>
          <nav className="flex gap-5">
            <a href="/about" className="hover:text-white">关于我们</a>
            <a href="/privacy" className="hover:text-white">隐私说明</a>
            <a href="/terms" className="hover:text-white">使用条款</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
