import { createHash, randomBytes } from "node:crypto";

const token = `am_${randomBytes(32).toString("base64url")}`;
console.log(`AGENTMATTER_AGENT_TOKEN=${token}`);
console.log(`AGENT_API_TOKEN_SHA256=${createHash("sha256").update(token).digest("hex")}`);
