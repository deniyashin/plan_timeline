# Plan 01: Visual System Redesign — plan_timeline

**Trigger**: Design audit score 14/30 (< 20 threshold), Principle #8 (Thorough) = 0.  
**Goal**: Unified design system — closed token vocabulary, single dropdown component, full async state coverage, focused terminology.  
**Stack**: Vanilla JS (`window.*` globals), CSS custom properties, no build tools, GitHub Pages.

---

## Pre-flight: Confirm Active Files

```powershell
# CSS lives in css/*.css — plan_timeline.css is a legacy monolith NOT loaded in HTML
rg 'href="css/' plan_timeline.html          # should list 13 files
rg 'plan_timeline\.css' plan_timeline.html  # should return nothing

# Baseline: hardcoded hex count in JS (to measure improvement after Phase 1)
rg '#[0-9A-Fa-f]{6}' js/modules/ --count-matches
```

---

## Phase 0 (COMPLETE): Documentation Discovery

### Confirmed facts — do NOT re-derive, just use

**Active CSS load order** (plan_timeline.html lines 11–23):  
`base.css` → `assignees.css` → `hero.css` → `change-cards.css` → `filters.css` → `timeline.css` → `programs.css` → `modes.css` → `statuses.css` → `search.css` → `deps.css` → `theme-b24.css` → `editor.css`

**Existing `:root` tokens in `css/base.css`** (preserve all, add alongside):
```
--bg #F8F5EF    --bg-alt #F2EDE3    --surface #FDFBF6
--ink #1F1D1A   --ink-muted #6B655C --ink-soft #8F897E
--line #DDD5C5  --line-soft #E8E1D2
--accent #1F1D1A  --ch-out #5A554C  --radius 6px
--shadow-sm ...  --shadow-md ...
```

**Hardcoded hex inventory in JS** (42+ occurrences):
- `tasks.js`: 20 occurrences — dropdown avatars, calendar widget, option hover states
- `proj-status.js`: 6 occurrences — select styling, owner popup
- `modes.js`: 3 occurrences — person-picker popup
- `deps.js`: 3 occurrences — SVG stroke/fill for confidence levels
- `projects.js`: 5 occurrences — all `#8B2635` (danger) + `#5A554C` (already `--ch-out`)
- `editor.js`: 1 occurrence — `#FFF3B0` highlight

**6 parallel dropdown implementations** (from audit):
1. `proj-status.js` — native `<select>` (lines ~91–109) — keep, style with CSS
2. `proj-status.js` — div-popup for owner (lines ~270–315) — **replace with createDropdown()**
3. `filters.js` — pre-rendered `.assignee-menu` toggled via `.hidden` (lines ~146–201) — **convert to dynamic**
4. `tasks.js` — `<ul class="po-task-st-drop">` for task status (lines ~362–389) — **replace with createDropdown()**
5. `tasks.js` — calendar date-picker `<div class="po-task-cal">` (lines ~193–284) — **keep, extract shared utils**
6. `modes.js` — `#mine-picker-popup` (lines ~139–194, only one with Escape key) — **replace with createDropdown()**

**State coverage gaps**:
- Loading: none — `loadRemote()` (publish.js) fetches silently; DOM renders first, data applied after
- Error: publish modal only + one toast in filters.js (underutilized)
- Success: text change on publish button ("↑ Опубликовано ✓"); flash "✓ Сохранено" in editor
- Focus: `outline:none` at 5+ locations in `css/` without replacement; one gold-standard exists in editor.css: `.po-editable:focus-within { outline: 2px solid #B8750A; }`

**Typography** (all hardcoded in CSS): 23+ unique sizes from 7px to 62px; zero font-size CSS variables.

---

## Phase 1: Color Token System

**Principles**: #3 Aesthetic · #10 As little design as possible  
**Files**: `css/base.css` + 6 JS files + targeted CSS files  
**Do NOT**: change existing token values; rename existing tokens; touch `publish.js` logic

### 1.1 — Add 26 new tokens to `css/base.css`

Read `css/base.css`, find the `:root {` block, append after `--shadow-md`:

