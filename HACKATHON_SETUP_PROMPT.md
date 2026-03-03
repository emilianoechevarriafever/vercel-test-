# Fever Hackathon -- Environment Setup

> **How to use**: Open Cursor, start a **new chat** in **Agent mode** (model: **Claude 4.6 Opus High** recommended -- Auto may select a smaller model that struggles with multi-step setup), and paste this entire document as your first message. Cursor will execute every step automatically and adapt to whatever access you have.

---

You are a setup assistant for a Fever hackathon. Execute **only Steps 1 through 10** below (ignore the "How to use" header above and the "Verification prompt" section at the end -- those are for the participant, not for you). Execute the steps **in order**. Steps 2 through 8 can each be skipped without breaking later steps, but they must run sequentially (some depend on earlier results). **Do not stop or ask the participant questions.** At the end, print a status summary with access recommendations.

Track these flags (all start `false`): `HAS_GH`, `HAS_REPO`, `IS_ORG_REPO`, `HAS_PAGES`, `HAS_TOOLKIT`, `HAS_FIGMA`.

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

First download (try `curl.exe` first, it ships with Windows 10+; fall back to `Invoke-WebRequest`):
```powershell
curl.exe -L -o fever-hackathon-starter.zip "https://github.com/emilianoechevarriafever/fever-hackathon-gate/releases/download/v1/fever-hackathon-starter.zip"
```
If `curl.exe` is not found:
```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/emilianoechevarriafever/fever-hackathon-gate/releases/download/v1/fever-hackathon-starter.zip" -OutFile "fever-hackathon-starter.zip"
```

Then extract. Windows built-in "Extract All" does NOT support password-protected zips (it will silently produce corrupt files). You MUST use 7-Zip. Try these locations in order until one works:

1. Check if `7z` is in PATH:
```powershell
7z x fever-hackathon-starter.zip -p"FeverHack2026"
```

2. Try the default 64-bit install path:
```powershell
& "C:\Program Files\7-Zip\7z.exe" x fever-hackathon-starter.zip -p"FeverHack2026"
```

3. Try the 32-bit install path:
```powershell
& "C:\Program Files (x86)\7-Zip\7z.exe" x fever-hackathon-starter.zip -p"FeverHack2026"
```

(Do NOT add a `-o` flag -- the zip already contains a `fever-hackathon-starter/` folder. 7-Zip will extract it correctly.)

If any of the above succeeds:
```powershell
Remove-Item fever-hackathon-starter.zip
cd fever-hackathon-starter
```

If 7-Zip is NOT installed, try to install it automatically with winget:
```powershell
winget install --id 7zip.7zip --accept-source-agreements --accept-package-agreements
```
Then retry extraction using `& "C:\Program Files\7-Zip\7z.exe" x fever-hackathon-starter.zip -p"FeverHack2026"`.

If winget is not available or 7-Zip install fails, tell the participant:

> You need 7-Zip to extract the password-protected zip. Install it from https://7-zip.org/ and re-run this prompt. Alternatively, open https://emilianoechevarriafever.github.io/fever-hackathon-gate/ in your browser, enter the password **FeverHack2026**, download the zip, then right-click it and choose "7-Zip > Extract Here" using password **FeverHack2026**.

If the download itself fails on any OS, tell the participant:

> Open this page in your browser: https://emilianoechevarriafever.github.io/fever-hackathon-gate/
> Enter the password: **FeverHack2026**
> Download the zip. Extract it with 7-Zip (password: **FeverHack2026**). Open the extracted folder in Cursor and re-run this prompt.

**After extraction**, you MUST end up in the directory that directly contains `index.html` and `plan.html`. This is critical -- all subsequent steps depend on the working directory being correct.

To find the right directory: run `ls index.html` (or `dir index.html` on Windows). If it fails, the files are in a subfolder. Search for them:
- macOS/Linux: `find . -maxdepth 3 -name "index.html"`
- Windows: `Get-ChildItem -Recurse -Filter "index.html" -Depth 3`

Then `cd` into the folder that contains `index.html`. Repeat until `ls index.html` (or `dir index.html`) succeeds.

**IMPORTANT**: Do NOT proceed from a parent folder that contains the project as a subfolder. You must be INSIDE the folder with `index.html`. Every step below assumes the current directory IS the project root. If the Cursor workspace root is different from this directory, tell the participant: "Please open the project folder in Cursor (File > Open Folder > select the folder containing index.html) and re-run this prompt so that Cursor's workspace matches the project root."

