# Доска проектного офиса

Сайт на VPS (po.dfprod.ru). Таймлайн программ и проектов медицинской компании: 5 направлений изменений, 38 программ, 212 проектов, сроки по месяцам 2026–2027.

**Нет сборщика (webpack/vite)** — скрипты грузятся через `<script>` теги. Деплой: push в `main` → GitHub Actions → rsync на VPS.

## Стек

- Vanilla JS (IIFE-модули, глобалы через `window.*`)
- HTML5 + CSS3 (нет фреймворков)
- Node.js сервер (`server.js`, порт 3002) — статика + POST `/api/save` для публикации

## Структура

```
plan_timeline.html      ← единственная страница (221 строк)
plan_timeline.js        ← точка входа: flash(), openModal(), INIT (91 строк)
plan_timeline.css       ← все стили (монолит — Task: разбить на css/*.css)
data.json               ← данные: тексты, задачи, статусы, месяцы проектов

config/
  static-config.js      ← справочники: PEOPLE (22 чел.), UNITS, ROLES, DEPS, TASK_ST

js/utils/
  storage.js            ← lsGet(), lsSet(), lsRaw(), lsRawSet()
  html.js               ← escHtml(), sanitize()
  months.js             ← MONTHS[], monthKeyFromDomSection(), isValidMonthKey()

js/modules/             ← feature-based, каждый за одну область
  filters.js            ← назначения (anchor/owner/methodologist) + фильтрация
  modes.js              ← режимы brief/detailed/projects/edit + quick views
  statuses.js           ← статусы программ (certainty, approval)
  program-flags.js      ← флаги программ + gatherState()/applyState()
  search.js             ← поиск по документу + прогресс-бар согласования
  deps.js               ← SVG-граф зависимостей между программами
  misc.js               ← закрытие меню, person picker, dep-ссылки
  timeline.js           ← renderTimeline(), getProjectMonth(), updateMonthStats()
  editor.js             ← rich text toolbar, initTextEditing(), saveTextField()
  proj-status.js        ← статусы/месяц/комментарии проектов
  tasks.js              ← renderTasks(), initTasks(), DnD задач внутри проекта
  publish.js            ← doPublish(), loadRemote(), applyData()
  projects.js           ← создание/удаление программ и проектов, DnD между месяцами
```

## Порядок загрузки скриптов (важно — каждый зависит от предыдущих)

```
1. config/static-config.js  → window.PLAN_CONFIG
2. js/utils/months.js
3. js/utils/html.js
4. js/utils/storage.js
5–17. js/modules/* (в порядке как в HTML)
18. plan_timeline.js        → INIT
```

## Часто нужные файлы

| Задача | Файл |
|---|---|
| Добавить сотрудника | `config/static-config.js` → `PEOPLE` |
| Изменить назначения ролей | `config/static-config.js` → `DEFAULT_ASSIGNMENTS` |
| Изменить зависимости программ | `config/static-config.js` → `DEPS` |
| Статусы задач (иконки) | `config/static-config.js` → `TASK_ST` |
| Логика фильтров | `js/modules/filters.js` |
| Задачи (создание, DnD) | `js/modules/tasks.js` |
| Создание/удаление проектов | `js/modules/projects.js` |
| Публикация (POST /api/save) | `js/modules/publish.js` |
| Стили | `plan_timeline.css` (пока монолит, задача: разбить) |
| Тексты, данные | `data.json` |

## Архитектурные ограничения

- Нет `import/export` — все функции через `window.*`. Переход на ES modules запланирован (`js/app.js` — заготовка).
- Нет TypeScript, нет тестов — статический сайт.
- `plan_timeline.html` содержит весь HTML контент (программы, проекты) — не генерируется JS.
- localStorage используется для хранения несохранённых изменений между публикациями.

## Данные и публикация

- `data.json` — эталонный источник данных (задачи, статусы проектов, месяцы)
- При публикации: собирается состояние из DOM + localStorage → POST `/api/save` с Bearer-токеном → сервер записывает в `data.json`
- При загрузке страницы: `data.json` загружается и применяется поверх HTML

## Размеры модулей (для понимания объёма задачи)

| Файл | Строк |
|---|---|
| projects.js | 685 |
| tasks.js | 509 |
| filters.js | 420 |
| deps.js | 319 |
| proj-status.js | 270 |
| search.js | 251 |
| modes.js | 233 |
| static-config.js | 206 |
| timeline.js | 181 |
| editor.js | 175 |
| publish.js | 171 |
| misc.js | 153 |
| statuses.js | 82 |
| program-flags.js | 77 |
