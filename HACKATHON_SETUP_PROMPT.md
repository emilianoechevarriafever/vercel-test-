# Fever Hackathon -- Environment Setup

> **How to use**: Open Cursor, start a **new chat** in **Agent mode** (model: Auto or Claude 4.6 Opus High), and paste this entire document as your first message. Cursor will execute every step automatically and adapt to whatever access you have.

---

You are a setup assistant for a Fever hackathon. Your job is to bootstrap the participant's local environment by running through the steps below **in order**. At each step, detect whether the required tool/access is available. If it is, proceed. If it is not, use the fallback and move on. **Do not stop or ask questions unless explicitly indicated.** At the end, print a status summary table.

**Important**: The base repository (`emilianoechevarriafever/fever_replica`) is **private**. Participants need to have been added as collaborators to fork it. If they do not have access, they should use a local copy provided by the hackathon organizer.

## Step 1 -- GitHub CLI authentication

Run `gh auth status` to check if the GitHub CLI is installed and authenticated.

- **If `gh` is installed and authenticated**: note the GitHub username from the output. Store it mentally as `GH_USER`. Proceed to Step 2A.
- **If `gh` is installed but NOT authenticated**: run `gh auth login --web -p https` and wait for the participant to complete the browser flow. Then proceed to Step 2A.
- **If `gh` is NOT installed**: set a flag `NO_GH=true`. Proceed to Step 2B.

## Step 2A -- Fork and clone (with GitHub)

Try to fork the private repo:

```bash
gh repo fork emilianoechevarriafever/fever_replica --clone --remote
```

Then `cd fever_replica`.

- **If it succeeds**: set flag `HAS_FORK=true` and proceed to Step 3.
- **If the fork fails because a fork already exists**: run `git clone "https://github.com/$GH_USER/fever_replica.git" && cd fever_replica` (replace `$GH_USER` with the actual username). Set `HAS_FORK=true` and proceed to Step 3.
- **If the fork fails because of a permission/404 error** (the participant has not been added as a collaborator): tell the participant "You don't have access to the private repo. Falling back to local copy." Set `HAS_FORK=false` and proceed to Step 2B.

## Step 2B -- Work from local copy (no GitHub access or no CLI)

Check if the current working directory already contains a `fever_replica` folder or if the current folder has an `index.html` file (indicating the participant already has the project files).

- **If the project files are found**: `cd` into them if needed. Set `HAS_FORK=false`. Proceed to Step 2C.
- **If the project files are NOT found**: try to download them automatically from the shared Drive:

```bash
curl -L -o fever_replica.zip "https://drive.google.com/uc?export=download&confirm=t&id=1kIIzRUwQX8CX6rLOM3Dx88bCr56wrgCS"
unzip fever_replica.zip
rm fever_replica.zip
```

After unzipping, look for the folder that contains `index.html` and `cd` into it.

- **If the download or unzip succeeds**: set `HAS_FORK=false`. Proceed to Step 2C.
- **If the download fails** (network error, access denied): tell the participant:

> Could not download the project files automatically. Open this link in your browser, download the zip, unzip it, and open the folder in Cursor:
> https://drive.google.com/file/d/1kIIzRUwQX8CX6rLOM3Dx88bCr56wrgCS/view?usp=sharing
> Then re-run this setup prompt.

Stop here until the participant has the files.

## Step 2C -- Initialize a personal Git repo (optional, for local-only participants)

If `HAS_FORK=false` and the participant wants to track their changes in git, initialize a new repo:

```bash
git init
git add -A
git commit -m "Initial commit from fever_replica"
```

If the participant also has `gh` available and wants to push to their own GitHub:

```bash
gh repo create fever_replica --private --source . --push
```

- **If repo creation succeeds**: set `HAS_OWN_REPO=true`. Proceed to Step 3.
- **If it fails or the participant does not want GitHub**: set `HAS_OWN_REPO=false`. Proceed to Step 4.

## Step 3 -- Enable GitHub Pages

Only attempt this if `HAS_FORK=true` or `HAS_OWN_REPO=true`.

First, get the owner/repo:

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

Then enable GitHub Pages:

```bash
gh api "repos/OWNER/REPO/pages" -X POST \
  -f build_type=legacy \
  -f source[branch]=main \
  -f source[path]=/
```

(Replace `OWNER/REPO` with the actual value from the command above.)

- **If it succeeds**: set `PAGES_URL=https://OWNER.github.io/REPO/`. Set flag `HAS_PAGES=true`.
- **If it fails** (403, 409 "already exists", or any error): that is fine. If 409, Pages is already enabled; run `gh api "repos/OWNER/REPO/pages" --jq '.html_url'` to get the URL. Otherwise set `HAS_PAGES=false`.

Proceed to Step 4.

## Step 4 -- Fever Design System Toolkit

First, check if a `design-system-toolkit/` folder already exists in the project root. If it does, set `HAS_TOOLKIT=true` and skip to Step 5.

If it does not exist, try to clone the toolkit repo:

```bash
git clone https://github.com/Feverup/AI-Product-Design-Toolkit.git design-system-toolkit
```

- **If it succeeds**: set `HAS_TOOLKIT=true`. Proceed to Step 5.
- **If it fails** (authentication error / 404 / private repo): try to download it from the shared Drive:

```bash
curl -L -o design-toolkit.zip "https://drive.google.com/uc?export=download&confirm=t&id=1rRNVN_OXcqGy2KR3GxduRX7DNSr_PFJV"
unzip design-toolkit.zip
rm design-toolkit.zip
```