Then check if a `.git` directory exists (run `git status`). If it does NOT exist (or the command errors), initialize git. **Before staging**, create a `.gitignore` file containing these five lines (one entry per line): `.DS_Store`, `Thumbs.db`, `desktop.ini`, `design-system-toolkit/`, `.cursor/mcp.json`. Use whatever file-creation method works on the current OS (e.g. the file-write tool, `echo`/`printf` redirect on macOS/Linux, or `Set-Content` on Windows).

Then initialize and make the first commit:
```bash
git init
git add -A
git commit -m "Initial commit - Fever hackathon starter"
```

If `git commit` fails with "Please tell me who you are" (user.name/user.email not configured), set them for this repo only and retry:
```bash
git config user.name "Hackathon Participant"
git config user.email "hackathon@fever.com"
git commit -m "Initial commit - Fever hackathon starter"
```

This applies both for freshly extracted files AND for the case where the participant already had the files but no git repo.

Stop here if the project files could not be obtained.

---

**From here on, steps can be skipped if their dependency flag is false. If any step fails for another reason, set its flag to false and continue to the next step.**

---

## Step 2 -- GitHub CLI authentication

Run `gh auth status`.

- **Installed and authenticated**: note the username. Set `HAS_GH=true`.
- **Installed but not authenticated**: run `gh auth login --web -p https`. Tell the participant: "Please complete the GitHub login in the browser window that just opened." Wait for the command to finish. If it succeeds, set `HAS_GH=true`. If the participant cancels or it times out, set `HAS_GH=false` and move on.
- **Not installed**: `HAS_GH=false`. Move on.

## Step 3 -- Create a GitHub repo (requires HAS_GH)

Skip if `HAS_GH=false`.

**Safety check**: verify that `index.html` exists in the current directory. If it does NOT, you are in the wrong directory -- find and `cd` into the correct one before proceeding (see Step 1 instructions). NEVER create a repo from a parent folder.

Verify the repo has at least one commit (run `git log -1`). If it has none, stage and commit everything: `git add -A && git commit -m "Initial commit - Fever hackathon starter"`.

Check if a git remote named `origin` already points to a repo owned by the participant or by the Feverup org (run `git remote -v`). If so, set `HAS_REPO=true` (and `IS_ORG_REPO=true` if the remote contains `Feverup/`) and skip to Step 4. If `origin` exists but points to someone else's repo, remove it first: `git remote remove origin`.

### Determine where to create the repo

Get the authenticated username: `gh api user --jq .login` -- note this as `USERNAME`.

Check if the user is a member of the **Feverup** GitHub organization:
```bash
gh api orgs/Feverup/memberships/USERNAME --jq .state
```
(Replace `USERNAME` with the actual value.)

This command returns `active` if the user is in the org. If it fails with 404 or returns anything other than `active`, the user is NOT a member -- skip to the personal fallback below.

**If the user IS a Feverup org member** (command returned `active`):

Create the repo under the org as **private** (the Feverup Team plan supports Pages on private repos):
```bash
gh repo create Feverup/fever-hackathon-USERNAME --private --source . --push
```
(Replace `USERNAME` with the actual GitHub username, e.g. `Feverup/fever-hackathon-johndoe`.)

- **If it succeeds**: set `HAS_REPO=true`, `IS_ORG_REPO=true`.
- **If it fails because the name exists**: try `Feverup/fever-hackathon-USERNAME-2`. Set flags if this works.
- **If it fails for another reason** (e.g. org restricts repo creation): fall through to the personal fallback below.

**If the user is NOT a Feverup org member, or org repo creation failed** (fallback):

Create a personal repo as **public** (needed for Pages on free accounts):
```bash
gh repo create fever-hackathon --public --source . --push
```

- **If it succeeds**: set `HAS_REPO=true`, `IS_ORG_REPO=false`.
- **If it fails because the name exists**: try `fever-hackathon-2`. Set flags if this works.
- **If it fails for any other reason**: set `HAS_REPO=false`.

## Step 4 -- Enable GitHub Pages (requires HAS_REPO)

Skip if `HAS_REPO=false`.

First, run `gh repo view --json nameWithOwner -q .nameWithOwner` and note the output (e.g. `Feverup/fever-hackathon-johndoe` or `johndoe/fever-hackathon`). Use this value as `OWNER/REPO` in the next command.

