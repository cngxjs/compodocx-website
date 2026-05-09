# Security policy

This repository contains the source for **compodocx.dev** — a static marketing and documentation site. There is no server component, no user accounts, and no data submission. The attack surface is small but not zero (DOM-based XSS through copy-paste, dependency vulnerabilities, theme/style injection, supply-chain risks in the build pipeline).

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security reports.

Two private channels are accepted:

1. **GitHub Security Advisories** (preferred): use the "Report a vulnerability" button at https://github.com/cngxjs/compodocx-website/security/advisories/new. This keeps the discussion private and assigns a CVE if appropriate.
2. **Email**: send the report to `info@cngx.dev`. Use a clear subject line such as `[security] compodocx-website: <short summary>`.

Include in the report:

- A description of the vulnerability and the conditions to reproduce it.
- The affected URL or code path.
- The impact you believe it has.
- Optionally, a proof of concept (no destructive test data).

## What to expect

- Acknowledgement within **3 business days**.
- Initial assessment within **7 business days**.
- A fix or mitigation plan, with a target date, communicated back to the reporter.
- Public disclosure after the fix is deployed, with credit to the reporter unless they prefer to stay anonymous.

There is **no bug bounty programme**. This is a small open-source project maintained by volunteers.

## Out of scope

- Attacks against the underlying `@cngxjs/compodocx` tool — report those at https://github.com/cngxjs/compodocx/security.
- Third-party platforms (GitHub Pages, world4you DNS, npm registry) — report those to the platform owner.
- Self-hosted forks of this site.
