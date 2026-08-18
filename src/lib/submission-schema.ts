import { z } from "zod";
import { categorySlugs } from "@/lib/resources";

export const submissionHosts = ["Codex", "Claude Code", "Cursor", "OpenCode", "DSH"] as const;

export function normalizeGitHubRepository(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") return null;
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;
    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, "");
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null;
    return { owner, repo, canonicalUrl: `https://github.com/${owner}/${repo}` };
  } catch {
    return null;
  }
}

export const submissionSchema = z.object({
  repositoryUrl: z.string().trim().min(1).max(300),
  category: z.enum(categorySlugs).nullable().optional(),
  componentPath: z.string().trim().max(300).optional().default(""),
  displayName: z.string().trim().max(180).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
  hosts: z.array(z.enum(submissionHosts)).max(submissionHosts.length).optional().default([]),
  website: z.string().max(200).optional().default(""),
}).strict();