```css
/* ── Status semantic (3-level + neutral) ─────────────────────── */
--status-green-bg:   #DEE7DF;  --status-green-ink:   #2F5233;
--status-amber-bg:   #F5E8D0;  --status-amber-ink:   #8E5C0E;
--status-red-bg:     #F3E4E6;  --status-red-ink:     #8B2635;
--status-neutral-bg: #E8E1D2;  --status-neutral-ink: #6B655C;

/* ── Design phase (distinct teal — project lifecycle only) ────── */
--status-design-bg:  #DEEAEC;  --status-design-ink:  #1E6E7A;

/* ── Task statuses ────────────────────────────────────────────── */
--task-progress-bg: #DBEAFE;  --task-progress-ink: #1D4ED8;
--task-review-bg:   #FEF3C7;  --task-review-ink:   #92400E;
--task-blocked-bg:  #FEE2E2;  --task-blocked-ink:  #991B1B;
--task-done-bg:     #D1FAE5;  --task-done-ink:     #065F46;
--task-cancelled-bg:#F3F4F6;  --task-cancelled-ink:#9CA3AF;
--task-draft-bg:    #EEF2FF;  --task-draft-ink:    #4338CA;

/* ── Avatars ──────────────────────────────────────────────────── */
--avatar-unit-bg:   #D4EDE2;  --avatar-unit-ink:   #1B6B4A;
--avatar-person-bg: #ECEAE7;  --avatar-person-ink: #6B6560;

/* ── Interactive states ───────────────────────────────────────── */
--hover:  #F0EDE6;
--active: #E8E2D8;
--danger: #8B2635;

/* ── Focus ring (used as box-shadow value) ────────────────────── */
--focus-ring: 0 0 0 2px #B8750A;

/* ── Special ──────────────────────────────────────────────────── */
--highlight-bg: #FFF3B0;
--shadow-lg: 0 8px 24px rgba(31,29,26,.10);
```

### 1.2 — Migrate hardcoded hex in CSS files

Run `rg '#[0-9A-Fa-f]{6}' css/` and replace systematically. Priority targets:

**`css/statuses.css`** — status badge pairs (6 types × bg + ink):
```
#DEE7DF → var(--status-green-bg)      #2F5233 → var(--status-green-ink)
#F5E8D0 → var(--status-amber-bg)      #8E5C0E → var(--status-amber-ink)
#F3E4E6 → var(--status-red-bg)        #8B2635 → var(--status-red-ink)
#E8E1D2 → var(--status-neutral-bg)    #6B655C → var(--status-neutral-ink)
#DEEAEC → var(--status-design-bg)     #1E6E7A → var(--status-design-ink)
```

**`css/deps.css`** — confidence indicators use identical semantic palette as statuses above.

**`css/programs.css`** — progress bars:
```
#2F5233 (fill) → var(--status-green-ink)
#E8E1D2 (track) → var(--status-neutral-bg)
```

**Approval progress gradient** (grep for `linear-gradient.*2F5233`):
```css
/* Old */
background: linear-gradient(90deg, #2F5233 0%, #2F5233 var(--approved-pct, 0%), #8E5C0E var(--approved-pct, 0%), #8E5C0E var(--in-review-end, 0%), transparent var(--in-review-end, 0%));
/* New */
background: linear-gradient(90deg, var(--status-green-ink) 0%, var(--status-green-ink) var(--approved-pct, 0%), var(--status-amber-ink) var(--approved-pct, 0%), var(--status-amber-ink) var(--in-review-end, 0%), transparent var(--in-review-end, 0%));
```

**`css/editor.css`** and **`css/filters.css`** — interactive states:
```
#F0EDE6 → var(--hover)
#E8E2D8 → var(--active)
#8B2635 → var(--danger)  (delete button hover)
```

**`css/modes.css`** — task status colors in edit bar (grep for `DBEAFE|FEF3C7|FEE2E2|D1FAE5|F3F4F6|EEF2FF`):
```
#DBEAFE → var(--task-progress-bg)    #1D4ED8 → var(--task-progress-ink)
#FEF3C7 → var(--task-review-bg)      #92400E → var(--task-review-ink)
#FEE2E2 → var(--task-blocked-bg)     #991B1B → var(--task-blocked-ink)
#D1FAE5 → var(--task-done-bg)        #065F46 → var(--task-done-ink)
#F3F4F6 → var(--task-cancelled-bg)   #9CA3AF → var(--task-cancelled-ink)
#EEF2FF → var(--task-draft-bg)       #4338CA → var(--task-draft-ink)
```

### 1.3 — Add `cssVar()` helper to `plan_timeline.js`

In `plan_timeline.js`, before the INIT block (`// ── INIT ──`), add:

```js
window.cssVar = function(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};
```

### 1.4 — Migrate hardcoded hex in JS files