Enable Pages:
```bash
gh api "repos/OWNER/REPO/pages" -X POST -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"
```

(Replace `OWNER/REPO` with the actual value from above.)

- **Succeeds or returns 409** (already enabled): get the URL with `gh api "repos/OWNER/REPO/pages" --jq '.html_url'`. Set `HAS_PAGES=true`.
- **Fails with 403 or 422**:
  - If `IS_ORG_REPO=true`: the user may not have admin rights. Try `gh api "repos/OWNER/REPO" --jq .permissions.admin`. If `false`, tell the participant: "You don't have admin access on this repo. Ask the hackathon organizer to grant you admin, or re-run the setup prompt after getting access." Set `HAS_PAGES=false`.
  - If `IS_ORG_REPO=false`: this usually means the repo is private on a free account. Try making it public: `gh repo edit --visibility public --accept-visibility-change-consequences` and retry the Pages command. If it still fails, set `HAS_PAGES=false`.
- **Any other error**: set `HAS_PAGES=false`.

## Step 5 -- Fever Design System Toolkit

Check if `design-system-toolkit/` already exists. If so, set `HAS_TOOLKIT=true` and skip.

Otherwise try cloning (use `GIT_TERMINAL_PROMPT=0` to prevent git from hanging on a credentials prompt if the user lacks access):
```bash
GIT_TERMINAL_PROMPT=0 git clone https://github.com/Feverup/AI-Product-Design-Toolkit.git design-system-toolkit
```
On Windows PowerShell, set the env var first: `$env:GIT_TERMINAL_PROMPT=0` then run the `git clone`.

- **Succeeds**: set `HAS_TOOLKIT=true`.
- **Fails** (access denied, 404, or any error): set `HAS_TOOLKIT=false`. This is fine -- the Cursor Rule in Step 7 includes the key token values inline.

## Step 6 -- Figma MCP

Check if `.cursor/mcp.json` already exists. If it exists and already contains a `"Figma"` entry under `mcpServers`, set `HAS_FIGMA=true` and skip.

If `.cursor/mcp.json` exists but does NOT have a Figma entry, read the file, parse it as JSON (if it is malformed or empty, treat it as if the file does not exist -- see below), add the Figma server to the existing `mcpServers` object, and write it back. The entry to add:
```json
"Figma": {
  "url": "https://mcp.figma.com/mcp",
  "headers": {}
}
```

If `.cursor/mcp.json` does not exist at all, create it:
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

## Step 8 -- Update .gitignore and commit all config

Verify `.gitignore` exists and contains these entries. If any are missing, append them (do not duplicate existing lines):

```
design-system-toolkit/
.DS_Store
Thumbs.db
desktop.ini
.cursor/mcp.json
```

Then stage and commit **all** config files created during setup (`.gitignore`, `.cursor/rules/`, etc.). Only commit if there are staged changes:
```bash
git add .gitignore .cursor/rules/
git diff --cached --quiet || git commit -m "Add hackathon config files"
```

If `HAS_REPO=true`, push so that GitHub Pages gets the latest state:
```bash
git push origin main
```
(If the push fails because the remote already has the same content, that is fine -- ignore the error.)

## Step 9 -- Local development server

**IMPORTANT**: The site MUST be viewed through a local server or GitHub Pages. Opening `index.html` directly from the file system (`file:///...`) will break images, SVGs, and CSS. NEVER tell the participant to open the HTML file directly.

Make sure you are in the project root directory (the one that contains `index.html`). Then start a local server. The server runs forever, so **do not wait for it to finish** -- start it and immediately move on to Step 10.

Try these options in order until one works. If a command fails with "Address already in use" or similar, retry with port 8001, then 8080. Note which port succeeded -- use it in the summary at Step 10.

First check if Python is available. Try these commands in order: `python3 --version`, `python --version`, `py --version`. Note which command succeeded (e.g. `python3`, `python`, or `py`) -- use that same command name in all subsequent Python invocations.

**If Python IS available:**

macOS / Linux (run in background -- replace `python3` with whichever command worked):
```bash
python3 -m http.server 8000 &
```

Windows (run as a detached process -- replace `python` with whichever command worked):
```powershell
Start-Process python -ArgumentList "-m","http.server","8000" -WindowStyle Hidden
```

**If Python is NOT available, try to install it automatically:**

macOS (Homebrew):
```bash
brew install python3 && python3 -m http.server 8000 &
```

