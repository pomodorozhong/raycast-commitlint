# Commitlint

A Raycast extension for composing [Conventional Commits](https://www.conventionalcommits.org/) with live rule checking.

## Features

- **Type dropdown** — `feat`, `fix`, `docs`, `refactor`, `test`, and other standard types
- **Scope, title, body, footer** — structured fields for the full commit message
- **Live preview** — see the formatted message as you type
- **Rule checker** — commitlint-aligned validation for capitalization, length limits, and more
- **Copy or paste** — copy to clipboard or paste directly into your frontmost app

## Usage

Open Raycast and run **Compose Commit**. Fill in the fields:

| Field | Description |
|-------|-------------|
| Type | Commit category (required) |
| Scope | Optional context, e.g. `auth`, `api` |
| Title | Short imperative summary (required) |
| Body | Detailed explanation (optional) |
| Footer | References, breaking changes, etc. (optional) |

Press **Copy Commit Message** to copy, or **Paste Commit Message** (⌘⇧↵) to insert into the frontmost application.

### Example output

```
feat(auth): add password reset flow

Add token-based reset endpoint and email template.

Closes #42
```

## Rules

The extension enforces these defaults (aligned with `@commitlint/config-conventional`):

| Rule | Default |
|------|---------|
| Title max length | 72 characters |
| Header max length | 100 characters |
| Title casing | Imperative lowercase (no leading capital) |
| Trailing period | Not allowed on title |
| Type / scope casing | Lowercase |

Failed rules appear in the **Rules** panel and block copy/paste until resolved.

## Development

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run build
npm run lint
npm run fix-lint
```

## License

MIT