In each file, grep for `#[0-9A-Fa-f]{6}` and replace with `cssVar('--token')`. Mapping table:

| Hex value | Token | Appears in |
|-----------|-------|-----------|
| `#D4EDE2` | `cssVar('--avatar-unit-bg')` | tasks.js |
| `#1B6B4A` | `cssVar('--avatar-unit-ink')` | tasks.js |
| `#ECEAE7` | `cssVar('--avatar-person-bg')` | tasks.js |
| `#B0A898` | `cssVar('--avatar-person-ink')` | tasks.js |
| `#FDFBF6` | `cssVar('--surface')` | tasks.js, proj-status.js, modes.js |
| `#DDD5C5` | `cssVar('--line')` | tasks.js, proj-status.js, modes.js |
| `#EDE8DF` | `cssVar('--line-soft')` | tasks.js, proj-status.js |
| `#8B2635` | `cssVar('--danger')` | tasks.js, proj-status.js, projects.js |
| `#FEF0F0` | `cssVar('--status-red-bg')` | tasks.js |
| `#1F1D1A` | `cssVar('--ink')` | tasks.js |
| `#E8E2D8` | `cssVar('--active')` | tasks.js, proj-status.js |
| `#F0EDE6` | `cssVar('--hover')` | tasks.js, proj-status.js, modes.js |
| `#6B6560` | `cssVar('--ink-muted')` | tasks.js, proj-status.js |
| `#5A554C` | `cssVar('--ch-out')` | projects.js (already a var — just reference it) |
| `#FFF3B0` | `cssVar('--highlight-bg')` | editor.js |
| `#E8E1D2` | `cssVar('--line-soft')` | deps.js (SVG stroke) |
| `#2F5233` | `cssVar('--status-green-ink')` | deps.js |
| `#8E5C0E` | `cssVar('--status-amber-ink')` | deps.js |

**Note on SVG in deps.js**: `cssVar()` reads the computed value at call time. In dynamically-generated SVG strings (grep for `stroke.*#`), call `cssVar()` at render time inside `renderDeps()`, not at module initialization.

### 1.5 — Verify Bitrix24 theme isolation

```powershell
# Check if theme-b24.css has a :root block with the B24 overrides
rg ':root' css/theme-b24.css
```

If `css/theme-b24.css` contains only non-`:root` rules (overrides were only in the old monolith), move the Bitrix24 `:root` block from `plan_timeline.css` lines 2695–2713 into `css/theme-b24.css`. The `theme-b24.css` file is already loaded last in HTML — just add the `:root` override block to it.

### Phase 1 Verification

```powershell
# Zero hardcoded hex in JS modules (allowed exception: deps.js SVG if cssVar can't be used there)
rg '#[0-9A-Fa-f]{6}' js/modules/tasks.js js/modules/proj-status.js js/modules/modes.js js/modules/projects.js js/modules/editor.js

# Token vars used in status CSS
rg 'var\(--status-' css/statuses.css | Measure-Object -Line

# Token count in base.css (39 lines: 13 existing + 26 new)
rg '^\s+--' css/base.css | Measure-Object -Line

# Existing token values unchanged
rg '\-\-bg:' css/base.css   # must still be #F8F5EF
rg '\-\-ink:' css/base.css  # must still be #1F1D1A
```

**Anti-patterns to prevent**:
- Do NOT change existing token values — Phase 1 is purely additive
- Do NOT introduce `cssVar()` calls at module-level scope — call at usage time (dropdown render)
- If a hex in CSS has no matching token, create a specific token rather than approximating with nearest

---

## Phase 2: Unified Dropdown Component

**Principles**: #10 As little design as possible · #4 Understandable  
**Files**: new `js/modules/dropdown.js`, new `css/dropdown.css`, modify `proj-status.js`, `tasks.js`, `modes.js`, `filters.js`, `plan_timeline.html`

**Strategy from audit**:
- Unify: implementations #2 (owner popup), #4 (task status), #6 (person-picker) → `createDropdown()`
- Convert: implementation #3 (assignee-menu) from pre-rendered/hidden to dynamic
- Keep separate: #5 (calendar) — date picker has navigation logic incompatible with list; extract shared positioning utils only
- Keep native: #1 (native `<select>`) — style with CSS, no JS needed

### 2.1 — Create `js/modules/dropdown.js`

Add to `plan_timeline.html` before `plan_timeline.js` script tag:
```html
<script src="js/modules/dropdown.js"></script>
```

