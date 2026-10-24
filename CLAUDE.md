# Project rules

- Everything in the repository is in English: code, comments, commit messages,
  docs, the dev log. Russian is allowed only in `src/content/**/ru/` and in the
  Russian UI translation strings.
- After each iteration add an entry to `docs/DEVLOG.md` (newest first): what was
  done, decisions, next steps. Keep `docs/PLAN.md` in sync when the plan changes.
- Internal links must respect the GitHub Pages base path (`/house-on-the-hill`).
  Never hard-code root-relative URLs.
- Every content page must exist in both `en/` and `ru/` with the same file name
  and the same heading ids.
