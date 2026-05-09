# Contributing

Thank you for taking the time to look. This repo is a static Astro site — no databases, no user accounts, no build secrets. Anyone can clone it, run it locally, and submit a pull request.

## Quick path

```bash
git clone https://github.com/cngxjs/compodocx-website.git
cd compodocx-website
npm install
npm run dev    # http://localhost:4321
```

Make your change, commit, push, open a PR against `develop`. The full pipeline (lint, format check, build) runs on every PR.

## What kind of contribution fits

| Kind                  | Examples                                                                       |
| --------------------- | ------------------------------------------------------------------------------ |
| **Content fixes**     | typos, broken links, outdated examples in guides, copy improvements            |
| **New content**       | a guide section, a code example, a missing FAQ item, a new theme entry         |
| **Visual / UX fixes** | layout issues at certain viewport widths, dark-mode bugs, accessibility issues |
| **Refactors**         | factor a component, rename a class, simplify a JSON-LD block                   |
| **Ops**               | CI improvements, dependency updates not handled by Dependabot, README clarity  |

Tool-specific feedback (CLI flags, parser bugs, JSDoc tag handling) belongs in the **tool repo**: https://github.com/cngxjs/compodocx.

## Local checks before pushing

```bash
npm run lint           # astro check + tsc --noEmit (must pass — required by branch protection)
npm run format:check   # prettier --check (PR is rejected on formatting drift)
npm run build          # full production build into dist/
npm run preview        # serves dist/ locally — best simulation of the live site
```

If `format:check` fails, run `npm run format` to fix.

## Branch + commit conventions

- Default branch: `develop`. Open PRs against `develop`.
- Branch name: short, kebab-case, prefixed by category — `fix/themes-swatch-contrast`, `content/playground-stackblitz-flag`, `ops/dependabot-grouping`.
- Commits: imperative subject, conventional-style prefix where it fits (`fix:`, `feat:`, `docs:`, `ops:`, `a11y:`, `seo:`, `chore:`). Atomic — one logical change per commit. Do not mix a bugfix with a refactor.
- No AI attribution footers in commit messages.

## Visual changes

Test in **at least two themes** (default + one alternative — Ocean or Midnight is fine) and **both light and dark modes**. Attach a before/after screenshot to the PR for any visible change. The theme picker is in the navbar; dark mode toggles in the navbar too.

## Accessibility

The site holds a Lighthouse accessibility score of 100 on every audited page. Any change that drops it below 100 will be requested back. Common pitfalls:

- New text on coloured backgrounds — verify contrast (4.5:1 WCAG AA).
- New interactive widgets — provide keyboard navigation and ARIA roles.
- New images — supply meaningful `alt` text or `aria-hidden="true"` for decorative ones.

## Licence

By submitting code or content you agree that:

- Code contributions are dual-licensed under MIT, matching `LICENSE`.
- Content contributions (guide pages, copy, screenshots, SVG mockups) are licensed under CC BY 4.0, matching `LICENSE-DOCS.md`.

## Reporting bugs

Use the issue templates at https://github.com/cngxjs/compodocx-website/issues/new/choose. Security issues go through `SECURITY.md`.
