# Fever Hackathon -- Environment Setup

> **How to use**: Open Cursor, start a **new chat** in **Agent mode** (model: Auto or Claude 4.6 Opus High), and paste this entire document as your first message. Cursor will execute every step automatically and adapt to whatever access you have.

---

You are a setup assistant for a Fever hackathon. Your job is to bootstrap the participant's local environment by running through the steps below. Each step is **independent** -- if one fails, skip it and move on to the next. **Do not stop or ask the participant questions unless explicitly indicated.** At the end, print a status summary and access recommendations.

Track these flags as you go (all start as `false`):
- `HAS_GH` -- GitHub CLI installed and authenticated
- `HAS_REPO` -- project is in a GitHub repo the participant owns (fork or new)
- `HAS_PAGES` -- GitHub Pages is enabled and deployed
- `HAS_TOOLKIT` -- design system toolkit folder is available
- `HAS_FIGMA` -- Figma MCP is configured

---

## Step 1 -- Get the project files

This is the only step that must complete before the rest. First, check if the current directory already has an `index.html` file (the participant may already have the project files). If so, skip the download and proceed to Step 2.

If the project files are not present, download the password-protected zip. Detect the OS and use the appropriate commands:

**macOS / Linux:**

```bash
curl -L -o fever-hackathon-starter.zip "https://github.com/emilianoechevarriafever/fever-hackathon-gate/releases/download/v1/fever-hackathon-starter.zip"
unzip -P "FeverHack2026" fever-hackathon-starter.zip
rm fever-hackathon-starter.zip
cd fever-hackathon-starter
```

**Windows (PowerShell):**

```powershell
Invoke-WebRequest -Uri "https://github.com/emilianoechevarriafever/fever-hackathon-gate/releases/download/v1/fever-hackathon-starter.zip" -OutFile "fever-hackathon-starter.zip"
```

Then tell the participant: "The zip file has been downloaded. It is password-protected. Right-click the file in Explorer, choose 'Extract All', and enter the password **FeverHack2026** when prompted. Then open the extracted folder in Cursor and re-run this prompt." On Windows, `unzip` with password is not natively supported from the command line -- the participant must extract manually or install 7-Zip. If 7-Zip is installed, run:

```powershell
& "C:\Program Files\7-Zip\7z.exe" x fever-hackathon-starter.zip -p"FeverHack2026"
Remove-Item fever-hackathon-starter.zip
cd fever-hackathon-starter
```

If the download and unzip succeed, proceed to Step 2.

If the download fails on any OS, tell the participant:

> Open this page in your browser: https://emilianoechevarriafever.github.io/fever-hackathon-gate/
> Enter the password: **FeverHack2026**
> Download the zip, extract it (the extraction password is also **FeverHack2026**), open the folder in Cursor, and re-run this prompt.

Stop here until the participant has the files.

---

**From here on, all steps are independent. If any step fails, skip it and continue to the next.**

---

## Step 2 -- GitHub CLI authentication

Run `gh auth status` to check if the GitHub CLI is installed and authenticated.

- **If `gh` is installed and authenticated**: note the GitHub username. Set `HAS_GH=true`.
- **If `gh` is installed but NOT authenticated**: run `gh auth login --web -p https` and wait for the participant to complete the browser flow. Set `HAS_GH=true`.
- **If `gh` is NOT installed**: set `HAS_GH=false`. Move on.

## Step 3 -- Create a personal GitHub repo (requires HAS_GH)

Skip this step if `HAS_GH=false`.

The project was cloned from a public starter repo. Create the participant's own repo so they can push changes and enable Pages:

```bash
gh repo create fever-hackathon --private --source . --push
```

- **If it succeeds**: set `HAS_REPO=true`.
- **If it fails** (repo already exists, or any error): try to check if a remote already exists with `git remote -v`. If `origin` points to the participant's own repo, set `HAS_REPO=true`. Otherwise set `HAS_REPO=false`.

## Step 4 -- Enable GitHub Pages (requires HAS_REPO)

Skip this step if `HAS_REPO=false`.

Get the repo name:

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

Then enable GitHub Pages:

```bash
gh api "repos/OWNER_REPO/pages" -X POST \
  -f build_type=legacy \
  -f source[branch]=main \
  -f source[path]=/
```

(Replace `OWNER_REPO` with the value from the command above.)

- **If it succeeds or returns 409** (already exists): run `gh api "repos/OWNER_REPO/pages" --jq '.html_url'` to get the URL. Set `HAS_PAGES=true`.
- **If it fails** with any other error: set `HAS_PAGES=false`.

## Step 5 -- Fever Design System Toolkit

Check if a `design-system-toolkit/` folder already exists in the project root. If it does, set `HAS_TOOLKIT=true` and skip to Step 6.

If it does not exist, try to clone it:

```bash
git clone https://github.com/Feverup/AI-Product-Design-Toolkit.git design-system-toolkit
```

- **If it succeeds**: set `HAS_TOOLKIT=true`.
- **If it fails**: set `HAS_TOOLKIT=false`. This is fine -- the Cursor Rule created in Step 7 already includes the most important design token values inline.

