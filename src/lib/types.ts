export type CategorySlug = "skills" | "dsh" | "plugins" | "mcp" | "prompts";

export type ResourceFacetKey =
  | "workflow"
  | "output"
  | "surface"
  | "extension"
  | "scope"
  | "deployment"
  | "transport"
  | "authentication"
  | "content";

export interface ResourceTaxonomy {
  primaryTopic: string;
  secondaryTopics?: string[];
  facets?: Partial<Record<ResourceFacetKey, string[]>>;
}

export type SupportLevel = "documented" | "community" | "inferred";
export type VerificationLevel = "metadata" | "install" | "function";
export type OfficialKind = "platform" | "publisher" | "community";
export type SeoSearchIntent = "installation" | "configuration" | "usage" | "overview" | "learning";

export interface ResourceSeo {
  primaryKeyword: string;
  title: string;
  description: string;
  searchIntent: SeoSearchIntent;
  secondaryKeywords: string[];
  titleCandidates?: string[];
  selectionReason?: string;
}

export interface ResourceLocalization {
  subtype: string;
  summary: string;
  license?: string;
  facts: string[];
  capabilities: string[];
  compatibilities: Array<{ host: string; note?: string }>;
  acquisitions: Array<{ label: string; requirements?: string[] }>;
  verifications: Array<{ note: string; environment?: string; result?: string }>;
  permissions?: string[];
  limitations?: string[];
  detail: ResourceDetailContent;
  seo: ResourceSeo;
}

export interface Compatibility {
  host: string;
  level: SupportLevel;
  note?: string;
  evidenceUrl?: string;
}

export interface Acquisition {
  label: string;
  mode: "install" | "connect" | "copy" | "learn" | "browse";
  host?: string;
  command?: string;
  config?: string;
  uninstall?: string;
  url?: string;
  evidenceUrl?: string;
  requirements?: string[];
}

export interface Verification {
  level: VerificationLevel;
  status: "verified" | "unverified";
  checkedAt?: string;
  environment?: string;
  evidenceUrls?: string[];
  result?: string;
  note: string;
}

export interface EvidenceLink {
  label: string;
  url: string;
}

export interface CapabilityDetail {
  name: string;
  description: string;
  evidenceUrl?: string;
}

export interface EditorialDetailItem {
  title: string;
  description: string;
}

export interface ResourceReview {
  summary: string;
  strengths: string[];
  limitations: string[];
}

export interface InstallationGuide {
  summary: string;
  prerequisites: string[];
  verification: string;
  agentInstallPrompt?: string;
  notes?: string[];
}

export type ResourceMediaPlacement =
  | "after-introduction"
  | "after-capabilities"
  | "after-installation"
  | "after-use-cases"
  | "after-review"
  | "in-readme";

export interface ResourceMedia {
  id: string;
  src: string;
  sourceUrl: string;
  evidenceUrl: string;
  alt: string;
  caption?: string;
  kind: "screenshot" | "example" | "diagram" | "cover";
  placement: ResourceMediaPlacement;
  width: number;
  height: number;
}

export interface StructureDetail {
  path: string;
  role: string;
  evidenceUrl?: string;
}

export interface DataBoundary {
  label: string;
  description: string;
  risk: "low" | "medium" | "high";
  evidenceUrl?: string;
}

export interface ScopedLicense {
  scope: string;
  spdx: string;
  sourceUrl: string;
}

export interface MaintenanceInfo {
  lastPush: string;
  archived: boolean;
  latestRelease?: string;
  releaseUrl?: string;
  note: string;
}

export type PromptDetail =
  | {
      kind: "standalone";
      text: string;
      placeholder?: string;
      sourceUrl: string;
    }
  | {
      kind: "collection" | "guide";
      sourceUrl?: string;
    };

export interface ResourceDetailContent {
  introduction: string;
  githubDescription: string;
  prompt?: PromptDetail;
  suitableFor: string[];
  notSuitableFor: string[];
  readmeSummary: string[];
  capabilityDetails: CapabilityDetail[];
  installationGuide?: InstallationGuide;
  tutorialSteps?: EditorialDetailItem[];
  useCases?: EditorialDetailItem[];
  review?: ResourceReview;
  media?: ResourceMedia[];
  structureDetails: StructureDetail[];
  dataBoundaries: DataBoundary[];
  licenses: ScopedLicense[];
  maintenance: MaintenanceInfo;
  evidence: EvidenceLink[];
  categoryFacts: Array<{ label: string; value: string }>;
}

export interface Resource {
  id: string;
  name: string;
  owner: string;
  repo: string;
  componentPath?: string;
  category: CategorySlug;
  taxonomy?: ResourceTaxonomy;
  subtype: string;
  officialKind: OfficialKind;
  summary: string;
  stars: number;
  license: string;
  language?: string;
  updatedAt: string;
  compatibilities: Compatibility[];
  facts: string[];
  capabilities: string[];
  acquisitions: Acquisition[];
  verifications: Verification[];
  permissions?: string[];
  structure?: string[];
  limitations?: string[];
  featured?: boolean;
  seo?: ResourceSeo;
  localizations?: {
    en: ResourceLocalization;
  };
  provenance?: {
    generatedBy: "codex";
    generatedAt: string;
    sourceUrls: string[];
    model?: string;
    reviewedBy?: string;
  };
  detail: ResourceDetailContent;
}

export interface SearchHit {
  resource: Resource;
  score: number;
  reasons: string[];
}
