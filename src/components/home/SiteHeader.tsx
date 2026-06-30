"use client";

import { Menu, Orbit } from "lucide-react";

const navItems = [
  ["#value", "产品能力"],
  ["#how", "使用流程"],
  ["#chapters", "报告内容"],
  ["#start", "开始排盘"],
  ["#faq", "常见问题"],
] as const;

export function SiteHeader() {
  return (
    <header className="product-header">
      <div className="product-shell product-header-inner">
        <a href="#top" className="product-brand" aria-label="玄枢首页">
          <span className="product-brand-mark"><Orbit aria-hidden="true" /></span>
          <span>
            <strong>玄枢</strong>
            <small>八字排盘与结构化解读</small>
          </span>
        </a>

        <nav className="product-desktop-nav" aria-label="首页导航">
          {navItems.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>

        <a className="product-header-cta" href="#start">免费排盘</a>

        <details className="product-mobile-menu">
          <summary aria-label="打开导航菜单"><Menu aria-hidden="true" /><span>菜单</span></summary>
          <nav aria-label="移动端导航">
            {navItems.map(([href, label]) => <a key={href} href={href} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>{label}</a>)}
            <a href="/about" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>关于玄枢</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
