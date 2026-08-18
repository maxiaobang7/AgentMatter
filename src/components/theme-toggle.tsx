"use client";

import { useSyncExternalStore } from "react";
import type { PublicLocale } from "@/lib/i18n";

type Theme = "light" | "dark";

const STORAGE_KEY = "agentmatter-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  function syncTheme(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light");
    onStoreChange();
  }

  window.addEventListener("storage", syncTheme);
  window.addEventListener("agentmatter-theme-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", syncTheme);
    window.removeEventListener("agentmatter-theme-change", onStoreChange);
  };
}

export function ThemeToggle({ locale }: { locale: PublicLocale }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const isChinese = locale === "zh";

  function toggleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event("agentmatter-theme-change"));
  }

  const isDark = theme === "dark";
  const label = isChinese
    ? isDark ? "切换到浅色模式" : "切换到深色模式"
    : isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      onClick={toggleTheme}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.2 15.3A8.6 8.6 0 0 1 8.7 3.8 8.7 8.7 0 1 0 20.2 15.3Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.7" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
