import { loadResource } from "./common.mjs";

const [fileArg] = process.argv.slice(2).filter((value) => value !== "--");
const { file, resource } = await loadResource(fileArg);
console.log(`valid: ${file}`);
console.log(`${resource.owner}/${resource.repo}${resource.componentPath ? `#${resource.componentPath}` : ""}`);