```js
(function () {
  function positionBelow(popup, anchor) {
    var r = anchor.getBoundingClientRect();
    popup.style.top  = (r.bottom + window.scrollY + 6) + 'px';
    popup.style.left = (r.left + window.scrollX) + 'px';
  }

  function bindOutsideClose(popup) {
    function handler(e) {
      if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', handler, true); }
    }
    document.addEventListener('click', handler, true);
    return handler;
  }

  /**
   * createDropdown(anchor, items, onSelect, opts)
   *
   * anchor  — HTMLElement, the trigger button
   * items   — Array<{ value, label, clear?, avatar?: { initials, isUnit } }>
   * onSelect — function(value)
   * opts    — { currentValue?, minWidth?, position?: 'fixed'|'absolute' }
   */
  window.createDropdown = function (anchor, items, onSelect, opts) {
    opts = opts || {};
    var existing = document.getElementById('po-dropdown-active');
    if (existing) { existing.remove(); return; }

    var popup = document.createElement('div');
    popup.id = 'po-dropdown-active';
    popup.className = 'po-dropdown';
    popup.style.position = opts.position || 'fixed';
    if (opts.minWidth) popup.style.minWidth = opts.minWidth;

    items.forEach(function (item) {
      if (item.divider) {
        var hr = document.createElement('div');
        hr.className = 'po-dropdown-divider';
        popup.appendChild(hr);
        return;
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'po-dropdown-option';
      if (item.value === opts.currentValue) btn.classList.add('is-current');
      if (item.clear) btn.classList.add('po-dropdown-clear');

      if (item.avatar) {
        var av = document.createElement('span');
        av.className = 'po-dropdown-avatar' + (item.avatar.isUnit ? ' is-unit' : '');
        av.textContent = item.avatar.initials;
        btn.appendChild(av);
      }
      var lbl = document.createElement('span');
      lbl.textContent = item.label;
      btn.appendChild(lbl);

      btn.addEventListener('click', function () { popup.remove(); onSelect(item.value); });
      popup.appendChild(btn);
    });

    document.body.appendChild(popup);
    positionBelow(popup, anchor);

    var closeHandler = bindOutsideClose(popup);
    popup.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { popup.remove(); document.removeEventListener('click', closeHandler, true); }
    });
    return popup;
  };

  window.positionDropdownBelow = positionBelow; // shared utility for calendar
})();
```

### 2.2 — Create `css/dropdown.css`

Add to `plan_timeline.html` after `editor.css` link:
```html
<link rel="stylesheet" href="css/dropdown.css">
```

```css
.po-dropdown {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-md);
  padding: 4px;
  min-width: 180px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 700;
}

.po-dropdown-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--ink);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.po-dropdown-option:hover        { background: var(--hover); }
.po-dropdown-option.is-current   { background: var(--active); }
.po-dropdown-option.po-dropdown-clear         { color: var(--danger); }
.po-dropdown-option.po-dropdown-clear:hover   { background: var(--status-red-bg); }
.po-dropdown-option:focus-visible { box-shadow: var(--focus-ring); outline: none; }

.po-dropdown-avatar {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--avatar-person-bg);
  color: var(--avatar-person-ink);
  font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.po-dropdown-avatar.is-unit { background: var(--avatar-unit-bg); color: var(--avatar-unit-ink); }

.po-dropdown-divider { height: 1px; background: var(--line-soft); margin: 4px 0; }
```

### 2.3 — Replace `proj-status.js` owner popup (implementation #2)

Grep for `po-proj-owner-drop` in `js/modules/proj-status.js`. Find the function that creates this popup.

Replace the entire div-construction block with a `createDropdown()` call. Build `ownerItems` from `window.PLAN_CONFIG.PEOPLE`:

```js
// Build items from PLAN_CONFIG
var ownerItems = [{ value: '', label: '— не назначен —', clear: true }];
PLAN_CONFIG.PEOPLE.forEach(function(p) {
  ownerItems.push({
    value: p.id,
    label: p.name,
    avatar: { initials: p.initials || p.name[0], isUnit: false }
  });
});

window.createDropdown(btn, ownerItems, function(val) {
  // existing owner-save logic here (was inside old click handlers)
}, { currentValue: currentOwnerId, minWidth: '220px' });
```

Delete: old inline-style div construction, old `getBoundingClientRect` positioning code, old outside-click listener for this popup.

### 2.4 — Replace `tasks.js` task-status dropdown (implementation #4)

Grep for `po-task-st-drop` in `js/modules/tasks.js`. Find the `<ul>` construction block.

