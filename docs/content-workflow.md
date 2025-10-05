# Sorahow Content Publishing Workflow

This document explains how the content and engineering teams collaborate to publish bilingual tutorials, resources, and news through the Sorahow CMS stack.

## 1. Directory layout

```
web/content/
  tutorials/
    <slug>/
      en.mdx
      zh.mdx
  resources/
    <slug>/
      en.mdx
      zh.mdx
  news/
    <slug>/
      en.mdx
      zh.mdx
```

Each entry lives in a folder named with a URL-friendly slug. Every folder must contain both `en.mdx` and `zh.mdx` so the site can render in both languages.

## 2. Frontmatter contract

All MDX documents **must** include the following fields:

| Field | Description | Example |
| --- | --- | --- |
| `title` | Human-readable title displayed in listings and details | `"Getting Started with Sorahow"` |
| `description` | One sentence summary shown in lists and social previews | `"Set up your Sorahow workspace..."` |
| `difficulty` | One of `beginner`, `intermediate`, or `advanced` | `beginner` |
| `tags` | Array of lowercase taxonomy labels | `[setup, publishing]` |
| `updatedAt` | ISO date string (YYYY-MM-DD) for the last content update | `"2024-03-01"` |
| `author` | Primary author attribution | `"Yuki Nakamura"` |

The `lib/content-loader.ts` module validates these fields and throws an error during build if any are missing.

## 3. Authoring process

1. **Create a branch** – Every content update happens in Git. Branch naming recommendation: `content/<category>-<slug>`.
2. **Duplicate a template** – Copy an existing folder inside the relevant category and rename it to the new slug.
3. **Write MDX in both languages** – Keep the structure of the article aligned so translations stay in sync.
4. **Use shared components** – Place reusable MDX components under `components/mdx/` and reference them with JSX tags (e.g. `<Callout>`).
5. **Run validation** – Execute `pnpm lint:content` (script TBD) or rely on `validateContentStructure()` during CI to confirm translations exist.
6. **Open a PR** – Summarize user-facing changes, tag reviewers from content & localization teams, and wait for approval.

## 4. Release checklist

- [ ] Frontmatter fields filled for both locales.
- [ ] Links and assets verified in preview environment.
- [ ] Release notes added to `news/` if announcing new features.
- [ ] Content calendar updated in Notion.

## 5. Roles & responsibilities

| Role | Responsibilities |
| --- | --- |
| Content Strategist | Defines topics, ensures editorial voice, owns final approval. |
| Writer | Drafts source language article and coordinates with translators. |
| Translator | Produces localized copy and maintains linguistic consistency. |
| Engineer | Reviews MDX/React usage, runs build validations, merges PRs. |

## 6. Deployment

Once the PR is merged, the deployment pipeline runs `next build`. The build step calls `validateContentStructure()` to ensure translations are present and will fail if any locale file is missing.