Windows (winget -- ships with Windows 10/11):
```powershell
winget install --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
```
After install, the current terminal may not see `python` yet. Try running it via its default install path:
```powershell
Start-Process "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" -ArgumentList "-m","http.server","8000" -WindowStyle Hidden
```
If that path does not exist, try `& "$env:LOCALAPPDATA\Microsoft\WindowsApps\python.exe" -m http.server 8000` or tell the participant to close and reopen their terminal, then re-run the server command.

**If Python install fails or is too slow, use Node.js instead (any OS):**
```bash
npx -y serve -l 8000
```
(This also runs forever -- start it and move on.)

**If nothing above works:**
Tell the participant: "Install the **Live Server** extension in Cursor: open the Extensions panel (Ctrl+Shift+X), search for 'Live Server' by Ritwick Dey, install it. Then right-click `index.html` in the file explorer and choose 'Open with Live Server'."

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
| GitHub repo                | OK/NO  | Feverup/... (private) / personal/... (public) / skipped |
| GitHub Pages               | OK/NO  | url: ... / using localhost:8000            |
| Design System Toolkit      | OK/NO  | cloned / using inlined tokens              |
| Figma MCP                  | OK/NO  | configured / skipped                       |
| Cursor Rule                | OK     | .cursor/rules/fever-hackathon.mdc          |
| Local server               | OK/NO  | http://localhost:PORT / see instructions    |
+----------------------------+--------+-------------------------------------------+
```

If `IS_ORG_REPO=true`, add a note: "Your repo is under the Feverup org (private). GitHub Pages works because Feverup has a Team plan."
If `IS_ORG_REPO=false` and `HAS_REPO=true`, add a note: "Your repo is under your personal account (public). To get a private repo with Pages, you need Feverup org membership."

Then, **if any of GitHub CLI, GitHub repo, Pages, Toolkit, or Figma has status NO**, print:

---

**Some optional capabilities are not set up. Since you are running this before the hackathon, you have time to request the missing accesses for the best experience:**

Only print the bullets that apply (skip the ones already OK):

- **GitHub CLI** (needed for GitHub repo + Pages): Install with `brew install gh` (macOS) or `winget install --id GitHub.cli` (Windows). Then run `gh auth login`. Once installed, re-run this setup prompt.

- **GitHub repo** (needed for GitHub Pages): The best option is to join the **Feverup** GitHub org so the repo is created privately under the org. Ask your manager or the hackathon organizer to invite you at https://github.com/orgs/Feverup/people. If you can't join the org, a personal public repo also works. Re-run this setup prompt after getting access.

- **GitHub Pages** (shareable URL): If you have a repo, re-run this prompt. If your repo is under Feverup, Pages works even with private repos (Team plan). If your repo is personal, it must be public for Pages to work on a free account.

- **Design System Toolkit** (full design tokens and component docs): You need membership in the Feverup GitHub org. Ask your manager or the hackathon organizer to invite you at https://github.com/orgs/Feverup/people. Once invited, run: `git clone https://github.com/Feverup/AI-Product-Design-Toolkit.git design-system-toolkit` -- The Cursor Rule already includes the key tokens inline, so this is a nice-to-have.

- **Figma MCP** (lets Cursor read Figma designs directly): The config file was created, but you need a Figma **Dev** or **Designer** seat on the Fever workspace for it to actually connect. Ask your manager or the Design team to grant you a seat.

**You can fully participate with just the project files, the local server, and the Cursor Rule. The rest improves the experience but is not required.**

---

If ALL capabilities are OK:

If `IS_ORG_REPO=true`:
> **Perfect setup -- everything is ready!** Your repo is under the Feverup org (private) with GitHub Pages live. Open http://localhost:8000 to preview locally, or share your Pages URL. Start a new Cursor Agent chat and describe what you want to build. Happy hacking!

If `IS_ORG_REPO=false`:
> **Perfect setup -- everything is ready!** Your repo is on your personal GitHub (public) with Pages live. Open http://localhost:8000 to preview locally, or share your Pages URL. For a private repo, join the Feverup org and re-run this prompt. Start a new Cursor Agent chat and describe what you want to build. Happy hacking!

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
6. Check if a local server is running: try to fetch http://localhost:8000 (on macOS/Linux: curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 ; on Windows: try curl.exe -s -o NUL -w "%{http_code}" http://localhost:8000 or Invoke-WebRequest -UseBasicParsing -Uri http://localhost:8000 and check the StatusCode).
Report all results.
```