Build `statusItems` from `window.PLAN_CONFIG.TASK_ST` (each entry has icon + label). Replace `<ul>` creation with:

```js
var statusItems = Object.entries(PLAN_CONFIG.TASK_ST).map(function(entry) {
  return { value: entry[0], label: entry[1].label };
});

window.createDropdown(cb, statusItems, function(val) {
  // existing status-save logic
}, { currentValue: currentStatus });
```

Delete: old `<ul class="po-task-st-drop">` construction, old positioning code, old outside-click listener.

### 2.5 — Replace `modes.js` person-picker (implementation #6)

Grep for `mine-picker-popup` in `js/modules/modes.js`. Find `openMinePicker()`.

Build `personItems` from assignees currently in the document (or `PLAN_CONFIG.PEOPLE`). Replace with:

```js
window.createDropdown(btn, personItems, function(val) {
  onSelect(val);
}, { currentValue: currentMe, minWidth: '210px', position: 'absolute' });
```

Note: use `position: 'absolute'` since the original used `window.scrollY` offset — test that `positionBelow()` places it correctly with absolute positioning.

### 2.6 — Convert `filters.js` assignee-menu (implementation #3)

Grep for `assignee-menu` in `js/modules/filters.js` and for the pre-rendered `.assignee-menu` in `plan_timeline.html`.

1. Remove the pre-rendered `<div class="assignee-menu">...</div>` block from `plan_timeline.html`
2. In `filters.js`, replace the `.hidden` toggle logic with `createDropdown()`:

```js
// Find the [data-action="add-assignee"] click handler
// Replace menu.hidden toggle with:
var assigneeItems = buildAssigneeItems(roleRow); // build from current assignments
window.createDropdown(addBtn, assigneeItems, function(personId) {
  addAssignment(roleRow, personId); // existing assignment logic
});
```

### 2.7 — Calendar: extract shared positioning

In `js/modules/tasks.js`, find `drawCal()` / calendar construction. Replace the manual `getBoundingClientRect` + inline `style.top/left` positioning with:

```js
document.body.appendChild(cal);
window.positionDropdownBelow(cal, dueDateBtn); // shared utility from dropdown.js
```

Keep all other calendar logic unchanged.

### Phase 2 Verification

```powershell
# Old dropdown DOM IDs are gone
rg 'po-proj-owner-drop|po-task-st-drop|mine-picker-popup|assignee-menu' js/modules/

# createDropdown is used in 4 places minimum
rg 'createDropdown' js/modules/

# No inline hex in popup-construction code
rg 'style\.cssText.*#[0-9A-Fa-f]' js/modules/proj-status.js js/modules/tasks.js js/modules/modes.js js/modules/filters.js

# css/dropdown.css loaded in HTML
rg 'dropdown\.css' plan_timeline.html
```

Open the app and test manually:
- [ ] Assign owner to a project → dropdown opens, closes on select, closes on Escape, closes on outside click
- [ ] Change task status → dropdown shows statuses from TASK_ST config
- [ ] "Только мои" quick view → person-picker shows people list
- [ ] Add assignee to role in changes panel → person list appears dynamically

**Anti-patterns to prevent**:
- Do NOT attempt to unify the calendar into `createDropdown()` — it has month-navigation state
- Do NOT use `id='po-dropdown-active'` if two different dropdowns can be open simultaneously — use class instead and check
- Do NOT break the Escape key: `createDropdown()` has it; verify it works after each replacement

---

## Phase 3: State Machine

**Principles**: #8 Thorough (scored 0 — highest priority fix)  
**Files**: new `css/states.css`, `plan_timeline.html`, `plan_timeline.js`, `js/modules/publish.js`, `js/modules/filters.js`

### 3.1 — Loading overlay for data.json fetch

**Step A** — Add overlay HTML to `plan_timeline.html`, immediately after `<body data-mode="brief">`:

```html
<div id="po-load-overlay" role="status" aria-label="Загрузка данных">
  <div class="po-load-spinner"></div>
</div>
```

**Step B** — Create `css/states.css`. Add `<link rel="stylesheet" href="css/states.css">` after `deps.css` in HTML.

