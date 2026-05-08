# Repository Working Notes

## Patch Notes

- Before committing and pushing user-facing or behavior-changing work, update `CHANGELOG.md`.
- Add the newest entry at the top, below the title and intro.
- Use Korean for patch notes unless the user asks otherwise.
- Include these sections when they apply:
  - `요약`
  - `변경 사항`
  - `검증`
  - `주요 수정 파일`
- Keep entries concise but specific enough to understand what changed without reading the diff.
- If a change is docs-only or tooling-only, still add a brief note when the user asked for patch-note tracking.
- After completing work, post the same high-level summary to Slack channel `#codex-dev-briefing`.
