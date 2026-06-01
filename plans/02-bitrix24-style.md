# ТЗ 02: Переход к Bitrix24-стилю

Цель: убрать бежевую палитру, привести editor.css к единой системе токенов.  
Порядок важен — начинай с задачи 1, каждую проверяй в браузере перед переходом к следующей.

---

## Задача 1 — Обновить палитру в `css/base.css`

Открыть `css/base.css`. Заменить значения в блоке `:root` (строки 3–15 и 44):

| Строка | Было | Стало |
|--------|------|-------|
| 3 | `--bg: #F8F5EF;` | `--bg: #F5F7FA;` |
| 4 | `--bg-alt: #F2EDE3;` | `--bg-alt: #F8FAFC;` |
| 5 | `--surface: #FDFBF6;` | `--surface: #FFFFFF;` |
| 6 | `--ink: #1F1D1A;` | `--ink: #172B4D;` |
| 7 | `--ink-muted: #6B655C;` | `--ink-muted: #6B778C;` |
| 8 | `--ink-soft: #8F897E;` | `--ink-soft: #8C98A8;` |
| 9 | `--line: #DDD5C5;` | `--line: #DFE3EA;` |
| 10 | `--line-soft: #E8E1D2;` | `--line-soft: #EDF0F5;` |
| 11 | `--accent: #1F1D1A;` | `--accent: #2FC6F6;` |
| 12 | `--ch-out: #5A554C;` | `--ch-out: #64748B;` |
| 13 | `--radius: 6px;` | `--radius: 10px;` |
| 14 | `--shadow-sm: 0 1px 0 rgba(31,29,26,.04);` | `--shadow-sm: 0 1px 2px rgba(23,43,77,.08);` |
| 15 | `--shadow-md: 0 2px 8px rgba(31,29,26,.06), 0 0 0 1px rgba(31,29,26,.03);` | `--shadow-md: 0 4px 14px rgba(23,43,77,.08);` |
| 39 | `--hover:  #F0EDE6;` | `--hover:  #F0F4FA;` |
| 40 | `--active: #E8E2D8;` | `--active: #E4ECF7;` |
| 44 | `--focus-ring: 0 0 0 2px #B8750A;` | `--focus-ring: 0 0 0 2px #2FC6F6;` |
| 48 | `--shadow-lg: 0 8px 24px rgba(31,29,26,.10);` | `--shadow-lg: 0 8px 24px rgba(23,43,77,.12);` |

**Проверка**: обновить браузер — фон страницы должен стать светло-серым, текст тёмно-синим.

---

## Задача 2 — Убрать хардкод фона навбара в `css/base.css`

Строка 91 в том же файле. Найти:

```css
background: rgba(248, 245, 239, 0.92);
```

Заменить на:

```css
background: rgba(245, 247, 250, 0.92);
```

---

## Задача 3 — `css/editor.css`: модальное окно (строки 4–25)

Заменить в блоке `.po-modal-overlay`, `.po-modal-box`, `.po-modal-title`, `.po-modal-hint`, `.po-modal-input`:

| Было | Стало |
|------|-------|
| `rgba(31,29,26,0.55)` | `rgba(23,43,77,0.55)` |
| `background: #FDFBF6` (строка 11) | `background: var(--surface)` |
| `border: 1px solid #DDD5C5` (строка 11) | `border: 1px solid var(--line)` |
| `color: #1F1D1A` (строка 16) | `color: var(--ink)` |
| `color: #6B655C` (строка 18) | `color: var(--ink-muted)` |
| `border: 1px solid #DDD5C5` (строка 20) | `border: 1px solid var(--line)` |
| `background: #F8F5EF` (строка 22) | `background: var(--bg)` |
| `color: #1F1D1A` (строка 22) | `color: var(--ink)` |
| `border-color: #1F1D1A` (строка 24, :focus) | `border-color: var(--accent)` |

---

## Задача 4 — `css/editor.css`: кнопки модала (строки 27–31)

Блок `.po-btn`, `.po-btn-cancel`, `.po-btn-primary`:

| Было | Стало |
|------|-------|
| `border: 1px solid #DDD5C5` (28) | `border: 1px solid var(--line)` |
| `color: #6B655C` (28) | `color: var(--ink-muted)` |
| `border-color: #1F1D1A` (29, :hover) | `border-color: var(--ink)` |
| `color: #1F1D1A` (29, :hover) | `color: var(--ink)` |
| `background: #1F1D1A` (30) | `background: var(--accent)` |
| `border: 1px solid #1F1D1A` (30) | `border: 1px solid var(--accent)` |
| `color: #FDFBF6` (30) | `color: #FFFFFF` |
| `background: #3A3835` (31, :hover) | `background: #0B8FC9` |

---

## Задача 5 — `css/editor.css`: панель редактирования (строки 34–69)

Блоки `.po-edit-bar`, `.po-btn-pub`, `.po-btn-logout`, `.po-btn-reset`:

