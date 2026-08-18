import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("请先设置 DATABASE_URL");
  const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true, charset: "utf8mb4" });
  try {
    await connection.query("CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    const directory = path.resolve("database/migrations");
    const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
    for (const file of files) {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>("SELECT name FROM schema_migrations WHERE name = ?", [file]);
      if (rows.length) { console.log(`skip ${file}`); continue; }
      const sql = await readFile(path.join(directory, file), "utf8");
      await connection.beginTransaction();
      try {
        await connection.query(sql);
        await connection.execute("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
        await connection.commit();
        console.log(`applied ${file}`);
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
