import path from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), false);

const errors = [];
const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) errors.push(`${name} 未配置`);
  return value ?? "";
};
const isPlaceholder = (value) => /change_me|replace-with|your-|example\.com|至少|后台生成/i.test(value);
const optionalValue = (name) => process.env[name]?.trim() ?? "";

const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);
if (nodeMajor < 20 || (nodeMajor === 20 && nodeMinor < 9)) {
  errors.push(`Node.js ${process.versions.node} 不受支持，需要 20.9 或更高版本`);
}

const siteUrlValue = required("NEXT_PUBLIC_SITE_URL");
try {
  const siteUrl = new URL(siteUrlValue);
  if (siteUrl.protocol !== "https:" || siteUrl.origin !== "https://www.agentmatter.net" || siteUrl.pathname !== "/") {
    errors.push("NEXT_PUBLIC_SITE_URL 必须是 https://www.agentmatter.net");
  }
} catch {
  errors.push("NEXT_PUBLIC_SITE_URL 不是有效 URL");
}

const databaseUrlValue = required("DATABASE_URL");
try {
  const databaseUrl = new URL(databaseUrlValue);
  if (databaseUrl.protocol !== "mysql:") errors.push("DATABASE_URL 必须使用 mysql://");
  if (databaseUrl.username.toLowerCase() === "root") errors.push("DATABASE_URL 不得使用 MySQL root 用户");
  if (!["127.0.0.1", "localhost"].includes(databaseUrl.hostname)) errors.push("DATABASE_URL 必须连接本机 MySQL");
  if (databaseUrl.pathname.replace(/^\//, "") !== "agentmatter") errors.push("DATABASE_URL 必须连接 agentmatter 数据库");
  if (!databaseUrl.password || isPlaceholder(databaseUrl.password)) errors.push("DATABASE_URL 数据库密码仍是占位值");
} catch {
  errors.push("DATABASE_URL 不是有效的 MySQL URL，请对密码中的保留字符做 URL 编码");
}

const poolSize = Number(process.env.DATABASE_POOL_SIZE ?? 8);
if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 32) errors.push("DATABASE_POOL_SIZE 必须是 1 到 32 的整数");

const sessionSecret = required("SESSION_SECRET");
if (sessionSecret.length < 32 || isPlaceholder(sessionSecret)) errors.push("SESSION_SECRET 必须是至少 32 位的非占位随机值");

const adminPasswordHash = required("ADMIN_PASSWORD_SCRYPT");
if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(adminPasswordHash)) {
  errors.push("ADMIN_PASSWORD_SCRYPT 格式无效，请使用 pnpm admin:hash-password 生成");
}

const mediaDirectory = required("AGENTMATTER_MEDIA_DIR");
if (mediaDirectory && !path.isAbsolute(mediaDirectory)) errors.push("AGENTMATTER_MEDIA_DIR 必须是绝对路径");

const bootstrapTokenHash = process.env.AGENT_API_TOKEN_SHA256?.trim();
if (bootstrapTokenHash && !/^[a-f0-9]{64}$/i.test(bootstrapTokenHash)) {
  errors.push("AGENT_API_TOKEN_SHA256 必须是 64 位十六进制 SHA-256");
}

const baiduAnalyticsId = optionalValue("NEXT_PUBLIC_BAIDU_ANALYTICS_ID");
if (baiduAnalyticsId && !/^[a-f0-9]{32}$/i.test(baiduAnalyticsId)) {
  errors.push("NEXT_PUBLIC_BAIDU_ANALYTICS_ID 必须是百度统计提供的 32 位十六进制站点 ID");
}

for (const name of ["NEXT_PUBLIC_BAIDU_SITE_VERIFICATION", "NEXT_PUBLIC_BING_SITE_VERIFICATION", "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"]) {
  const value = optionalValue(name);
  if (value && isPlaceholder(value)) errors.push(`${name} 仍是占位值`);
}

if (errors.length) {
  console.error("Production environment preflight failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Production environment preflight passed");
console.log(`- Node.js: ${process.versions.node}`);
console.log("- Canonical URL: configured");
console.log("- MySQL: loopback, dedicated database user");
console.log(`- Database pool: ${poolSize}`);
console.log("- Admin/session credentials: configured");
console.log("- Persistent media directory: configured");
console.log(`- Baidu Analytics: ${baiduAnalyticsId ? "configured" : "disabled"}`);
console.log(`- Webmaster verification tokens: ${["NEXT_PUBLIC_BAIDU_SITE_VERIFICATION", "NEXT_PUBLIC_BING_SITE_VERIFICATION", "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"].filter((name) => optionalValue(name)).length} configured`);
