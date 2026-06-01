# 01 — Evidence (consolidated)

Sources: four parallel evidence agents. All inferences marked [INFERRED].

---

## Structural Evidence

**Sources:** plan_timeline.html (via Grep, 271 lines), js/modules/modes.js (full), js/modules/filters.js (0–199), js/modules/tasks.js (0–199), js/modules/projects.js (0–299), config/static-config.js (full).

**1. Interactive-element count (static HTML)**
39 static elements: 4 mode buttons, 9 nav buttons, 4 quick-view buttons + reset, filter controls (~33 filter buttons), 2 modal action pairs, people-editor buttons, edit toolbar buttons, 2 inputs. Dynamic elements (task/project buttons) are created at runtime by JS and not counted.

**2. Max nesting depth**
Confirmed: 7 levels — filter-bar → filter-body → filter-row → filter-group → person-picker-wrap → person-picker-popup → button (plan_timeline.html:117→141→145→151→153).
Inferred: ~11 levels in main timeline tree (main → section.month → ol.program-list → li.program → div.program-body → ol.project-list → li.project → div.project-body → .po-task-section → ul.po-task-list → li.po-task-item) from tasks.js:290–310 and projects.js:32–53 — unverifiable because line 174 of HTML is a single minified line.

**3. Repeated patterns**
- Filter-reset in two places: `qv-reset` "Снять выборку" (html:115) and `filter-reset` "Очистить фильтры" (html:163) — same action, different labels
- Modal pattern (Cancel + Confirm) implemented 3 independent times: po-pub-modal (html:202–203), po-newproj-modal (projects.js:104–105), np-modal (projects.js:273–274)
- Progress bar (fill + label) implemented 3 times: per-project (tasks.js:26–28), per-program (tasks.js:46–48), approval bar (search.js:19–24)
- Collapse/expand toggle: changes panel (html:102, modes.js:72–89) and programs (html:125–126, search.js:61–64)

**4. Dead globals (spot-check)**
- `window.showStoreStatus` — defined program-flags.js:41, no external consumer found
- `window.ROLES` — exported filters.js:14, no consumer outside filters.js
- `window.PEOPLE` — exported filters.js:13, people-editor.js:23 uses `window.PLAN_CONFIG.PEOPLE` directly

**5. View modes**
4 modes: brief, detailed, projects, edit — modes.js:7–12. Quick-views (mine / near90 / needs / empty) are orthogonal filter layer, not modes.

---

## Visual Evidence

**Sources:** css/base.css (full), css/hero.css (full), css/timeline.css (full), css/programs.css (full), css/statuses.css (full), css/states.css (full), css/filters.css (0–100), css/modes.css (0–100). No browser — all INFERRED.

**1. Spacing scale**
Declared: 4 / 8 / 16 / 24 / 32 / 48 px (base.css:58–63).
Off-grid hardcoded values: 2, 3, 5, 6, 7, 9, 10, 12, 13, 14, 18, 20, 22, 28, 36, 64, 80 px across programs.css, hero.css, timeline.css, base.css, modes.css. Declared variables used in only 2 confirmed rules out of dozens of spacing declarations.

**2. Type scale**
Declared: 11 / 13 / 14 / 16 / 20 px (base.css:51–55).
Off-scale hardcoded values: 9, 9.5, 10, 10.5, 11.5, 12, 12.5, 15, 17, 19 px across programs.css, hero.css, statuses.css, filters.css, modes.css. Body base is 15px (base.css:76) — not in the declared scale. Variable usage confirmed in only 4 rules.

**3. Color count**
~53 distinct colors: 43 in the token system (base.css:3–48: ink×3, bg/surface×5, line×2, accent×3, status pairs×10, task pairs×12, avatar pairs×4, special×4) plus ~10 out-of-system hardcoded values: rgba(31,29,26,…) shadows, rgba(184,117,10,0.06), rgba(248,245,239,0.96), rgba(0,0,0,0.015), #E8EAF6 / #3F51B5 / #C5CAE9 (Material Blue — statuses.css:38), #B8750A / #FDFBF6 (modes.css:64–65). Accent `--accent: #2FC6F6` (bright cyan) stands alone against an otherwise muted warm palette.

**4. Lowest contrast [INFERRED]**
`--ink-soft: #8C98A8` on `--bg: #F5F7FA` ≈ **2.72:1** — used for labels at 9–11px throughout hero.css, timeline.css, programs.css, filters.css, modes.css (section kickers, pub stamp, month stats). WCAG AA requires 4.5:1 for normal text, 3:1 for large text — fails both at these sizes.

