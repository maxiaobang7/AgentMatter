import Link from "next/link";

const items = [
  ["dashboard", "/admin", "资源队列"],
  ["taxonomy", "/admin/taxonomy", "能力领域"],
  ["submissions", "/admin/submissions", "用户投稿"],
] as const;

export function AdminNav({ active }: { active: (typeof items)[number][0] }) {
  return (
    <nav className="admin-nav" aria-label="后台导航">
      {items.map(([key, href, label]) => <Link className={active === key ? "active" : ""} href={href} key={key}>{label}</Link>)}
    </nav>
  );
}
