# Fever Hackathon -- Environment Setup

> **How to use**: Open Cursor, start a **new chat** in **Agent mode** (model: Auto or Claude 4.6 Opus High), and paste this entire document as your first message. Cursor will execute every step automatically and adapt to whatever access you have.

---

You are a setup assistant for a Fever hackathon. Execute the steps below **in order**. Steps 2 through 8 are **independent** -- if one fails, skip it and continue to the next. **Do not stop or ask the participant questions** except where explicitly indicated. At the end, print a status summary with access recommendations.

Track these flags (all start `false`): `HAS_GH`, `HAS_REPO`, `HAS_PAGES`, `HAS_TOOLKIT`, `HAS_FIGMA`.

---

## Step 1 -- Get the project files (required)

First, check if the current directory contains both `index.html` and `plan.html` (this confirms it is the Fever replica, not some other project). If both exist, skip the download and go to Step 2.

If the files are not present, detect the OS and download the password-protected zip:

**macOS / Linux:**

```bash
curl -L -o fever-hackathon-starter.zip "https://github.com/emilianoechevarriafever/fever-hackathon-gate/releases/download/v1/fever-hackathon-starter.zip"
unzip -P "FeverHack2026" fever-hackathon-starter.zip
rm fever-hackathon-starter.zip
cd fever-hackathon-starter
```

**Windows (PowerShell):**

First download:
```powershell
Invoke-WebRequest -Uri "https://github.com/emilianoechevarriafever/fever-hackathon-gate/releases/download/v1/fever-hackathon-starter.zip" -OutFile "fever-hackathon-starter.zip"
```

Then extract. Windows built-in "Extract All" does NOT support password-protected zips (it will silently produce corrupt files). You MUST use 7-Zip. Try:
```powershell
& "C:\Program Files\7-Zip\7z.exe" x fever-hackathon-starter.zip -p"FeverHack2026" -ofever-hackathon-starter
Remove-Item fever-hackathon-starter.zip
cd fever-hackathon-starter
```

If 7-Zip is not installed, try WinRAR:
```powershell
& "C:\Program Files\WinRAR\WinRAR.exe" x -p"FeverHack2026" fever-hackathon-starter.zip fever-hackathon-starter\
Remove-Item fever-hackathon-starter.zip
cd fever-hackathon-starter
```

If neither is installed, tell the participant:

> You need 7-Zip to extract the password-protected zip. Install it from https://7-zip.org/ and re-run this prompt. Alternatively, open https://emilianoechevarriafever.github.io/fever-hackathon-gate/ in your browser, enter the password **FeverHack2026**, download the zip, then right-click it and choose "7-Zip > Extract Here" using password **FeverHack2026**.

If the download itself fails on any OS, tell the participant:

> Open this page in your browser: https://emilianoechevarriafever.github.io/fever-hackathon-gate/
> Enter the password: **FeverHack2026**
> Download the zip. Extract it with 7-Zip (password: **FeverHack2026**). Open the extracted folder in Cursor and re-run this prompt.

**After extraction**, verify that `index.html` and `plan.html` exist in the current directory. If they are inside a subfolder, `cd` into it.

Then initialize git (the zip does not include a `.git` directory):
```bash
git init
git add -A
git commit -m "Initial commit - Fever hackathon starter"
```

Stop here if the project files could not be obtained.

---

**From here on, all steps are independent. If any step fails, skip it and continue to the next.**

---

## Step 2 -- GitHub CLI authentication

Run `gh auth status`.

- **Installed and authenticated**: note the username. Set `HAS_GH=true`.
- **Installed but not authenticated**: run `gh auth login --web -p https`. Wait for browser flow. Set `HAS_GH=true`.
- **Not installed**: `HAS_GH=false`. Move on.

## Step 3 -- Create a personal GitHub repo (requires HAS_GH)

Skip if `HAS_GH=false`.

Check if a git remote named `origin` already points to a repo owned by the participant (run `git remote -v`). If so, set `HAS_REPO=true` and skip to Step 4.

Otherwise, create a new repo. Use the participant's GitHub username to avoid name collisions:

```bash
gh repo create fever-hackathon --public --source . --push
```

Note: the repo is created as **public** so that GitHub Pages works on free GitHub accounts (Pages requires a paid plan for private repos).

