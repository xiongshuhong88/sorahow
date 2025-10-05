# Sorahow Knowledge Base

This repository contains a multilingual knowledge base built with Next.js, MDX, and a filesystem-backed CMS workflow.

## Features

- Bilingual content structure under `web/content/` with tutorials, resources, and news categories.
- Unified frontmatter contract for all MDX documents.
- Type-safe content loader in `lib/content-loader.ts` for listing and fetching localized entries.
- App Router pages under `app/[locale]/(sections)/` that provide language-aware listing and detail views.
- Editorial workflow documentation in `docs/content-workflow.md` for collaborative publishing.

## Getting started

```bash
pnpm install
pnpm dev
```

Content updates are driven through Git branches and PRs. Refer to the workflow guide for authoring best practices.
