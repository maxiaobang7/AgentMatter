const baseUrl = (process.env.AGENTMATTER_SMOKE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const expectedCanonical = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const failures = [];

async function request(path, expectedStatus = 200) {
  try {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    if (response.status !== expectedStatus) {
      failures.push(`${path}: expected ${expectedStatus}, received ${response.status}`);
    }
    return response;
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

const pages = [
  "/",
  "/skills",
  "/dsh",
  "/plugins",
  "/mcp",
  "/prompts",
  "/search?q=github",
  "/resource/obra/superpowers",
  "/submit",
  "/admin/login",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];

for (const path of pages) await request(path);

const home = await request("/");
if (home) {
  const html = await home.text();
  if (expectedCanonical && !html.includes(expectedCanonical)) {
    failures.push(`/: canonical URL does not contain ${expectedCanonical}`);
  }
  for (const header of [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
  ]) {
    if (!home.headers.get(header)) failures.push(`/: missing ${header} header`);
  }
}

const health = await request("/api/health");
if (health) {
  const body = await health.json().catch(() => null);
  if (!body?.ok || body?.database !== "connected") {
    failures.push(`/api/health: expected connected database, received ${JSON.stringify(body)}`);
  }
}

await request("/api/agent/v1/inventory", 401);

if (failures.length) {
  console.error("Production smoke test failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Production smoke test passed: ${baseUrl}`);