- **If it succeeds**: set `HAS_REPO=true`.
- **If it fails because the repo name already exists**: try with a suffix: `gh repo create fever-hackathon-2 --public --source . --push`. Set `HAS_REPO=true` if this works.
- **If it fails for any other reason**: set `HAS_REPO=false`.

## Step 4 -- Enable GitHub Pages (requires HAS_REPO)

Skip if `HAS_REPO=false`.

Get the repo identifier:
```bash
REPO_FULL=$(gh repo view --json nameWithOwner -q .nameWithOwner)
```

Enable Pages:
```bash
gh api "repos/$REPO_FULL/pages" -X POST -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"
```

- **Succeeds or returns 409** (already enabled): get the URL with `gh api "repos/$REPO_FULL/pages" --jq '.html_url'`. Set `HAS_PAGES=true`.
- **Fails with 403 or 422**: this usually means the repo is private on a free account. Try making it public: `gh repo edit --visibility public --accept-visibility-change-consequences` and retry the Pages command. If it still fails, set `HAS_PAGES=false`.
- **Any other error**: set `HAS_PAGES=false`.

## Step 5 -- Fever Design System Toolkit

Check if `design-system-toolkit/` already exists. If so, set `HAS_TOOLKIT=true` and skip.

Otherwise try:
```bash
git clone https://github.com/Feverup/AI-Product-Design-Toolkit.git design-system-toolkit
```

- **Succeeds**: set `HAS_TOOLKIT=true`.
- **Fails**: set `HAS_TOOLKIT=false`. This is fine -- the Cursor Rule in Step 7 includes the key token values inline.

## Step 6 -- Figma MCP

Check if `.cursor/mcp.json` already exists with Figma configured. If so, set `HAS_FIGMA=true` and skip.

Otherwise, create `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "Figma": {
      "url": "https://mcp.figma.com/mcp",
      "headers": {}
    }
  }
}
```

Set `HAS_FIGMA=true`. Tell the participant: "Figma MCP has been configured. If you have a Figma Dev or Designer seat at Fever, Cursor will prompt you to approve the connection -- click Allow. If you do not have a Figma seat, you can ignore the connection error; it will not affect anything else."

## Step 7 -- Create Cursor Rule

Create `.cursor/rules/` if it does not exist.

Write `.cursor/rules/fever-hackathon.mdc` with the EXACT content below (do NOT modify it):

