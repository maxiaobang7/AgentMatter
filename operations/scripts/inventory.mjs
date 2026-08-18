import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { api } from "./common.mjs";

const body = await api("/api/agent/v1/inventory");
const directory = path.resolve("operations/inventory");
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, "current.json"), `${JSON.stringify({ fetchedAt: new Date().toISOString(), ...body }, null, 2)}\n`, "utf8");
console.log(`inventory saved: ${body.resources.length} resources`);
