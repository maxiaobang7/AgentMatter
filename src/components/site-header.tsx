"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localizedPath, stripLocalePrefix, type PublicLocale } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";

const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

const navigation = (locale: PublicLocale) => [
  { href: "/skills", label: "Skills" },
  { href: "/dsh", label: locale === "zh" ? "DSH 插件" : "DSH Plugins" },
  { href: "/plugins", label: locale === "zh" ? "Agent 插件" : "Agent Plugins" },
  { href: "/mcp", label: locale === "zh" ? "MCP" : "MCP Servers" },
  { href: "/prompts", label: "Prompts" },
];

export function SiteHeader({ locale }: { locale: PublicLocale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navigation(locale);
  const isChinese = locale === "zh";
  const routePath = stripLocalePrefix(pathname);
  const isAdmin = routePath.startsWith("/admin");
  function switchLanguage(event: React.MouseEvent<HTMLAnchorElement>, target: PublicLocale) {
    event.preventDefault();
    window.location.assign(localizedPath(`${pathname}${window.location.search}${window.location.hash}`, target));
  }
  return (
    <header className="site-header">
      <div className="header-shell header-row">
        <Link className="brand-link" href={localizedPath("/", locale)} aria-label={isChinese ? "AgentMatter 首页" : "AgentMatter home"}>
          <Image src="/brand/agentmatter-logo-primary.svg" alt="AgentMatter" width={250} height={64} priority />
        </Link>
        <nav className="desktop-nav" aria-label={isChinese ? "主要导航" : "Main navigation"}>
          {items.map((item) => (
            <Link key={item.href} className={routePath.startsWith(item.href) ? "nav-link active" : "nav-link"} href={localizedPath(item.href, locale)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {!isAdmin ? <div className="language-switch" aria-label={isChinese ? "切换语言" : "Switch language"}><Link className={!isChinese ? "active" : ""} href={localizedPath(pathname, "en")} onClick={(event) => switchLanguage(event, "en")}>EN</Link><span>/</span><Link className={isChinese ? "active" : ""} href={localizedPath(pathname, "zh")} onClick={(event) => switchLanguage(event, "zh")}>中文</Link></div> : null}
          <Link className="button button-signal header-submit" href={localizedPath("/submit", locale)}>{isChinese ? "提交项目" : "Submit"}</Link>
          {githubUrl ? <a className="github-utility" href={githubUrl} target="_blank" rel="noreferrer" aria-label={isChinese ? "打开 AgentMatter GitHub" : "Open AgentMatter on GitHub"}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.25.76-.54v-2.13c-3.13.68-3.79-1.33-3.79-1.33-.51-1.31-1.25-1.66-1.25-1.66-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.99 0 0 .95-.3 3.09 1.16A10.7 10.7 0 0 1 12 6.17c.95 0 1.9.13 2.8.38 2.14-1.46 3.08-1.16 3.08-1.16.62 1.56.23 2.71.12 2.99.72.79 1.15 1.8 1.15 3.03 0 4.33-2.63 5.28-5.14 5.56.4.35.77 1.04.77 2.1v3.12c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .9Z" /></svg>
            <span>GitHub</span>
          </a> : null}
          <ThemeToggle locale={locale} />
          <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
            <span className="sr-only">{open ? (isChinese ? "关闭菜单" : "Close menu") : (isChinese ? "打开菜单" : "Open menu")}</span>
            <span aria-hidden="true">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-navigation" className="mobile-nav" aria-label={isChinese ? "移动端导航" : "Mobile navigation"}>
          <div className="shell mobile-nav-inner">
            {items.map((item) => <Link key={item.href} href={localizedPath(item.href, locale)} onClick={() => setOpen(false)}>{item.label}</Link>)}
            <Link href={localizedPath("/guidelines", locale)} onClick={() => setOpen(false)}>{isChinese ? "收录规范" : "Guidelines"}</Link>
            <Link href={localizedPath("/about", locale)} onClick={() => setOpen(false)}>{isChinese ? "关于" : "About"}</Link>
            <div className="mobile-language-switch"><Link href={localizedPath(pathname, "en")} onClick={(event) => switchLanguage(event, "en")}>English</Link><Link href={localizedPath(pathname, "zh")} onClick={(event) => switchLanguage(event, "zh")}>中文</Link></div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