| Было | Стало |
|------|-------|
| `background: #1F1D1A` (36, edit-bar) | `background: #172B4D` |
| `background: #2F5233` (52, pub) | `background: var(--status-green-ink)` |
| `border: 1px solid #2F5233` (52, pub) | `border: 1px solid var(--status-green-ink)` |
| `color: #FDFBF6` (52, pub) | `color: #FFFFFF` |
| `background: #3E6B43` (56, pub:hover) | `background: #245228` |
| `border: 1px solid rgba(255,140,100,0.4)` (65, reset) | `border: 1px solid rgba(255,255,255,0.3)` |
| `color: rgba(255,160,120,0.85)` (66, reset) | `color: rgba(255,255,255,0.7)` |
| `border-color: rgba(255,100,60,0.7)` (69, reset:hover) | `border-color: rgba(255,255,255,0.6)` |
| `color: #ffb090` (69, reset:hover) | `color: #FFFFFF` |

---

## Задача 6 — `css/editor.css`: rich text тулбар (строки 72–93)

Блоки `#po-rt-bar`, `#po-rt-bar::after`:

| Было | Стало |
|------|-------|
| `background: #1F1D1A` (74) | `background: #172B4D` |
| `border-top-color: #1F1D1A` (81, стрелка) | `border-top-color: #172B4D` |

Строки 83–93 (`.po-rt-btn`) — оставить без изменений (белый текст на тёмном фоне нормальный).

---

## Задача 7 — `css/editor.css`: редактируемые поля (строки 95–111)

Блок `body[data-mode="edit"] .po-editable`:

| Было | Стало |
|------|-------|
| `outline: 1px dashed #C8BFB0` (97) | `outline: 1px dashed var(--line)` |
| `outline-color: #8F897E` (100, :hover) | `outline-color: var(--ink-soft)` |
| `color: #8F897E` (104, ::before placeholder) | `color: var(--ink-soft)` |

---

## Задача 8 — `css/editor.css`: строка статуса проекта (строки 113–144)

Блоки `.po-proj-status-row`, `.po-proj-status-label`, `.po-proj-owner-btn`, `.po-proj-owner-av`:

| Было | Стало |
|------|-------|
| `border-bottom: 1px solid #E8E1D2` (116) | `border-bottom: 1px solid var(--line-soft)` |
| `background: #FDFBF6` (116) | `background: var(--surface)` |
| `color: #8F897E` (121, label) | `color: var(--ink-soft)` |
| `color: #8F897E` (134, owner-btn) | `color: var(--ink-soft)` |
| `background: #F0EDE6` (137, owner-btn:hover) | `background: var(--hover)` |
| `background: #E8E2D8` (139, owner-av) | `background: var(--active)` |
| `color: #6B6560` (139, owner-av) | `color: var(--ink-muted)` |

---

## Задача 9 — `css/editor.css`: таск-список — статусы и дропдаун (строки 146–182)

Блоки `.po-task-section`, `.po-task-cb`, `.po-task-st-drop`, `.po-task-st-opt`:

| Было | Стало |
|------|-------|
| `border-top: 1px dashed #E8E1D2` (147) | `border-top: 1px dashed var(--line-soft)` |
| `color: #8F897E` (150, section-head) | `color: var(--ink-soft)` |
| `background: #ECEAE7` (159, task-cb default) | `background: var(--avatar-person-bg)` |
| `color: #6B6560` (159, task-cb default) | `color: var(--avatar-person-ink)` |
| `background: #FDFBF6` (173, st-drop) | `background: var(--surface)` |
| `border: 1px solid #DDD5C5` (173, st-drop) | `border: 1px solid var(--line)` |
| `color: #1F1D1A` (179, st-opt) | `color: var(--ink)` |
| `background: #F0EDE6` (181, st-opt:hover) | `background: var(--hover)` |
| `background: #E8E2D8` (182, st-opt.current) | `background: var(--active)` |

---

## Задача 10 — `css/editor.css`: кнопки добавления (строки 185–201)

Блоки `.po-add-proj-btn`, `.po-add-prog-btn`:

| Было | Стало |
|------|-------|
| `border: 1px dashed #C5BBAD` (187) | `border: 1px dashed var(--line)` |
| `color: #8F897E` (188, add-proj) | `color: var(--ink-soft)` |
| `background: #F5F1EA` (191, :hover) | `background: var(--hover)` |
| `border-color: #8F897E` (191, :hover) | `border-color: var(--ink-soft)` |
| `color: #1F1D1A` (191, :hover) | `color: var(--ink)` |
| `border: 1px dashed #B8A898` (196) | `border: 1px dashed var(--line)` |
| `color: #8F897E` (197, add-prog) | `color: var(--ink-soft)` |
| `background: #F5F1EA` (200, :hover) | `background: var(--hover)` |
| `border-color: #6B6560` (200, :hover) | `border-color: var(--ink-muted)` |
| `color: #1F1D1A` (200, :hover) | `color: var(--ink)` |

---

## Задача 11 — `css/editor.css`: модал нового проекта (строки 203–236)