```
---
description: Fever Hackathon -- project context and design system reference
globs: "**/*"
alwaysApply: true
---

# Fever Replica -- Hackathon Project

## What this project is

A simplified replica of the Fever web app. It is a static site (HTML + CSS + vanilla JS) with no build tools. Pages link to each other with regular anchor tags and query parameters.

## File structure

| File | Purpose |
|------|---------|
| `index.html` | Fever home page (entry point) |
| `plan.html?plan=SLUG` | Universal plan-view template. Reads `?plan=` to load event data from a JS object (`PLANS`). |
| `plan-checkout.html?plan=SLUG` | Checkout page. Requires login (redirects to `login.html` if not logged in). |
| `login.html` | Login page. Sets `localStorage('fever_logged_in','true')`. Supports `?returnTo=` redirect. |
| `search.html` | Search results page |
| `category.html` | Category listing |
| `top10.html` | Top 10 listing |
| `profile.html` | User profile |
| `favorites.html` | Saved favorites |
| `js/burger-menu.js` | Burger menu component (injects HTML + CSS dynamically) |
| `js/plan-view-gallery.js` | Image gallery for plan views |
| `js/recently-viewed.js` | Recently viewed carousel logic |
| `css/desktop.css` | Desktop breakpoint styles |
| `css/navbar.css` | Bottom navigation bar styles |

## Key JavaScript patterns

- Event data lives in the `PLANS` object inside `plan.html` (keyed by slug).
- Login state: `localStorage.getItem('fever_logged_in') === 'true'`.
- Checkout data: `localStorage.getItem('plan_checkout')` (JSON string).
- The plan view has an add-ons bottom sheet for Polar Sound (Camping / Glamping).
- Sticky CTA uses IntersectionObserver on the tickets section.

## Fever Design System

ALL changes must follow the Fever design system. If the `design-system-toolkit/` folder exists in this project, reference it for the full token definitions:
- `design-system-toolkit/knowledge/design-system/tokens.md` -- file map
- `design-system-toolkit/knowledge/design-system/color/_semantics.scss` -- semantic color tokens
- `design-system-toolkit/knowledge/design-system/color/_palette.scss` -- primitive palette (reference only)
- `design-system-toolkit/knowledge/design-system/font/_font.scss` -- typography compositions
- `design-system-toolkit/knowledge/design-system/dimensions/_spacing.scss` -- spacing tokens
- `design-system-toolkit/knowledge/design-system/dimensions/_radii.scss` -- border radius tokens
- `design-system-toolkit/knowledge/design-system/components.md` -- component library
- `design-system-toolkit/knowledge/design-system/patterns.md` -- layout and interaction patterns

### Quick-reference color tokens (resolved hex values)

Primary (Fever blue):
- `$color-action-background-primary` = #0079ca (main CTA buttons)
- `$color-action-background-primary-hover` = #0068b0
- `$color-action-text-primary` = #0079ca (link-style actions)
- `$color-background-primary-base` = #0089e3
- `$color-background-primary-weak` = #e6f4ff (light blue tint)
- `$color-border-primary-base` = #0089e3

Neutral:
- `$color-background-main` = #ffffff (page background)
- `$color-background-main-contrast` = #06232c (dark background)
- `$color-text-main` = #031419 (body text)
- `$color-text-subtle` = #536b75 (secondary text)
- `$color-border-main` = #ccd2d8 (dividers)
- `$color-background-subtle-weak` = #f2f3f3 (card/section backgrounds)

Status:
- `$color-text-danger` = #eb0052 (errors)
- `$color-text-positive` = #18824c (success)
- `$color-text-warning` = #9f5800 (warnings)

Accent:
- `$color-text-accent` = #6f41d7 (purple accent)

### Quick-reference spacing scale

| Token | Value |
|-------|-------|
| `$space-1` | 0.25rem (4px) |
| `$space-2` | 0.5rem (8px) |
| `$space-3` | 0.75rem (12px) |
| `$space-4` | 1rem (16px) |
| `$space-6` | 1.5rem (24px) |
| `$space-8` | 2rem (32px) |
| `$space-12` | 3rem (48px) |

### Quick-reference border radius

| Token | Value |
|-------|-------|
| `$radii-1` | 0.25rem (4px) |
| `$radii-2` | 0.5rem (8px) |
| `$radii-4` | 1rem (16px) |
| `$radii-full` | 4rem (full pill) |

### Token usage rules

1. NEVER use primitive palette values (e.g. `$palette-primary-500`) directly. Always use semantic tokens.
2. Respect token scope: `$color-text-*` for text, `$color-background-*` for fills, `$color-border-*` for strokes, `$color-action-*` for interactive elements.
3. `-contrast` suffix means "for use on dark backgrounds" -- it is NOT a dark-mode variant.
4. If no token exists for a value, use the closest semantic token and flag it.

## Figma integration (if MCP is connected)

If Figma MCP is available, use the cheapest tool first:
1. `get_screenshot` -- visual reference (preferred)
2. `get_metadata` -- node structure
3. `get_design_context` -- full properties (expensive, use only when needed)

Adapt Figma output to this project's stack (vanilla HTML/CSS/JS) and existing component patterns.

## Viewing the site

NEVER open HTML files directly from the filesystem (file:///). SVGs, images, and CSS will break. Always use one of these:

If the project has a GitHub repo with Pages enabled:
- After edits, run `git add -A && git commit -m "descriptive message" && git push origin main`.
- GitHub Pages auto-deploys from the `main` branch. Allow ~60 seconds for propagation.

If working locally without GitHub Pages:
- Serve with `python3 -m http.server 8000` (macOS/Linux) or `python -m http.server 8000` (Windows) and view at `http://localhost:8000`.
- Alternatively, use the VS Code / Cursor "Live Server" extension.
```

## Step 8 -- Update .gitignore

Append these lines to `.gitignore` (create the file if it does not exist). Only add lines that are not already present:

```
design-system-toolkit/
.DS_Store
.cursor/mcp.json
```

Then commit: `git add .gitignore && git commit -m "Add .gitignore"`

## Step 9 -- Local development server

**IMPORTANT**: The site MUST be viewed through a local server or GitHub Pages. Opening `index.html` directly from the file system (`file:///...`) will break images, SVGs, and CSS. NEVER tell the participant to open the HTML file directly.

