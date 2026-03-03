# Hackathon Organizer Guide

Instructions for preparing and running the Fever design hackathon.

## Pre-hackathon checklist

### 1. Project files -- already handled

The project files live in a **public** repo that anyone can clone without authentication:
https://github.com/emilianoechevarriafever/fever-hackathon-starter

No Drive links, no collaborator invites, no auth needed. The setup prompt clones from here automatically.

### 2. Prepare the Design System Toolkit (optional, nice-to-have)

The repo `Feverup/AI-Product-Design-Toolkit` is **private**. Participants in the Feverup GitHub org can clone it automatically. Others will skip it -- the Cursor Rule already has the key design tokens inlined.

To give more participants access:
- **Option A**: Invite them to the Feverup org at https://github.com/orgs/Feverup/people
- **Option B**: Share the toolkit zip via Google Drive (Fever employees only): https://drive.google.com/file/d/1rRNVN_OXcqGy2KR3GxduRX7DNSr_PFJV/view?usp=sharing

### 3. Confirm participants have Cursor installed

- Cursor version: latest stable (any version with Agent mode).
- Model: Auto or Claude 4.6 Opus High recommended.
- No specific extensions required (the project is plain HTML/CSS/JS).

### 4. Distribute the setup prompt

Share the content of `HACKATHON_SETUP_PROMPT.md` with all participants via Slack or email. They paste it into a new Cursor Agent chat. That's it.

### 5. (Optional) Figma seats

If participants need to reference Figma designs:
- They need a Figma **Dev** or **Designer** seat on the Fever workspace.
- The setup prompt configures the Figma MCP connection automatically.
- Without a seat, they can still work -- they just can't pull designs from Figma directly.

---

## Access matrix

| Capability | No accounts at all | GitHub CLI | Feverup org member | Figma seat |
|---|---|---|---|---|
| **Clone starter repo** | Yes (public) | Yes | Yes | -- |
| **Personal GitHub repo** | No | Yes | Yes | -- |
| **GitHub Pages deploy** | No (localhost) | Yes | Yes | -- |
| **Design System Toolkit** | No (inlined tokens) | No (inlined tokens) | Yes (full clone) | -- |
| **Figma MCP** | No | No | No | Yes |
| **Local development** | Yes | Yes | Yes | Yes |
| **Cursor Rule** | Yes | Yes | Yes | Yes |

**Minimum viable setup**: A participant with NO GitHub and NO Figma can still participate. They will:
1. Clone the public starter repo with plain `git`.
2. Work on localhost.
3. Have design system context via the Cursor Rule (tokens inlined).

**Optimal setup**: GitHub CLI + Feverup org + Figma seat = fork, Pages, full toolkit, Figma MCP.

The setup prompt tells each participant exactly what they're missing and how to request it before hackathon day.

---

## Troubleshooting FAQ

### "GitHub Pages shows 404"

- Pages takes 1-2 minutes to deploy after enabling. Wait and refresh.
- Verify Pages is enabled: `gh api repos/OWNER/REPO/pages --jq '.html_url'`
- If it says `build_type: workflow`, switch to legacy: `gh api repos/OWNER/REPO/pages -X PUT -f build_type=legacy -f source[branch]=main -f source[path]=/`

### "gh: command not found"

Install it: `brew install gh` (macOS) or see https://cli.github.com/. Then re-run the setup prompt.

### "Figma MCP is not connecting"

- Verify `.cursor/mcp.json` exists in the project root.
- Restart Cursor after the file is created.
- The participant must click "Allow" when Cursor prompts for MCP approval.
- Without a Figma seat, MCP will not work regardless of config.

### "Permission denied cloning AI-Product-Design-Toolkit"

The repo is private. The participant needs Feverup org membership, or they can use the inlined tokens in the Cursor Rule.

### "My changes are not showing on GitHub Pages"

Commit and push: `git add -A && git commit -m "description" && git push origin main`. Wait ~60 seconds.

### "I accidentally broke the site"

Reset to the original state:
```bash
git checkout main
git reset --hard HEAD~N
```
(Replace N with the number of commits to undo.) Or re-clone the starter repo.

---

## What participants get after setup

| Component | Location | Required |
|-----------|----------|----------|
| Fever website files | Project root (`index.html`, `plan.html`, etc.) | Yes (always) |
| AI context (Cursor Rule) | `.cursor/rules/fever-hackathon.mdc` | Yes (always) |
| Personal GitHub repo | `github.com/USER/fever-hackathon` | Optional |
| Live deployment | `https://USER.github.io/fever-hackathon/` | Optional |
| Design system toolkit | `design-system-toolkit/` folder | Optional (tokens inlined) |
| Figma connection | `.cursor/mcp.json` | Optional |
| Local server | `http://localhost:8000` | Fallback if no Pages |
