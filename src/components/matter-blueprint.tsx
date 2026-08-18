import type { PublicLocale } from "@/lib/i18n";

export function MatterBlueprint({ className, locale }: { className?: string; locale: PublicLocale }) {
  return (
    <div className={className} aria-label={locale === "zh" ? "代码、插件、数据、终端和 Prompt 组成的 Agent 组件蓝图" : "Blueprint of agent components including code, plugins, data, terminals, and prompts"}>
      <svg viewBox="0 0 520 320" role="img" aria-hidden="true">
        <g className="blueprint-lines" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 10" opacity=".45">
          <path d="M25 68H485M25 166H485M25 262H485" />
          <path d="M135 68V262M260 68V262M385 68V262" />
        </g>
        <g className="blueprint-cube" transform="translate(208 8)">
          <path d="M18 18 37 2h87l-19 16Z" /><path d="m105 18 19-16v82l-19 18Z" /><rect x="18" y="18" width="87" height="84" />
          <path className="blueprint-icon" d="m47 47-14 14 14 14m29-28 14 14-14 14M66 40l-12 42" />
        </g>
        <g className="blueprint-cube" transform="translate(106 104)">
          <path d="M18 18 37 2h87l-19 16Z" /><path d="m105 18 19-16v82l-19 18Z" /><rect x="18" y="18" width="87" height="84" />
          <path className="blueprint-icon" d="M53 40h19v13c4-2 11-1 11 6s-7 8-11 6v15H55c2-5 0-11-6-11s-8 6-6 11H31V54h13c-2-4-1-11 6-11 1 0 2 0 3 1Z" />
        </g>
        <g className="blueprint-cube" transform="translate(314 104)">
          <path d="M18 18 37 2h87l-19 16Z" /><path d="m105 18 19-16v82l-19 18Z" /><rect x="18" y="18" width="87" height="84" />
          <ellipse className="blueprint-icon" cx="61" cy="44" rx="25" ry="9" /><path className="blueprint-icon" d="M36 44v32c0 5 11 9 25 9s25-4 25-9V44M36 59c0 5 11 9 25 9s25-4 25-9" />
        </g>
        <g className="blueprint-cube" transform="translate(150 212)">
          <path d="M18 18 37 2h87l-19 16Z" /><path d="m105 18 19-16v82l-19 18Z" /><rect x="18" y="18" width="87" height="84" />
          <path className="blueprint-icon" d="m40 48 16 15-16 15M65 78h22" />
        </g>
        <g className="blueprint-cube" transform="translate(276 212)">
          <path d="M18 18 37 2h87l-19 16Z" /><path d="m105 18 19-16v82l-19 18Z" /><rect x="18" y="18" width="87" height="84" />
          <rect className="blueprint-icon" x="37" y="42" width="48" height="42" rx="3" /><path className="blueprint-icon" d="M48 55h27M48 66h20" />
        </g>
      </svg>
    </div>
  );
}
