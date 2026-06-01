# Plan 01 — Visual System Redesign

Цель: поднять оценку аудита Дитера Рамса с 16/30 до ~24/30.
Вердикт аудита: перепроектировать визуальную систему, не трогая структуру и JS-логику.

## Phase 0 — Documentation Discovery (ВЫПОЛНЕНО)

### Allowed APIs (подтверждены чтением файлов)

**Токен-система (css/base.css:2–68) — единственный источник правды:**

| Категория | Токены (текущее состояние) |
|---|---|
| Основные цвета | `--bg` `--bg-alt` `--surface` `--ink` `--ink-muted` `--ink-soft` `--line` `--line-soft` `--accent` `--ch-out` |
| Интерактивные | `--hover` `--active` `--danger` `--focus-ring` |
| Семантические | `--status-*-bg/ink` (4 пары), `--status-design-*` (2), `--task-*-bg/ink` (6 пар), `--avatar-*-bg/ink` (2 пары) |
| Тени | `--shadow-sm` `--shadow-md` `--shadow-lg` |
| Типографика | `--text-xs:11px` `--text-sm:13px` `--text-base:14px` `--text-lg:16px` `--text-xl:20px` |
| Отступы | `--space-1:4px` → `--space-6:48px` |
| Радиус | `--radius:10px` `--radius-sm:4px` `--radius-md:8px` `--radius-lg:12px` |
| Спецэффекты | `--highlight-bg` |