```css
/* Loading overlay */
#po-load-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.25s;
}
#po-load-overlay.is-done { opacity: 0; pointer-events: none; }

.po-load-spinner {
  width: 32px; height: 32px;
  border: 2px solid var(--line);
  border-top-color: var(--ink-muted);
  border-radius: 50%;
  animation: po-spin 0.7s linear infinite;
}
@keyframes po-spin { to { transform: rotate(360deg); } }

/* Toast notifications */
.po-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9000;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: var(--shadow-md);
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
}
.po-toast.is-visible { opacity: 1; transform: none; }
.po-toast-error   { background: var(--status-red-bg);    color: var(--status-red-ink); }
.po-toast-success { background: var(--status-green-bg);  color: var(--status-green-ink); }
.po-toast-info    { background: var(--surface); color: var(--ink); border: 1px solid var(--line); }
```

**Step C** — In `js/modules/publish.js`, make `loadRemote()` return its fetch promise:
```js
// Find: function loadRemote() {
// Inside: return fetch(...)...  ← add return keyword
window.loadRemote = function() {
  return fetch(DATA_URL).then(function(r) { return r.json(); }).then(function(data) {
    applyData(data);
  }).catch(function(err) {
    window.showToast('Не удалось загрузить данные: ' + err.message, 'error');
  });
};
```

**Step D** — In `plan_timeline.js` INIT block, replace the bare `loadRemote()` call with:
```js
var overlay = document.getElementById('po-load-overlay');
loadRemote().finally(function() {
  if (overlay) {
    overlay.classList.add('is-done');
    setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
  }
});
```

### 3.2 — Expand toast system to global

In `plan_timeline.js`, before the INIT block (alongside the `cssVar` helper from Phase 1):

```js
window.showToast = function(msg, type) {
  // type: 'error' | 'success' | 'info' (default: 'info')
  var toast = document.createElement('div');
  toast.className = 'po-toast po-toast-' + (type || 'info');
  toast.textContent = msg;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add('is-visible'); });
  setTimeout(function() {
    toast.classList.remove('is-visible');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3500);
};
```

Update `js/modules/filters.js`: remove its local `showToast` function (grep for `function showToast`), replace all its calls with `window.showToast(msg, 'error')`.

### 3.3 — Success toast after publish

In `js/modules/publish.js`, grep for `Опубликовано` (the success text change on the button). After that line, add:

```js
window.showToast('Данные опубликованы', 'success');
```

### 3.4 — Fix focus accessibility: replace `outline:none`

Find all broken focus suppressions:
```powershell
rg 'outline:\s*none' css/ -n
```

For **every** match in interactive elements (buttons, chips, inputs):

**Pattern A** — element has NO other focus indication → add `:focus-visible` ring:
```css
/* Keep the :focus rule for older browsers, add :focus-visible below it */
.element:focus { outline: none; }
.element:focus-visible { box-shadow: var(--focus-ring); outline: none; }
```

**Pattern B** — element has `border-color` change on `:focus` → also add ring:
```css
.element:focus { outline: none; border-color: var(--ink); box-shadow: var(--focus-ring); }
```

**Known locations to fix** (from audit, verify with grep before editing):
- `css/statuses.css` (or wherever `.status-chip:focus` lives) — Pattern A
- `css/editor.css` `.po-proj-owner-btn:focus` — Pattern A
- `css/filters.css` `.filter-search:focus` — Pattern B
- Any `input:focus { outline: none }` patterns — Pattern B

**Gold standard to keep**: `.po-editable:focus-within { outline: 2px solid #B8750A; }` in `css/editor.css` — update the hardcoded value to use the token:
```css
.po-editable:focus-within { outline: none; box-shadow: var(--focus-ring); }
```

### 3.5 — DnD error feedback

In `js/modules/tasks.js` and `js/modules/projects.js`, grep for `dragend` and drop error paths. In catch blocks or failed-drop branches, add:

```js
window.showToast('Не удалось переместить элемент', 'error');
```

### Phase 3 Verification

```powershell
# Overlay in HTML
rg 'po-load-overlay' plan_timeline.html

# showToast is global
rg 'window\.showToast' plan_timeline.js

# Publish triggers success toast
rg 'showToast.*success' js/modules/publish.js

# No bare outline:none on interactive elements without focus-visible replacement
rg 'outline:\s*none' css/ -A2  # review each result: should have focus-visible sibling

# states.css loaded
rg 'states\.css' plan_timeline.html
```

Manual test:
- [ ] Refresh page → loading spinner visible, then fades out
- [ ] Kill network, refresh → error toast appears (not silent failure)
- [ ] Publish → success toast appears after completion
- [ ] Tab through status chips → focus ring visible (warm gold outline)
- [ ] Tab into search input → ring visible

