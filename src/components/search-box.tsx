"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { localizedPath, type PublicLocale } from "@/lib/i18n";

export function SearchBox({ compact = false, initialValue = "", locale = "zh" }: { compact?: boolean; initialValue?: string; locale?: PublicLocale }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigateToResults() {
    const query = value.trim();
    router.push(localizedPath(query ? `/search?q=${encodeURIComponent(query)}` : "/search", locale));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToResults();
  }

  return (
    <form className={compact ? "search-box compact" : "search-box"} role="search" onSubmit={submit}>
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            navigateToResults();
          }
        }}
        aria-label={locale === "zh" ? "搜索 Agent 资源" : "Search agent resources"}
        placeholder={compact ? (locale === "zh" ? "搜索" : "Search") : (locale === "zh" ? "搜索项目、能力、仓库、宿主或安装命令" : "Search projects, capabilities, repositories, hosts, or install commands")}
      />
      {compact ? <kbd>Ctrl K</kbd> : <button type="submit">{locale === "zh" ? "搜索" : "Search"}</button>}
    </form>
  );
}