**Нарушения (подтверждены субагентами):**
- `--accent: #2FC6F6` — яркий циан, выбивается из палитры (base.css:11)
- `--focus-ring` объявлен (base.css:44), но не используется ни одним CSS-правилом в states.css
- `--radius: 10px` — не входит в шкалу 4/8/12px (base.css:13)
- `--bg-alt` практически дублирует `--bg` (#F8FAFC vs #F5F7FA)
- `--ch-out: #64748B` дублирует концепт `--ink-muted: #6B778C`
- `--text-base: 14px` но body font-size: 15px (base.css:76 — несоответствие)
- Material Blue в statuses.css:38 (#3F51B5, #E8EAF6, #C5CAE9) — вне токен-системы
- css/programs.css: 60+ хардкодных spacing/font-size значений (9, 9.5, 10, 10.5, 11px)
- css/hero.css: font-size 9px (L39), 17px (L73), 10px (L88), 19px (L96)
- css/states.css: нет `[disabled]` и нет `:focus-visible` (31 строка файла)
- ghost-btn в base.css:136: border-radius: 3px (не из шкалы)

**Антипаттерны для всех фаз:**
- Не менять HTML-структуру и JS-логику
- Не вводить Tailwind / CSS-in-JS
- Не трогать `--status-*` / `--task-*` / `--avatar-*` (семантические токены правильные)
- Не менять шрифты Fraunces + Geist и editorial hero-секцию
- Не трогать цветовое кодирование 5 направлений (#8B2635/#1E6E7A/#B8750A/#2F5233/#2E3A8A)

---

## Phase 1 — Token System Unification [#3 Aesthetic]

**Файлы:** `css/base.css`, `css/programs.css`, `css/hero.css`, `css/statuses.css`

### 1.1 Обновить css/base.css — определения токенов

**Прочитать перед началом:** css/base.css (145 строк)

**Изменения:**

**A. Заменить `--accent` (base.css:11):**
```css
/* БЫЛО */
--accent: #2FC6F6;
/* СТАТЬ */
--accent: #6B655C;   /* тёплый нейтральный, производный от --avatar-person-ink */
```

**B. Обновить `--focus-ring` (base.css:44) — синхронизировать с новым accent:**
```css
/* БЫЛО */
--focus-ring: 0 0 0 2px #2FC6F6;
/* СТАТЬ */
--focus-ring: 0 0 0 2px rgba(107,101,92,.40);
```

**C. Удалить `--radius: 10px` (base.css:13) — не входит в шкалу 4/8/12:**
Удалить строку. Найти все `var(--radius)` в CSS файлах и заменить на `var(--radius-md)`.
Команда для поиска: `grep -r "var(--radius)" css/` — заменить каждое вхождение на `var(--radius-md)`.

**D. Удалить `--bg-alt: #F8FAFC` (base.css:4):**
Найти все `var(--bg-alt)` в CSS, заменить на `var(--bg)`. Затем удалить строку токена.

**E. Удалить `--ch-out: #64748B` (base.css:12):**
Найти все `var(--ch-out)`, заменить на `var(--ink-muted)`. Затем удалить строку.

**F. Удалить `--shadow-lg` (base.css:48):**
Найти `var(--shadow-lg)` в CSS, заменить на `var(--shadow-md)`. Затем удалить строку.

**G. Исправить типографическую шкалу (base.css:51–55) — цель 11/13/15/20/40px:**
```css
/* БЫЛО */
--text-xs:   11px;
--text-sm:   13px;
--text-base: 14px;
--text-lg:   16px;
--text-xl:   20px;
/* СТАТЬ */
--text-xs:   11px;
--text-sm:   13px;
--text-base: 15px;   /* синхронизировать с body font-size:15px (L76) */
--text-xl:   20px;
--text-2xl:  40px;   /* для hero display */
/* --text-lg: 16px — УДАЛИТЬ, не входит в шкалу */
```
После удаления `--text-lg` найти все `var(--text-lg)` в CSS, заменить на `var(--text-base)`.

**H. Исправить ghost-btn border-radius (base.css:136):**
```css
/* БЫЛО */
border-radius: 3px;
/* СТАТЬ */
border-radius: var(--radius-sm);
```

**I. Исправить background у .doc-top (base.css:91):**
```css
/* БЫЛО */
background: rgba(245, 247, 250, 0.92);
/* СТАТЬ */
background: rgba(245, 247, 250, 0.92);   /* временно оставить — нет токена для rgba */
/* NOTE: добавить --bg-glass: rgba(245,247,250,0.92) в токены или оставить как есть */
```
Рекомендация: добавить `--bg-glass: rgba(245, 247, 250, 0.92);` в секцию Special (base.css:46–48).

**Чеклист верификации Phase 1.1:**
- [ ] `grep "var(--radius)[^-]" css/*.css` → 0 результатов (все заменены на --radius-md/sm/lg)
- [ ] `grep "var(--bg-alt)" css/*.css` → 0 результатов
- [ ] `grep "var(--ch-out)" css/*.css` → 0 результатов
- [ ] `grep "var(--shadow-lg)" css/*.css` → 0 результатов
- [ ] `grep "var(--text-lg)" css/*.css` → 0 результатов
- [ ] `grep "#2FC6F6" css/*.css` → 0 результатов
- [ ] Подсчитать токены в :root {} → должно быть ≤ было − 5 удалённых + 2 добавленных

---

### 1.2 Исправить css/programs.css — нестандартные значения

**Прочитать перед началом:** css/programs.css (380 строк)

Цель: не заменять каждый px-отступ (это нецелесообразно для micro-spacing), но устранить
критические нарушения: нестандартные font-size и нестандартные border-radius.

**A. Font-size — заменить все нестандартные значения:**

| Строка | Элемент | Текущее | Заменить на |
|---|---|---|---|
| L42 | .program-kind | 9.5px | var(--text-xs) [11px] |
| L60 | .project-kind | 9px | var(--text-xs) [11px] |
| L64 | .contour-chip | 10px | var(--text-xs) [11px] |
| L76 | .contour-chip-lg | 11px | var(--text-xs) |
| L82 | .src-tag | 9px | var(--text-xs) |
| L105 | .program-id-mono | 11px | var(--text-xs) |
| L112 | .project-count | 11px | var(--text-xs) |
| L163 | .field-value | 14px | var(--text-base) |
| L175 | .field-source .field-value | 13px | var(--text-sm) |
| L190 | .projects-header-label | 10px | var(--text-xs) |
| L250 | .project-index | 10.5px | var(--text-xs) |
| L267 | .project-id-mono | 10px | var(--text-xs) |
| L274 | .task-badge | 10px | var(--text-xs) |
| L306 | .tasks-heading | 10px | var(--text-xs) |
| L313 | .tasks-empty-note | 13px | var(--text-sm) |
| L326 | .task | 13px | var(--text-sm) |
| L340 | .task-id | 10px | var(--text-xs) |

**B. Border-radius — заменить нестандартные значения (не 4/8/12px):**

| Строка | Элемент | Текущее | Заменить на |
|---|---|---|---|
| L47 | .program-kind | 3px | var(--radius-sm) |
| L70 | .contour-chip | 3px | var(--radius-sm) |
| L90 | .src-tag | 3px | var(--radius-sm) |
| L117 | .project-count | 3px | var(--radius-sm) |
| L245 | .project-accent | 2px | var(--radius-sm) |

**Чеклист верификации Phase 1.2:**
- [ ] `grep -n "[0-9]\.5px\|9px\|10px\|10\.5px" css/programs.css` → 0 результатов для font-size
- [ ] `grep -n "border-radius: [12]px" css/programs.css` → 0 результатов

---

### 1.3 Исправить css/hero.css — нестандартные font-size

**Прочитать перед началом:** css/hero.css (137 строк)

| Строка | Элемент | Текущее | Заменить на |
|---|---|---|---|
| L39 | .po-pub-stamp-label | 9px | var(--text-xs) [11px] |
| L73 | .hero-lede | 17px | var(--text-base) [15px] |
| L88 | .section-kicker | 10px | var(--text-xs) [11px] |
| L96 | .legend-title | 19px | var(--text-xl) [20px] |
| L125 | .legend-swatch border-radius | 3px | var(--radius-sm) |

**Чеклист верификации Phase 1.3:**
- [ ] `grep -n "9px\|10px\|17px\|19px" css/hero.css` → 0 результатов

---

### 1.4 Исправить css/statuses.css:38 — Material Blue

**Прочитать перед началом:** css/statuses.css строки 35–45

**Строка 38 (`.flag-needs-decomp`) — заменить Material Blue на токен-систему:**
```css
/* БЫЛО */
.flag-needs-decomp { background: #E8EAF6; color: #3F51B5; border-color: #C5CAE9; }

/* СТАТЬ */
.flag-needs-decomp { background: var(--task-draft-bg); color: var(--task-draft-ink); border-color: var(--line); }
```
Обоснование: --task-draft-bg (#EEF2FF) / --task-draft-ink (#4338CA) — семантически близко
(«нужна декомпозиция» = черновик/в работе), и цвета уже в токен-системе.

**Также в statuses.css — нестандартные border-radius:**
- L30: `.program-flag` и `.approval-*` пилюли с 3px → заменить на `var(--radius-sm)`
- L76: `.dep-id` 3px → `var(--radius-sm)`

**Чеклист верификации Phase 1.4:**
- [ ] `grep -n "#3F51B5\|#E8EAF6\|#C5CAE9" css/*.css` → 0 результатов
- [ ] `grep -n "border-radius: 3px\|border-radius: 2px" css/*.css` → 0 результатов

---

## Phase 2 — Label Corrections [#6 Honest]

**Файлы:** `plan_timeline.html`, `plan_timeline.js`, `js/modules/modes.js`

**Прочитать перед началом:** plan_timeline.html строки 50–70 и 240–250; plan_timeline.js строки 25–45; modes.js строки 7–15.

### 2a. Переименовать кнопку «Выйти из редактора»

**plan_timeline.html:246:**
```html
<!-- БЫЛО -->
<button class="po-btn-logout" id="po-btn-logout">Выйти из редактора</button>
<!-- СТАТЬ -->
<button class="po-btn-logout" id="po-btn-logout">Вернуться к просмотру</button>
```
JS-обработчик (plan_timeline.js:40–43) менять не нужно — клик по кнопке переключает
на режим «brief», что совпадает с новым названием.

### 2b. Исправить «Редакция документа» — несоответствие поведению

**Вариант A (рекомендуемый): переименовать метку**

plan_timeline.html:59:
```html
<!-- БЫЛО -->
<span class="po-pub-stamp-label">Редакция документа</span>
<!-- СТАТЬ -->
<span class="po-pub-stamp-label">Последнее изменение</span>
```
Это честно: штамп обновляется при каждом localStorage-сохранении (plan_timeline.js:27–29).

**Вариант B (если хотим только при публикации):** показывать штамп только при наличии
`po-published-at` в localStorage, а не `po-doc-edited`. Требует изменения plan_timeline.js:27–29
и функции `updatePubStamp`. Этот вариант сложнее — рекомендуется Вариант A.

### 2c. Убрать «экспорт/импорт» из баннера режима редактирования

**js/modules/modes.js:11:**
```javascript
// БЫЛО
edit: 'Сейчас режим «Редактирование» · доступны панели редактирования и экспорт/импорт'
// СТАТЬ
edit: 'Сейчас режим «Редактирование» · доступны панели редактирования'
```

**Чеклист верификации Phase 2:**
- [ ] `grep "Выйти из редактора" plan_timeline.html` → 0 результатов
- [ ] `grep "Редакция документа" plan_timeline.html` → 0 результатов
- [ ] `grep "экспорт/импорт" js/modules/modes.js` → 0 результатов
- [ ] Открыть страницу в браузере → в режиме редактирования баннер не содержит «экспорт/импорт»
- [ ] Нажать «Вернуться к просмотру» → переключается в режим brief ✓

---

## Phase 3 — Missing UI States [#8 Thorough]

**Файлы:** `css/states.css`, `js/modules/publish.js`, `plan_timeline.html`

**Прочитать перед началом:** css/states.css (31 строка); css/base.css:39–44 (--hover, --active, --focus-ring)

### 3a. Добавить [disabled] стили в css/states.css

Добавить после строки 33 (конец файла):

```css
/* ── Disabled state ────────────────────────────────────────────────── */
[disabled],
.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

button[disabled],
.po-btn[disabled],
.ghost-btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}
```

### 3b. Добавить :focus-visible в css/states.css

Добавить после блока [disabled]:

```css
/* ── Keyboard focus (using --focus-ring token from base.css:44) ─────── */
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

/* Для элементов с уже заданным box-shadow — добавить к нему */
.ghost-btn:focus-visible,
.po-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring), var(--shadow-sm);
}
```

### 3c. Добавить inline page-level ошибку для loadRemote()

**Прочитать:** js/modules/publish.js:158–170; plan_timeline.html — найти контейнер для ошибки

**A. Добавить DOM-контейнер в plan_timeline.html** (перед закрывающим `</body>` или после `<body>`):
Найти место рядом с `<div id="po-load-overlay">` или после него и добавить:
```html
<div id="po-load-error" class="po-load-error" hidden>
  <span class="po-load-error-icon">!</span>
  <span class="po-load-error-msg">Не удалось загрузить данные</span>
  <button class="ghost-btn" onclick="window.loadRemote && window.loadRemote()">Повторить</button>
</div>
```

**B. Добавить стили в css/states.css:**
```css
/* ── Page-level load error ─────────────────────────────────────────── */
.po-load-error {
  position: fixed; bottom: var(--space-4); left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: var(--space-2);
  background: var(--status-red-bg); color: var(--status-red-ink);
  border: 1px solid var(--status-red-ink);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  z-index: 8000;
  box-shadow: var(--shadow-md);
}
.po-load-error[hidden] { display: none; }
.po-load-error-icon { font-weight: 700; }
```

**C. Обновить js/modules/publish.js:165 — показывать inline ошибку дополнительно к toast:**

Перед строкой 165 найти блок catch/error в `loadRemote()`. Добавить показ `.po-load-error`:
```javascript
// После строки 165 (showToast) добавить:
var errEl = document.getElementById('po-load-error');
if (errEl) { errEl.hidden = false; }
```

Также добавить скрытие ошибки при успешной загрузке (в `.then()` блоке):
```javascript
var errEl = document.getElementById('po-load-error');
if (errEl) { errEl.hidden = true; }
```

**Чеклист верификации Phase 3:**
- [ ] `grep ":focus-visible" css/states.css` → есть правило ✓
- [ ] `grep "\[disabled\]" css/states.css` → есть правило ✓
- [ ] `grep "po-load-error" plan_timeline.html` → элемент присутствует ✓
- [ ] Открыть браузер → Tab по интерактивным элементам показывает focus outline ✓
- [ ] В DevTools: добавить `disabled` к кнопке → opacity:0.45, cursor:not-allowed ✓

---

## Phase 4 — Terminology & Controls [#4 Understandable]

**Файлы:** `plan_timeline.html`, `config/static-config.js`

**Прочитать перед началом:** plan_timeline.html строки 75–80, 110–120, 155–170; config/static-config.js строки 50–55

### 4a. «Контур использования» → «Охват изменений»

plan_timeline.html:76 (метка в hero-секции):
```html
<!-- БЫЛО -->
<span class="hero-status-label">Контур использования</span>
<!-- СТАТЬ -->
<span class="hero-status-label">Охват изменений</span>
```

Также найти и заменить в строке ~160 (метка фильтра «Контур»):
```html
<!-- БЫЛО (L160, внутри .filter-group) -->
<span class="filter-label">Контур</span>
<!-- СТАТЬ -->
<span class="filter-label">Охват</span>
```

### 4b. «Якорь-учредитель» → «Инициатор (учредитель)»

config/static-config.js:51:
```javascript
// БЫЛО
"anchor": { "short": "Я", "label": "Якорь-учредитель", "hint": "инициирует изменение и удерживает его" },
// СТАТЬ
"anchor": { "short": "И", "label": "Инициатор (учредитель)", "hint": "инициирует изменение и удерживает его" },
```
Примечание: `"short": "Я"` → `"И"` — чтобы инициал соответствовал новому названию.
Проверить, нет ли хардкода "Я" в HTML или JS (маловероятно, но стоит grep-нуть).

### 4c. «Требует решения» → «Требует уточнения»

plan_timeline.html:113 (quick-view кнопка):
```html
<!-- БЫЛО -->
<button class="quick-view-btn" type="button" data-quickview="needs">Требует решения</button>
<!-- СТАТЬ -->
<button class="quick-view-btn" type="button" data-quickview="needs">Требует уточнения</button>
```
Проверить js/modules/program-flags.js:54 — там флаг уже называется `'требует уточнения'` ✓
Текст кнопки теперь совпадает с флагом.

### 4d. Слить два filter-reset в один контрол

**Найти оба элемента в plan_timeline.html:**
- `id="qv-reset"` (кнопка «Снять выборку», L115) — сбрасывает quick-view фильтр
- `id="filter-reset"` (кнопка «Очистить фильтры», ~L163) — сбрасывает назначения/фильтры

**Стратегия объединения:**

Вариант A — один унифицированный контрол:
```html
<!-- УДАЛИТЬ оба существующих и добавить один: -->
<button class="filter-reset unified-reset" type="button" id="unified-reset">Сбросить выборку</button>
```

Затем в JS (js/modules/filters.js и js/modules/search.js) — найти обработчики `qv-reset` и
`filter-reset` и переключить их на `unified-reset`. **Читать эти файлы перед изменением.**

Вариант B (безопаснее) — переименовать оба, убрать дублирование через CSS:
скрывать одну кнопку через `display:none` если другая уже видна.

Рекомендация: **Вариант B** — меньше риска сломать JS-логику.

**Чеклист верификации Phase 4:**
- [ ] `grep "Контур использования" plan_timeline.html` → 0
- [ ] `grep "Якорь-учредитель" config/static-config.js` → 0
- [ ] `grep "Требует решения" plan_timeline.html` → 0
- [ ] `grep "\"short\": \"Я\"" config/static-config.js` → 0
- [ ] Открыть страницу → фильтр «Охват» отображается корректно ✓
- [ ] Quick-view кнопка «Требует уточнения» фильтрует те же программы что и раньше ✓

---

## Phase 5 — Network Efficiency [#9 Environmentally friendly]

**Файлы:** `plan_timeline.html`, `js/modules/publish.js`

**Прочитать перед началом:** plan_timeline.html строки 249–272; js/modules/publish.js строки 158–165

### 5a. Добавить defer ко всем 19 скриптам

plan_timeline.html:251–269 — 19 тегов `<script>` без атрибута `defer`.

**Добавить `defer` к каждому:**
```html
<!-- БЫЛО -->
<script src="config/static-config.js"></script>
<script src="js/utils/months.js"></script>
<!-- ... и т.д. -->

<!-- СТАТЬ -->
<script src="config/static-config.js" defer></script>
<script src="js/utils/months.js" defer></script>
<!-- ... и т.д. -->
```

**ВАЖНО перед добавлением defer:** проверить, нет ли инлайн-скриптов в `<body>`, которые
вызывают функции из этих файлов до DOMContentLoaded. Если есть — они сломаются.
Grep: `grep -n "<script>" plan_timeline.html` — найти все инлайн-скрипты.

Если все вызовы происходят через `DOMContentLoaded` или `window.onload` — defer безопасен.
Если есть инлайн-вызовы без обёртки — обернуть их в `document.addEventListener('DOMContentLoaded', fn)`.

### 5b. Убрать cache-busting из fetch data.json

js/modules/publish.js:161:
```javascript
// БЫЛО
return fetch('https://deniyashin.github.io/plan_timeline/data.json?v=' + Date.now(), { cache: 'no-cache' })

// СТАТЬ
return fetch('https://deniyashin.github.io/plan_timeline/data.json')
```

Обоснование: GitHub Pages отдаёт корректные Cache-Control заголовки. Timestamp в URL
инвалидирует браузерный кеш при каждом открытии и создаёт новую network-запись в CDN.

**Чеклист верификации Phase 5:**
- [ ] `grep "src=" plan_timeline.html | grep -v "defer"` → 0 результатов (все скрипты имеют defer)
- [ ] `grep "Date.now()\|no-cache" js/modules/publish.js` → 0 результатов
- [ ] Открыть страницу → DevTools Network: data.json загружается с кешем (статус 304 при повторном открытии)
- [ ] Страница загружается корректно (все функции доступны после defer) ✓

---

## Phase 6 — Verification & Regression Checklists

### Регрессия: принцип #7 Long-lasting (scored 3 — НЕ ТРОГАТЬ)

**Fraunces + Geist пара:**
- [ ] `grep "Fraunces" css/*.css` → только в base.css:102 и hero.css:57–64 (шрифт не менялся)
- [ ] `grep "Geist" css/*.css` → только в base.css:72 (шрифт не менялся)
- [ ] Hero-секция: kicker/title/lede иерархия визуально сохранена
- [ ] `.doc-mark` (Fraunces, base.css:101–108) не изменён

**Editorial hero-секция:**
- [ ] `grep "hero-kicker\|hero-lede\|hero h1" css/hero.css` → структура не изменена
- [ ] Открыть страницу → hero-блок выглядит корректно (без layout shifts)

### Регрессия: цветовое кодирование 5 направлений

Директории изменений должны сохранить свои цвета:
- [ ] `grep "#8B2635" css/*.css plan_timeline.html` → присутствует (Направление 1 — красный)
- [ ] `grep "#1E6E7A" css/*.css plan_timeline.html` → присутствует (Направление 2 — бирюзовый)
- [ ] `grep "#B8750A" css/*.css plan_timeline.html` → присутствует (Направление 3 — янтарный)
- [ ] `grep "#2F5233" css/*.css plan_timeline.html` → присутствует (Направление 4 — зелёный)
- [ ] `grep "#2E3A8A" css/*.css plan_timeline.html` → присутствует (Направление 5 — синий)
- [ ] Открыть страницу → цветовые полосы программ отображаются корректно

### Финальный CSS diff audit

После всех фаз:
- [ ] `grep -rn "[0-9]px" css/programs.css | grep "font-size"` → только токены
- [ ] `grep -rn "border-radius: [123]px" css/*.css` → 0 результатов
- [ ] `grep -rn "#[0-9A-Fa-f]\{6\}" css/*.css` → только цвета направлений и семантические статусы
- [ ] Открыть в Chrome DevTools → 0 console errors
- [ ] Проверить responsive (уменьшить окно до 1024px) → hero и timeline не ломаются
- [ ] Проверить режимы brief/detailed/projects/edit — все работают

### Smoke test (ручной)

1. Открыть страницу → загружается без ошибок
2. Переключить все 4 режима → работают корректно
3. Нажать Tab несколько раз → видны focus-кольца (Phase 3b)
4. Hover по кнопкам → disabled-кнопки не реагируют (Phase 3a)
5. Проверить фильтр «Охват» → работает (Phase 4a)
6. Проверить режим редактирования → баннер без «экспорт/импорт» (Phase 2c)
7. Открыть DevTools Network → data.json без ?v= параметра (Phase 5b)

---

## Порядок выполнения фаз

Рекомендованный порядок (каждая фаза — отдельный chat context):

```
Phase 1.1 → Phase 1.2 → Phase 1.3 → Phase 1.4  (всё CSS, один блок)
Phase 2                                            (текстовые правки — быстро)
Phase 3                                            (новые CSS-правила + JS-правки)
Phase 4                                            (терминология + контролы)
Phase 5                                            (network — простые правки)
Phase 6                                            (верификация)
```

Phase 1 — самая объёмная. Если в одном контексте не умещается,
разбить на: 1.1–1.2 (base.css + programs.css) / 1.3–1.4 (hero.css + statuses.css).

**Не выполнять фазы параллельно** — Phase 1.1 меняет токены, которые читают все остальные фазы.