Блоки `.po-newproj-modal`, `.po-newproj-box`, `.po-newproj-title`, `.po-newproj-field`, `.po-newproj-cancel`, `.po-newproj-confirm`:

| Было | Стало |
|------|-------|
| `rgba(31,29,26,0.48)` (205) | `rgba(23,43,77,0.55)` |
| `background: #FDFBF6` (209) | `background: var(--surface)` |
| `color: #1F1D1A` (215, title) | `color: var(--ink)` |
| `color: #8F897E` (219, label) | `color: var(--ink-soft)` |
| `border: 1px solid #DDD5C5` (222, input) | `border: 1px solid var(--line)` |
| `background: #FDFBF6` (223, input) | `background: var(--surface)` |
| `color: #1F1D1A` (223, input) | `color: var(--ink)` |
| `border-color: #8F897E` (225, input:focus) | `border-color: var(--accent)` |
| `border: 1px solid #DDD5C5` (228, cancel) | `border: 1px solid var(--line)` |
| `color: #6B6560` (229, cancel) | `color: var(--ink-muted)` |
| `border-color: #8F897E` (231, cancel:hover) | `border-color: var(--ink-muted)` |
| `background: #1F1D1A` (233, confirm) | `background: var(--accent)` |
| `color: #FDFBF6` (234, confirm) | `color: #FFFFFF` |
| `background: #3A3630` (236, confirm:hover) | `background: #0B8FC9` |

---

## Задача 12 — `css/editor.css`: таск-детали (строки 237–291)

Блоки `.po-task-id-line`, `.po-task-updated`, `.po-task-text`, `.po-task-asgn-*`, `.po-task-due-btn`, `.po-task-del`, `.po-task-add`:

| Было | Стало |
|------|-------|
| `color: #8F897E` (240, id-line) | `color: var(--ink-soft)` |
| `color: #B0A898` (245, updated) | `color: var(--ink-soft)` |
| `color: #1F1D1A` (249, task-text) | `color: var(--ink)` |
| `color: #8F897E` (252, done text) | `color: var(--ink-soft)` |
| `color: #8F897E` (258, asgn-btn) | `color: var(--ink-soft)` |
| `background: #F0EDE6` (261, asgn-btn:hover) | `background: var(--hover)` |
| `background: #E8E2D8` (263, asgn-av) | `background: var(--active)` |
| `color: #6B6560` (263, asgn-av) | `color: var(--ink-muted)` |
| `color: #8F897E` (267, asgn-nm) | `color: var(--ink-soft)` |
| `color: #C8BFB0` (268, asgn-nm.ph) | `color: var(--line)` |
| `color: #8F897E` (272, due-btn) | `color: var(--ink-soft)` |
| `background: #F0EDE6` (275, due-btn:hover) | `background: var(--hover)` |
| `color: #C8BFB0` (276, due-btn.ph) | `color: var(--line)` |
| `color: #8F897E` (283, task-del on hover) | `color: var(--ink-soft)` |
| `color: #6B655C` (286, task-add) | `color: var(--ink-muted)` |
| `border: 1px dashed #DDD5C5` (287, task-add) | `border: 1px dashed var(--line)` |
| `border-color: #1F1D1A` (290, task-add:hover) | `border-color: var(--ink)` |
| `color: #1F1D1A` (290, task-add:hover) | `color: var(--ink)` |

---

## Задача 13 — `css/editor.css`: мелочи (строки 293–304)

Блоки `.po-prog-lbl`, `.po-proj-prog-lbl`, `.po-edit-bar-label`:

| Было | Стало |
|------|-------|
| `color: #8F897E` (299, prog-lbl) | `color: var(--ink-soft)` |
| `color: #8F897E` (303, proj-prog-lbl) | `color: var(--ink-soft)` |

---

## Задача 14 — `css/statuses.css`: оставшиеся хардкоды

Открыть `css/statuses.css`. Найти и заменить:

| Было | Стало |
|------|-------|
| `#E8C2C8` | `var(--status-red-bg)` |
| `#ECD8A8` | `var(--status-amber-bg)` |

Значения `#E8EAF6`, `#3F51B5`, `#C5CAE9` — это флаг «требует декомпозиции» (индиго). Оставить без изменений — отдельный смысловой цвет.

---

## Задача 15 — `css/search.css`: исправить outline:none

Открыть `css/search.css`. Найти строку ~70 с `outline: none`. Добавить сразу после:

```css
.элемент:focus-visible { box-shadow: var(--focus-ring); }
```

где `элемент` — тот же селектор, что стоит перед `outline: none`.

---

## Проверка после всех задач

После задачи 1 — обновить браузер, убедиться что фон серый, текст тёмно-синий.  
После задачи 13 — открыть модал «Создать проект», убедиться что все поля и кнопки выглядят единообразно.  
После задачи 14 — посмотреть на статусные бейджи программ.

Если что-то сломалось — проверить в DevTools что CSS-переменная существует в `:root` (Задача 1 должна быть выполнена первой).
