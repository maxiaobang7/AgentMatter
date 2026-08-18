import Image from "next/image";
import Link from "next/link";
import { localizedPath, type PublicLocale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: PublicLocale }) {
  const zh = locale === "zh";
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;
  return (
    <footer className="site-footer compact-footer">
      <div className="wide-shell compact-footer-inner">
        <Image src="/brand/agentmatter-logo-primary.svg" alt="AgentMatter" width={185} height={48} />
        <nav aria-label={zh ? "页脚导航" : "Footer navigation"}><Link href={localizedPath("/guidelines", locale)}>{zh ? "收录规则" : "Guidelines"}</Link><Link href={localizedPath("/about", locale)}>{zh ? "关于" : "About"}</Link>{githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer">◉ GitHub</a> : null}<Link href={localizedPath("/guidelines#disclaimer", locale)}>{zh ? "免责声明" : "Disclaimer"}</Link></nav>
        <span>© 2026 AgentMatter</span>
      </div>
    </footer>
  );
}