After unzipping, look for the extracted folder and rename it to `design-system-toolkit` if needed (the zip may extract as `AI-Product-Design-Toolkit` or similar -- rename it to `design-system-toolkit`).

- **If the download succeeds**: set `HAS_TOOLKIT=true`. Proceed to Step 5.
- **If the download also fails**: set `HAS_TOOLKIT=false`. Tell the participant:

> Could not access the design system toolkit. Open this link in your browser, download the zip, and place the contents in a folder called `design-system-toolkit/` at the root of this project:
> https://drive.google.com/file/d/1rRNVN_OXcqGy2KR3GxduRX7DNSr_PFJV/view?usp=sharing
> You can continue without it -- the Cursor Rule created in Step 6 includes the most important token values inline.

Proceed to Step 5.

## Step 5 -- Figma MCP (optional)

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

Tell the participant: "Figma MCP is configured. When Cursor prompts you to approve the Figma MCP connection, click Allow. You can now reference Figma URLs in your prompts and Cursor will read the designs directly."

Set `HAS_FIGMA=true`.

### If No:

Set `HAS_FIGMA=false`. Tell the participant: "No problem -- you can still work on the project. If you have Figma links, you can take screenshots manually and share them with Cursor via image paste."

Proceed to Step 6.

## Step 6 -- Create Cursor Rule

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

## Deploying changes

If the project is a GitHub fork with Pages enabled:
- After edits, run `git add -A && git commit -m "descriptive message" && git push origin main`.
- GitHub Pages auto-deploys from the `main` branch. Allow ~60 seconds for propagation.

If working locally without GitHub Pages:
- Serve with `python3 -m http.server 8000` and view at `http://localhost:8000`.
```

## Step 7 -- Update .gitignore

If a `.gitignore` file exists, append `design-system-toolkit/` to it (if not already present).
If no `.gitignore` exists, create one with:

```
design-system-toolkit/
.DS_Store
```

## Step 8 -- Local development server

If `HAS_PAGES=false` or `NO_GH=true`, start a local server:

```bash
python3 -m http.server 8000
```

Tell the participant: "Your site is running at http://localhost:8000. Open it in your browser."

## Step 9 -- Status summary and access recommendations

Print a summary table like this:

```
+----------------------------+--------+-------------------------------------------+
| Capability                 | Status | Details                                   |
+----------------------------+--------+-------------------------------------------+
| GitHub CLI                 | OK/NO  | username: ... / not installed              |
| Fork of fever_replica      | OK/NO  | repo: ... / using local copy               |
| GitHub Pages               | OK/NO  | url: ... / using localhost:8000            |
| Design System Toolkit      | OK/NO  | cloned or downloaded / missing             |
| Figma MCP                  | OK/NO  | connected / skipped                        |
| Cursor Rule                | OK     | .cursor/rules/fever-hackathon.mdc          |
+----------------------------+--------+-------------------------------------------+
```

Then, **if any capability has status NO**, print the following section:

---

**You are missing some accesses that would improve your hackathon experience. Since you are running this before the hackathon day, you have time to request them. Here is what to do for each missing item:**

- **GitHub CLI**: Install it with `brew install gh` (macOS) or `winget install --id GitHub.cli` (Windows), then run `gh auth login`. This lets you fork the project, push changes, and deploy via GitHub Pages.

- **Fork of fever_replica**: You need to be added as a collaborator to the private repo. Ask the hackathon organizer (Emiliano Echevarria) to add your GitHub username by running: `gh api repos/emilianoechevarriafever/fever_replica/collaborators/YOUR_USERNAME -X PUT -f permission=read`. Once added, re-run this setup prompt and the fork will work.

- **GitHub Pages**: This requires a successful fork (see above). Once you have forked the repo, GitHub Pages can be enabled automatically. Without it, you will work on localhost -- functional but you will not have a shareable public URL.

- **Design System Toolkit**: You need either membership in the Feverup GitHub org (ask your manager or the hackathon organizer to invite you at https://github.com/orgs/Feverup/people), or download the zip manually from this link (open with your Fever Google account): https://drive.google.com/file/d/1rRNVN_OXcqGy2KR3GxduRX7DNSr_PFJV/view?usp=sharing -- place its contents in a folder called `design-system-toolkit/` at your project root.

- **Figma MCP**: You need a Figma **Dev** or **Designer** seat on the Fever workspace. Ask your manager or the Design team to grant you access. Once you have a seat, re-run this setup prompt and select "Yes" for Figma access.

**The optimal experience requires all five items. But you can participate with just the project files and the Cursor Rule (both are already set up). Request the missing accesses now so everything is ready on hackathon day.**

---

If ALL capabilities have status OK, print instead:

> **You have the full setup -- everything is ready for the hackathon!** You have a fork with GitHub Pages, the design system toolkit, and Figma MCP connected. Start a new Cursor Agent chat and describe what you want to build or change on the Fever site. Happy hacking!

---

## Verification prompt (optional)

If you want to verify everything is working, paste this into a **new** Cursor chat after setup:

```
Read the file .cursor/rules/fever-hackathon.mdc and confirm it exists.
Then read index.html (first 20 lines) and confirm this is the Fever replica.
If design-system-toolkit/ exists, list its contents.
If .cursor/mcp.json exists, confirm Figma MCP is configured.
Report what you find.
```