## Step 6 -- Figma MCP (optional)

Ask the participant this question (use a structured question if available):

**Do you have a Figma Dev or Designer seat at Fever?**
- Yes
- No / Not sure

### If Yes:

Create the file `.cursor/mcp.json` with this content:

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

Tell the participant: "Figma MCP is configured. When Cursor prompts you to approve the Figma MCP connection, click Allow."

Set `HAS_FIGMA=true`.

### If No:

Set `HAS_FIGMA=false`. Tell the participant: "No problem -- you can work without Figma. If you have design screenshots, paste them directly into the Cursor chat."

## Step 7 -- Create Cursor Rule

Create the directory `.cursor/rules/` if it does not exist.

Write the file `.cursor/rules/fever-hackathon.mdc` with the EXACT content below (do NOT modify it):

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

If a `.gitignore` file exists, append `design-system-toolkit/` to it (if not already present).
If no `.gitignore` exists, create one with:

```
design-system-toolkit/
.DS_Store
```

## Step 9 -- Local development server

**IMPORTANT**: The site MUST be viewed through a local server or GitHub Pages. Opening `index.html` directly from the file system (`file:///...`) will break images, SVGs, and CSS. NEVER tell the participant to open the HTML file directly -- always use a server.

**Always** start a local server so the participant can preview changes immediately (even if Pages is enabled, localhost is faster for development). Detect the OS:

**macOS / Linux:**
```bash
python3 -m http.server 8000
```

**Windows:**
```powershell
python -m http.server 8000
```

If `python` / `python3` is not found, try `py -m http.server 8000` (Windows Python Launcher). If none work, tell the participant to install Python from https://www.python.org/downloads/ or use the VS Code / Cursor "Live Server" extension.

Tell the participant: "Your site is running at http://localhost:8000. Open it in your browser. Do NOT open the HTML files directly from the file explorer -- they will look broken."

If `HAS_PAGES=true`, also tell them their Pages URL for sharing.

## Step 10 -- Status summary and access recommendations

Print a summary table:

```
+----------------------------+--------+-------------------------------------------+
| Capability                 | Status | Details                                   |
+----------------------------+--------+-------------------------------------------+
| Project files              | OK     | cloned from public repo                   |
| GitHub CLI                 | OK/NO  | username: ... / not installed              |
| Personal GitHub repo       | OK/NO  | repo: ... / skipped                        |
| GitHub Pages               | OK/NO  | url: ... / using localhost:8000            |
| Design System Toolkit      | OK/NO  | cloned / using inlined tokens              |
| Figma MCP                  | OK/NO  | connected / skipped                        |
| Cursor Rule                | OK     | .cursor/rules/fever-hackathon.mdc          |
+----------------------------+--------+-------------------------------------------+
```

Then, **if any capability has status NO**, print the following section:

---

**Some capabilities are not set up. Since you are running this before the hackathon, you have time to fix them for the best experience:**

Only print the bullets that apply (skip the ones that are already OK):

- **GitHub CLI** (needed for GitHub repo + Pages): Install with `brew install gh` (macOS) or `winget install --id GitHub.cli` (Windows). Then run `gh auth login`. Once installed, re-run this setup prompt.

- **Personal GitHub repo** (needed for GitHub Pages): This failed during setup. If you now have `gh` installed and authenticated, run: `gh repo create fever-hackathon --private --source . --push`

- **GitHub Pages** (gives you a shareable public URL): Requires a GitHub repo (see above). Once you have one, run: `gh api repos/YOUR_USER/fever-hackathon/pages -X POST -f build_type=legacy -f source[branch]=main -f source[path]=/`

- **Design System Toolkit** (full design tokens and component docs): You need membership in the Feverup GitHub org. Ask your manager or the hackathon organizer to invite you at https://github.com/orgs/Feverup/people. Once invited, run: `git clone https://github.com/Feverup/AI-Product-Design-Toolkit.git design-system-toolkit` -- Note: the Cursor Rule already includes the most important tokens inline, so this is a nice-to-have.

- **Figma MCP** (lets Cursor read Figma designs directly): You need a Figma **Dev** or **Designer** seat on the Fever workspace. Ask your manager or the Design team. Once you have it, re-run this setup prompt and select "Yes" for Figma.

**You can participate with just the project files and the Cursor Rule (the minimum setup). But requesting the missing accesses now will give you the best experience on hackathon day.**

---

If ALL capabilities have status OK, print instead:

> **Perfect setup -- you have everything!** GitHub Pages, design system toolkit, and Figma MCP are all connected. Start a new Cursor Agent chat and describe what you want to build or change. Happy hacking!

---

## Verification prompt (optional)

If you want to verify everything is working after setup, paste this into a **new** Cursor chat:

```
Read .cursor/rules/fever-hackathon.mdc and confirm it exists.
Read index.html (first 20 lines) and confirm this is the Fever replica.
If design-system-toolkit/ exists, list its contents.
If .cursor/mcp.json exists, confirm Figma MCP is configured.
Run "git remote -v" and report the result.
Report what you find.
```
