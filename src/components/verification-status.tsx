import type { Verification } from "@/lib/types";

const labels = { metadata: "元数据", install: "安装", function: "功能" } as const;

export function VerificationStatus({ items }: { items: Verification[] }) {
  return (
    <div className="verification-grid">
      {items.map((item) => (
        <div className={item.status === "verified" ? "verification-item complete" : "verification-item"} key={item.level}>
          <span className="verification-icon" aria-hidden="true">{item.status === "verified" ? "✓" : "○"}</span>
          <div>
            <strong>{labels[item.level]}</strong>
            <span className="verification-badge">{item.status === "verified" ? "已完成" : "未核验"}</span>
            <p>{item.note}</p>
            {item.environment ? <small>环境：{item.environment}</small> : null}
            {item.result ? <small>结果：{item.result}</small> : null}
            {item.checkedAt ? <time dateTime={item.checkedAt}>{item.checkedAt}</time> : null}
            {item.evidenceUrls?.length ? <a href={item.evidenceUrls[0]} target="_blank" rel="noreferrer">查看证据 ↗</a> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
