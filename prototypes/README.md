# Prototypes isolation and deploy

This folder contains one isolated Candlelight prototype project:

- `prototypes/candlelight/index.html` (Queen page)
- `prototypes/candlelight/coldplay.html`
- `prototypes/candlelight/img/`

Both pages are part of the same project and can link to each other without depending on `/home`.

## Suggested Vercel split

Create separate Vercel projects from the same repository:

1. Candlelight prototype
   - Root Directory: `prototypes/candlelight`
2. Polar Sound flow
   - Root Directory: repository root (`.`) for now, or a dedicated folder if moved later

Recommended settings:

- Framework Preset: `Other`
- Build Command: empty
- Output Directory: empty