Start a local server in the background. Detect the OS:

**macOS / Linux:**
```bash
python3 -m http.server 8000 &
```

**Windows (PowerShell):**
```powershell
Start-Process -NoNewWindow python -ArgumentList "-m","http.server","8000"
```

If `python3` / `python` / `py` are not found, tell the participant: "Install Python from https://www.python.org/downloads/ (make sure to check 'Add to PATH' during install on Windows). Or install the 'Live Server' extension in Cursor and click 'Go Live'."

If port 8000 is already in use, try 8001, then 8080.

Tell the participant: **"Open http://localhost:8000 in your browser to see the site. Do NOT open the HTML files directly from your file explorer -- they will look broken."**

If `HAS_PAGES=true`, also tell them their Pages URL for sharing.

## Step 10 -- Status summary and access recommendations

Print a summary table:

```
+----------------------------+--------+-------------------------------------------+
| Capability                 | Status | Details                                   |
+----------------------------+--------+-------------------------------------------+
| Project files              | OK     | downloaded and extracted                   |
| Git initialized            | OK     | local repo ready                           |
| GitHub CLI                 | OK/NO  | username: ... / not installed              |
| Personal GitHub repo       | OK/NO  | repo: ... / skipped                        |
| GitHub Pages               | OK/NO  | url: ... / using localhost:8000            |
| Design System Toolkit      | OK/NO  | cloned / using inlined tokens              |
| Figma MCP                  | OK/NO  | configured / skipped                       |
| Cursor Rule                | OK     | .cursor/rules/fever-hackathon.mdc          |
| Local server               | OK     | http://localhost:8000                      |
+----------------------------+--------+-------------------------------------------+
```

Then, **if any of GitHub CLI, GitHub repo, Pages, Toolkit, or Figma has status NO**, print:

---

**Some optional capabilities are not set up. Since you are running this before the hackathon, you have time to request the missing accesses for the best experience:**

Only print the bullets that apply (skip the ones already OK):

- **GitHub CLI** (needed for GitHub repo + Pages): Install with `brew install gh` (macOS) or `winget install --id GitHub.cli` (Windows). Then run `gh auth login`. Once installed, re-run this setup prompt.

- **Personal GitHub repo** (needed for GitHub Pages): If you now have `gh`, run: `gh repo create fever-hackathon --public --source . --push`

- **GitHub Pages** (shareable public URL): Requires a GitHub repo (see above). Once you have one, run: `gh api repos/YOUR_USER/fever-hackathon/pages -X POST -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"`

- **Design System Toolkit** (full design tokens and component docs): You need membership in the Feverup GitHub org. Ask your manager or the hackathon organizer to invite you at https://github.com/orgs/Feverup/people. Once invited, run: `git clone https://github.com/Feverup/AI-Product-Design-Toolkit.git design-system-toolkit` -- The Cursor Rule already includes the key tokens inline, so this is a nice-to-have.

- **Figma MCP** (lets Cursor read Figma designs directly): The config file was created, but you need a Figma **Dev** or **Designer** seat on the Fever workspace for it to actually connect. Ask your manager or the Design team to grant you a seat.

**You can fully participate with just the project files, the local server, and the Cursor Rule. The rest improves the experience but is not required.**

---

If ALL capabilities are OK:

> **Perfect setup -- everything is ready!** Your site is live on GitHub Pages and you have the design toolkit and Figma connected. Open http://localhost:8000 to preview locally, or share your Pages URL. Start a new Cursor Agent chat and describe what you want to build. Happy hacking!

---

## Verification prompt (optional)

To verify everything is working after setup, paste this into a **new** Cursor chat:

```
Verify my hackathon setup:
1. Read .cursor/rules/fever-hackathon.mdc and confirm it exists.
2. Read index.html (first 10 lines) and confirm it is the Fever replica.
3. Check if design-system-toolkit/ exists and list its top-level contents.
4. Check if .cursor/mcp.json exists and show its content.
5. Run "git remote -v" and report the remotes.
6. Check if http://localhost:8000 is reachable (curl http://localhost:8000 -o /dev/null -s -w "%{http_code}").
Report all results.
```