**Anti-patterns to prevent**:
- Do NOT block rendering during load — overlay is visual only, page is interactive underneath
- Do NOT skip `finally()` — overlay must be removed even if loadRemote() rejects
- Do NOT add toasts for synchronous UI actions (filter change, mode switch) — only async and destructive actions
- Toast messages must be in Russian

---

## Phase 4: Typography + Spacing Grid

**Principles**: #3 Aesthetic  
**Files**: `css/base.css` (tokens) + 5 targeted CSS files (high-traffic components only)  
**Scope**: Apply tokens to semantic components — do NOT attempt to replace all 200+ occurrences

### 4.1 — Add typography and spacing tokens to `css/base.css`

Append to `:root` block (after Phase 1 additions):

```css
/* ── Typography scale ─────────────────────────────────────────── */
--text-xs:   11px;
--text-sm:   13px;
--text-base: 14px;
--text-lg:   16px;
--text-xl:   20px;

/* ── Spacing grid (4/8/16/24/32/48) ──────────────────────────── */
--space-1:  4px;
--space-2:  8px;
--space-3: 16px;
--space-4: 24px;
--space-5: 32px;
--space-6: 48px;

/* ── Radius scale ─────────────────────────────────────────────── */
--radius-sm:  4px;   /* chips, tags, small badges */
--radius-md:  8px;   /* cards, dropdowns */
--radius-lg: 12px;   /* modals, large panels */
```

`--radius: 6px` (existing) stays — do NOT remove it.

### 4.2 — Apply typography tokens to semantic components

Grep for each selector to find the correct CSS file, then apply:

| Component | Selector pattern (grep for) | Target token |
|-----------|-----------------------------|-----------| 
| Program/change name | `po-prog-title\|po-ch-name\|ch-title` | `var(--text-xl)` |
| Section headers in modal | `po-modal.*h\|po-modal-title` | `var(--text-xl)` |
| Project title | `po-proj-name\|po-project-title` | `var(--text-base)` |
| Status chips | `status-chip\|status-badge\|certainty-` | `var(--text-xs)` |
| Task item label | `po-task-label\|po-task-title` | `var(--text-sm)` |
| Toolbar buttons | `po-toolbar\|doc-top.*btn\|nav-btn` | `var(--text-sm)` |

### 4.3 — Apply spacing tokens to layout containers

| Component | Selector pattern | Property | Token |
|-----------|-----------------|----------|-------|
| Modal container | `po-modal\b` | padding | `var(--space-4)` (24px) |
| Program card | `po-prog-card\|po-change-card` | padding | `var(--space-3)` (16px) |
| Timeline month cell | `po-month-cell\|po-cell\b` | padding | `var(--space-2)` (8px) |
| Section gaps | `gap:` in flex/grid layouts | gap | `var(--space-2)` or `var(--space-3)` |

### 4.4 — Apply radius tokens to semantic containers

| Context | Target radius | Token |
|---------|--------------|-------|
| Status chips, badges | 3–4px → `var(--radius-sm)` | `--radius-sm` |
| Cards, dropdowns, popovers | 6–8px → `var(--radius-md)` | `--radius-md` |
| Modal dialogs, large panels | 10–12px → `var(--radius-lg)` | `--radius-lg` |

Do NOT replace every `border-radius` instance — target semantic containers only.

### Phase 4 Verification

```powershell
# Tokens used (at least 5+ locations each)
rg 'var\(--text-' css/ | Measure-Object -Line
rg 'var\(--space-' css/ | Measure-Object -Line
rg 'var\(--radius-' css/ | Measure-Object -Line

# Sub-10px font sizes should not appear in high-traffic component CSS
rg 'font-size:\s*[789]px' css/programs.css css/modes.css css/timeline.css
```

**Anti-patterns to prevent**:
- Do NOT attempt full coverage of all 200+ font-size values — semantic components only
- Do NOT change print styles (`pt` values in `@media print` — leave as-is)
- Do NOT touch `clamp()` expressions (hero headline) — they're intentionally responsive

---

## Phase 5: Terminology Fixes

**Principles**: #4 Understandable  
**Files**: `plan_timeline.html`, `js/modules/filters.js`  
**Scope**: 3 button renames + `aria-pressed` attributes + tooltip improvements

### 5.1 — Rename ambiguous "Сбросить" buttons

**Verify current state first**:
```powershell
rg 'Сбросить' plan_timeline.html js/modules/filters.js -n
```

**Rename (edit `plan_timeline.html`)**:

