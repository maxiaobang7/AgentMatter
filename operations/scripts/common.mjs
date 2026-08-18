import { readFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

export function config() {
  const baseUrl = process.env.AGENTMATTER_API_URL?.replace(/\/$/, "");
  const token = process.env.AGENTMATTER_AGENT_TOKEN;
  if (!baseUrl || !token) throw new Error("请设置 AGENTMATTER_API_URL 和 AGENTMATTER_AGENT_TOKEN");
  return { baseUrl, token };
}

export async function loadResource(fileArg) {
  if (!fileArg) throw new Error("请提供资源 JSON 文件路径");
  const file = path.resolve(fileArg);
  const resource = JSON.parse(await readFile(file, "utf8"));
  const schema = JSON.parse(await readFile(path.resolve("operations/schemas/resource.schema.json"), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { date: true, "date-time": true, uri: true } });
  const validate = ajv.compile(schema);
  if (!validate(resource)) throw new Error(`本地 Schema 校验失败:\n${JSON.stringify(validate.errors, null, 2)}`);
  return { file, resource };
}

export async function api(pathname, init = {}) {
  const { baseUrl, token } = config();
  const isMultipart = typeof FormData !== "undefined" && init.body instanceof FormData;
  const response = await fetch(`${baseUrl}${pathname}`, { ...init, headers: { authorization: `Bearer ${token}`, ...(isMultipart ? {} : { "content-type": "application/json" }), ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => ({ ok: false, error: { message: `HTTP ${response.status}` } }));
  if (!response.ok) throw new Error(`${pathname} 失败: ${JSON.stringify(body)}`);
  return body;
}
