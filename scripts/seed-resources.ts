import { createHash } from "node:crypto";
import mysql from "mysql2/promise";
import { loadEnvConfig } from "@next/env";
import { resources } from "../src/data/resources";

loadEnvConfig(process.cwd());

function stableKey(owner: string, repo: string, componentPath?: string) {
  return `${owner}/${repo}${componentPath ? `#${componentPath}` : ""}`.toLowerCase();
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("请先设置 DATABASE_URL，并先运行 pnpm db:migrate");
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  let created = 0;
  try {
    for (const resource of resources) {
      const payload = JSON.stringify(resource);
      const hash = createHash("sha256").update(payload).digest("hex");
      const [result] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT IGNORE INTO resources (stable_key, resource_id, owner, repo, component_path, category, status, payload_json, content_hash, version_number, published_at) VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, 1, CURRENT_TIMESTAMP(3))",
        [stableKey(resource.owner, resource.repo, resource.componentPath), resource.id, resource.owner, resource.repo, resource.componentPath ?? "", resource.category, payload, hash],
      );
      if (!result.affectedRows) continue;
      created += 1;
      await connection.execute(
        "INSERT INTO resource_versions (resource_id, version_number, action, operation_id, payload_json, content_hash, actor) VALUES (?, 1, 'seed', ?, ?, ?, 'system:seed')",
        [result.insertId, `seed:${resource.id}`, payload, hash],
      );
      await connection.execute(
        "INSERT INTO audit_logs (resource_id, operation_id, action, actor, after_hash, metadata_json) VALUES (?, ?, 'seed', 'system:seed', ?, ?)",
        [result.insertId, `seed:${resource.id}`, hash, JSON.stringify({ source: "src/data/resources.ts" })],
      );
    }
    console.log(`seed complete: ${created} created, ${resources.length - created} already existed`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
