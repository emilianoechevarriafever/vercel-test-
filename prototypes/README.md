# Prototypes isolation and deploy

This folder contains isolated prototype projects:

- `prototypes/candlelight/index.html` (Queen page)
- `prototypes/candlelight/coldplay.html`
- `prototypes/candlelight/img/`
- `prototypes/polar-sound/index.html`
- `prototypes/polar-sound/` (full Polar flow with `option-*` variants and local `img/`)

Both pages are part of the same project and can link to each other without depending on `/home`.

## Suggested Vercel split

Create separate Vercel projects from the same repository:

1. Candlelight prototype
   - Root Directory: `prototypes/candlelight`
2. Polar Sound flow
   - Root Directory: `prototypes/polar-sound`

Recommended settings:

- Framework Preset: `Other`
- Build Command: empty
- Output Directory: empty
