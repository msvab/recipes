# Recepty

A public Czech recipe collection. Astro generates static pages from validated JSON; Codex handles authoring. Search, filters, and serving adjustment run in the browser. No database, website login, or hosted AI service is needed.

Public address: **https://michal.svab.net/recipes/** (inherited from the owner's existing GitHub Pages domain).

## Local development

Use Node 24 LTS (`nvm use`) and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Astro (normally http://localhost:4321). Follow local AGENTS/RTK instructions when using these commands through Codex.

| Command | Purpose |
| --- | --- |
| `npm run validate` | Validate recipe data, image paths, and provenance metadata |
| `npm run check` | Astro and TypeScript checks |
| `npm test` | Focused schema, search, and scaling tests |
| `npm run build` | Validate and generate `dist/` |
| `npm run verify` | Type check, tests, and production build |
| `npm run preview` | Serve the production build locally |
| `npm run test:browser` | Desktop/mobile browser tests at `/recipes/` |

Before browser tests, run `npx playwright install chromium`. CI installs its system dependencies too. Browser tests build and serve the production output on port 4322. For a production-like local build, use `BASE_PATH=/recipes/ SITE_URL=https://michal.svab.net npm run build` and the same environment when previewing.

## Add or change a recipe

Use the repository skill in Codex:

> Use $recipe-manager to prepare a recipe from this URL: …

Or paste a recipe from ChatGPT, then ask Codex to process it. Review the Czech draft, measurements, yield, and image choice. When satisfied, request publication. Edits can be conversational, such as “Change the pasta recipe to use 250 g of pasta.”

The skill lives at `.agents/skills/recipe-manager/SKILL.md`. The executable contract is `src/lib/recipes/schema.ts`; working JSON files demonstrate the format. Missing yield or unclear conversion must be resolved rather than invented.

Recipes are `recipes/<slug>.json`; stable slugs preserve links when titles change. Photos live in `src/assets/recipes/`. Use `.staging/` for unreviewed local drafts; it is ignored. All tracked recipe files are publishable content. There is no private-recipe mode in a public repository.

Three explicitly marked, original demonstration recipes are supplied. They have not been verified by cooking. Remove or replace them when adding your own collection. Do not set `demo: false` merely to hide their labels.

## Public reuse policy

Import cooking facts into fresh Czech instructions. Do not copy protected blog prose, stories, translations, or photos without permission or a suitable licence. Keep source attribution; credit alone does not establish permission. Record the permission basis for reused protected text and third-party photos. Use a placeholder when photo permission is unclear. Optional AI images are clearly labeled.

Validation checks that required metadata exists, not whether permission is legally sufficient. Never commit raw source pages, private correspondence, credentials, or unapproved photos. Deleting a tracked file does not erase Git history.

## Deployment

The destination is the public repository `msvab/recipes`. In repository Settings → Pages, select **GitHub Actions** as the publishing source. Restrict the `github-pages` environment to `main`. Keep repository write access limited to the owner.

Each push to main runs validation, tests, a production build and browser checks; only a successful build is uploaded and deployed. Pull requests run checks without deployment permissions. Deployment uses GitHub's short-lived workflow token and OIDC, not a personal token in application code.

The workflow sets `SITE_URL=https://michal.svab.net` and `BASE_PATH=/recipes/`. Change these together when moving repositories. This project inherits an existing domain; it does not require purchasing one. GitHub service limits and existing Codex subscription/usage still apply.

After publishing, inspect the `Deploy Pages` run and open the live page. For an ordinary rollback, revert the relevant commit and push again; avoid force-pushing. Failed checks preserve the previous successful deployment.

## Scope

See [requirements](REQUIREMENTS.md) and [implementation plan](IMPLEMENTATION_PLAN.md). Direct publication from ChatGPT/mobile is deferred to v2. No public upload endpoint, user accounts, or website editor is included.