| Current text | Location | New text | Also update `title=` |
|-------------|----------|----------|---------------------|
| `Сбросить выборку` | Quick-views section (~line 110) | `Снять выборку` | If present, update to match |
| `Сбросить фильтры` | Filter reset button `id="filter-reset"` (~line 158) | `Очистить фильтры` | — |
| `Сбросить изменения` | Edit bar button `id="po-btn-reset"` (~line 208) | `Вернуть к опубликованной версии` | Update existing `title` to: "Отменить все несохранённые изменения и вернуться к последней публикации" |

**In `js/modules/filters.js`**: grep for any dynamically-inserted "Сбросить" text in button labels — update to match HTML.

### 5.2 — Improve jargon tooltip coverage

Jargon terms already have `title=` attributes on role filter buttons (confirmed in audit). Improve for role chips in the changes panel:

Grep for `.role-line-compact` spans in `plan_timeline.html`. Verify each has a `title` attribute. If any are missing:

| Term | Suggested `title` text |
|------|----------------------|
| Якорь-учредитель | "Инициирует изменение и удерживает вектор направления" |
| Владелец внедрения | "Контролирует применение изменений на практике" |
| Методолог | "Отвечает за корректность бизнес-процесса" |

For "Контур использования" in hero status bar: if the cell has no `title`, add `title="Организационный периметр, охваченный изменением"`.

### 5.3 — Add `aria-pressed` to filter toggles

**In `plan_timeline.html`** — add initial `aria-pressed="false"` to:
- All `[data-change-filter]` buttons (change initiative filter chips)
- All `[data-role-filter]` buttons (role filter buttons)

**In `js/modules/filters.js`** — when toggling active state, update:
```js
btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
```

Grep for where filter chip `.active` class is toggled to find the right location.

### Phase 5 Verification

```powershell
# No user-visible "Сбросить" remaining
rg 'Сбросить' plan_timeline.html  # should return 0 matches

# Aria-pressed present on filter buttons
rg 'aria-pressed' plan_timeline.html | Measure-Object -Line  # should be > 0

# New button texts present
rg 'Снять выборку|Очистить фильтры|Вернуть к опубликованной' plan_timeline.html
```

---

## Regression Checklist

Run after **every phase** completes:

| What to protect | How to verify | Risk phase |
|----------------|--------------|-----------|
| Warm beige palette unchanged | `rg '\-\-bg:' css/base.css` → must be `#F8F5EF` | 1 |
| Semantic status palette values correct | Check `--status-green-ink` is `#2F5233` etc. in base.css | 1 |
| Mode switching works | Switch brief/detailed/projects/edit; verify CSS cascade intact | 2 |
| Quick views functional | "Только мои", "Ближайшие 90 дней", "Требует решения" filter correctly | 2 |
| Program→Project→Task hierarchy | Expand program, see projects; expand project, see tasks | 2, 3 |
| `--ch` color per change initiative | Each initiative has distinct border/accent color | 1 |
| Publish webhook fires | Click Publish in edit mode; verify data saves (check n8n logs) | 3 |
| DnD between months | Drag project between month columns | 3 |
| Edit-mode text fields | Click to edit a title; verify focus ring appears | 3, 4 |
| Data loads on refresh | Hard refresh; verify data from data.json applied correctly | 3 |

---

## Deliverables Checklist

| Deliverable | Phase | File |
|------------|-------|------|
| Token manifest (26 new CSS vars) | 1 | `css/base.css` |
| `cssVar()` helper | 1 | `plan_timeline.js` |
| Bitrix24 theme in isolated file | 1 | `css/theme-b24.css` |
| `po-dropdown` JS factory | 2 | `js/modules/dropdown.js` |
| `po-dropdown` CSS | 2 | `css/dropdown.css` |
| 4 dropdown replacements | 2 | `proj-status.js`, `tasks.js`, `modes.js`, `filters.js` |
| Loading overlay | 3 | `plan_timeline.html` + `css/states.css` |
| `showToast()` global | 3 | `plan_timeline.js` |
| Success toast for publish | 3 | `js/modules/publish.js` |
| Focus rings on all interactive elements | 3 | `css/*.css` |
| Typography + spacing tokens | 4 | `css/base.css` |
| Tokens applied to semantic components | 4 | `css/programs.css`, `css/modes.css`, `css/editor.css` |
| Renamed button labels | 5 | `plan_timeline.html` |
| `aria-pressed` on filter buttons | 5 | `plan_timeline.html` + `js/modules/filters.js` |
