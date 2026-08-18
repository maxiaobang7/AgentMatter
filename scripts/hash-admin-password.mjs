import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv.slice(2).find((value) => value !== "--");
if (!password || password.length < 12) {
  console.error("用法: pnpm admin:hash-password \"至少12位的密码\"");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
console.log(`${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
