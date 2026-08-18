# ADR 0002: Structure resource detail content separately from catalog metadata

- Status: Accepted
- Date: 2026-08-16
- Decision owners: AgentMatter

## Context

AgentMatter lists five different GitHub resource types: Skills, DSH plugins, general Agent plugins, MCP servers, and Prompts. The first detail-page implementation rendered most prose by joining compact catalog fields. This kept the UI populated, but it could not reliably express suitability, file responsibilities, data boundaries, scoped licenses, maintenance signals, or evidence. It also made unrelated resource types sound alike.

## Decision

Keep the existing compact `Resource` fields as the normalized catalog and search index, and require a `ResourceDetailContent` object for every listed resource.

The detail object contains:

- a single-paragraph Chinese introduction and a separately sourced GitHub description;
- suitable and unsuitable scenarios;
- structured capability, README, repository structure, permission/data-boundary, license, and maintenance content;
- category-specific facts and first-party evidence links.

Compatibility, acquisition, and verification records also accept evidence and environment fields. Verification remains conservative: repository metadata can be marked verified after first-party review, while installation and functional claims remain unverified until AgentMatter records an actual environment and result.

Automated tests enforce the minimum detail contract for all published resources. The page may use compatibility fallbacks for optional presentation details, but it must not synthesize a positive install or function verdict.

## Consequences

### Positive

- Content quality can be tested independently of the visual layout.
- Five resource types can share a page shell without losing their distinct information.
- Claims can link to GitHub evidence and show their verification boundary.
- Future ingestion can populate a stable schema instead of generating generic prose at render time.

### Negative

- Each resource requires editorial work beyond importing repository metadata.
- Repository changes can make structured summaries stale, so maintenance dates and evidence must be refreshed.
- Scoped licensing and data-boundary fields require manual review for complex repositories.

## Alternatives considered

### Continue deriving detail prose from catalog fields

Rejected because short tags and summaries do not contain enough context to produce accurate, resource-specific detail content.

### Store the entire README as rendered Markdown

Rejected because it creates inconsistent pages, increases copyright and freshness risk, and hides the distinctions users need for comparison.

### Create a different schema and page for every category

Rejected for now because most decision fields are shared. A common schema plus category facts gives enough specialization without duplicating the application shell.
