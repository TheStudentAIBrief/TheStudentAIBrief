# CLAUDE.md

## Rules — read before every task

**Design-first. This is a premium publication — aim for "ultra luxury," never just functional.**

The rule that matters most: **you don't out-prompt bad AI design taste, you give the model a reference.** Before designing a page or section, pull a real reference and match it — never invent from a blank page. Avoid the AI "slop" tells: purple gradients, Inter font, a centered hero with one lonely button.

1. **Grab a reference first.** Real product screens: **Mobbin** (mobbin.com) and **refero.design** ("steal decisions, not designs"). Premium motion moments: **ui.aceternity.com**, **magicui.design**, **reactbits.dev** — reproduce the effect in vanilla CSS/Canvas (this is a static site; see below). Kill ugly default colours/fonts: **tweakcn.com**. Icons: **lucide.dev**.
2. **Then invoke the best-fit design skill and follow it:**
   - `artifact-design` / `frontend-design` — layout, typography, visual identity, avoiding AI-design tells
   - `dataviz` — any chart, graph, or data visualisation
   - `canvas-design`, `theme-factory`, `web-artifacts-builder` — generative visuals, theming, shadcn-style HTML
3. **Verify it** in a real browser with the `chrome-devtools` / `webapp-testing` (Playwright) skills before calling it done.

Full toolkit and rationale: `~/.claude/projects/C--Users-theol/memory/reference_toolkit_webdesign.md`.
Caveat: component libraries like 21st.dev / shadcn / componentry assume React + npm, which this site does not have (see Static-hosting reality) — use them as visual references only and rebuild in vanilla/CDN.

**Match the house style.** One identity across every page: gold on near-black, Playfair Display headlines, DM Sans body, DM Mono for labels and data, restrained motion. New work must look like it belongs beside `index.html`, not bolted on.

**Static-hosting reality.** The site is served as static files on GitHub Pages — there is no build step. Use vanilla HTML/CSS/JS or CDN-loaded libraries (`<script>` / `<link>`). Do NOT introduce npm, framework, or bundler builds that GitHub Pages cannot run.

**Working discipline.**
- Say in one sentence what you are changing before you change it.
- Edit surgically. Do not reformat or "improve" code you were not asked to touch.
- Long-form issues live as their own pages under `issues/` (e.g. `issues/kronos-deep-dive.html`). Adding new issue pages is expected, not a violation.

## Files
- `index.html` — public landing page and issue archive. Edit surgically.
- `command-centre.html` — internal ops dashboard (`noindex`).
- `issues/` — individual long-form issue pages.

## Brand
Background #0A0A0A | Surface #141414 | Gold #C9A84C | Text #F5F2EC
Fonts: Playfair Display (headlines) · DM Sans (body) · DM Mono (labels/data)
