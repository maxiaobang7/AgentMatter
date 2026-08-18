import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgentMatter — Open-source AI Agent Resources",
    short_name: "AgentMatter",
    description: "Discover open-source Skills, plugins, MCP servers, and Prompts from GitHub.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f8fb",
    theme_color: "#5545e8",
    icons: [{ src: "/brand/agentmatter-mark.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