**5. States checklist**
| State    | Status  | Evidence / File:line |
|----------|---------|----------------------|
| Loading  | ✓ Present | #po-load-overlay + .po-load-spinner animation — states.css:1–17 |
| Empty    | ◑ Partial | .tasks-empty, .empty-field, .empty-month — programs.css:300–315, timeline.css:107–114 |
| Error    | ◑ Partial | .po-toast-error toast only, no page-level state — states.css:31 |
| Success  | ◑ Partial | .po-toast-success toast only — states.css:32 |
| Focus    | ◑ Partial | --focus-ring variable declared (base.css:44) but no :focus-visible consuming rule found in 8 inspected CSS files |
| Disabled | ✗ Missing | No .is-disabled, [disabled] style, or opacity-based disabled state found in any inspected file |

---

## Copy & Honesty Evidence

**Sources:** plan_timeline.html (via Grep), plan_timeline.js (full), js/modules/modes.js (0–150), js/modules/publish.js (0–100+165), config/static-config.js, js/modules/projects.js (via Grep), js/modules/filters.js (via Grep), js/modules/tasks.js (via Grep).

**1. Flagged inflations**
None found.

**2. Flagged dark patterns**
None found. Three confirm() dialogs use accurate destructive-action descriptions.

**3. Jargon / unclear labels**
| Label | File:line | Issue | Proposed fix |
|-------|-----------|-------|-------------|
| `Контур использования` | html:76, html:160 | "Контур" is systems-engineering jargon; tooltip only on hero cell, not filter chip | `Охват изменений` |
| `Якорь-учредитель` (role) | static-config.js:51 | Internal project-office term; hint text not visible in filter chips | `Инициатор (учредитель)` |
| `Требует решения` | html:113 | Filter label says "решения" but actual flag says "уточнения" (program-flags.js:54, deps.js:70) — mismatch | `Требует уточнения` |
| `Публикация` | html:197, html:244 | "Публикация" implies public sharing; actual action saves to n8n webhook | `Сохранить на сервер` |
| `Черновик` (task status) | static-config.js:189 | Unusual for a task status, differs from `Не начата` in unclear ways | Add hint text |

**4. Label → behavior mismatches**
| Label | Handler | Mismatch |
|-------|---------|---------|
| `Выйти из редактора` (html:246) | plan_timeline.js:40–43 | Clicks mode-btn[data-mode="brief"] — just a mode switch, not a session logout |
| `Редакция документа` (html:59) | plan_timeline.js:27–29 | Updates on every local save flash, not only on publication — shows local edit time, not published revision |
| Mode banner: `доступны панели редактирования и экспорт/импорт` | modes.js:11 | No export/import UI exists in the edit bar (publish, reset, people, logout only) |

---

## Weight & Friction Evidence

**Sources:** plan_timeline.html (full), plan_timeline.js (full), css/states.css (full), Grep across all JS/CSS for keyframes/animation/transition.

**1. JS bytes (estimated)**
~255–270 KB unminified, uncompressed across 19 loaded script files. No bundler, no minification confirmed. js/app.js (16 lines) is present on disk but not referenced in any `<script>` tag.

**2. CSS bytes (estimated)**
~233–240 KB unminified, uncompressed across 15 loaded CSS files. plan_timeline.css (3,472-line monolith) NOT referenced in HTML — confirmed legacy artifact.

**3. Network requests on primary load**
38 total: 19 `<script>` tags (plan_timeline.html:251–269) + 15 `<link rel="stylesheet">` + 2 Google Fonts preconnect + 1 Google Fonts CSS + 1 data.json fetch. Google Fonts CSS will trigger additional .woff2 sub-requests (3 families × variable weights — estimated 3–9 extra requests not directly counted).

**4. TTI estimate**
18 synchronous INIT function calls execute before `loadRemote()` (plan_timeline.js:85–110). All 19 `<script>` tags lack `defer`/`async` — block HTML parsing. Page not interactive until `loadRemote().finally()` removes the full-screen overlay. data.json fetched with `cache: 'no-cache'` and a timestamp query parameter — never served from browser cache.

**5. Animations on idle screen**
1 @keyframes firing on load: `po-spin` (states.css:17) backing the `.po-load-spinner` (states.css:15). All other ~55 `transition:` declarations are interaction-gated (hover, focus, class toggle). `dep-flash` @keyframes (modes.css:165) fires only on user interaction.

**6. Elements visible on first paint**
1: `#po-load-overlay` (full-screen spinner, states.css:2–6). All modals (deps-map, publish, people-editor) hidden behind .open class or HTML `hidden` attribute.

**Known gaps (all agents combined)**
- plan_timeline.html line 174 is a single fully-minified line containing all 212 projects — not readable
- :focus-visible may exist in unread CSS files (css/editor.css, css/assignees.css, css/deps.css, css/dropdown.css, css/search.css, css/theme-b24.css)
- Exact JS/CSS byte counts estimated (PowerShell permission denied for Get-ChildItem sizes)
- No browser execution — dynamic state classes and rendered contrast not measured
- data.json content (task texts, project names) not inspected
