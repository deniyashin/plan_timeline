# Доска проектного офиса — структура проекта

## Что публикуем на GitHub / GitHub Pages

```
/                              ← корень репозитория
├── plan_timeline.html         ← ГЛАВНАЯ СТРАНИЦА (открывать в браузере)
├── plan_timeline.css          ← все стили (3353 строк, монолит — Task 14: разбить)
├── plan_timeline.js           ← точка входа: flash, openModal, INIT-блок (82 строки)
├── plan_timeline.md           ← документация по контенту проекта
├── plan_timeline_n8n.json     ← workflow для n8n автоматизации
├── data.json                  ← данные публикации (тексты, задачи, статусы, месяцы)
├── index.html                 ← редирект на plan_timeline.html
├── .nojekyll                  ← GitHub Pages: не обрабатывать как Jekyll
│
├── config/
│   └── static-config.js      ← ВСЕ СПРАВОЧНЫЕ ДАННЫЕ (люди, назначения, зависимости)
│
├── js/
│   ├── app.js                 ← заготовка точки входа (для будущего ES-modules)
│   ├── utils/
│   │   ├── months.js          ← MONTHS[], monthKeyFromDomSection(), isValidMonthKey()
│   │   ├── html.js            ← escHtml(), sanitize()
│   │   └── storage.js         ← lsGet(), lsSet(), lsRaw(), lsRawSet()
│   └── modules/
│       ├── filters.js         ← назначения + фильтрация программ (PEOPLE/UNITS/ROLES)
│       ├── modes.js           ← режимы brief/detailed/projects/edit, quick views
│       ├── statuses.js        ← статусы программ (certainty, approval)
│       ├── program-flags.js   ← флаги программ (needs-clar, no-owner) + gatherState
│       ├── search.js          ← поиск + прогресс-бар согласования
│       ├── deps.js            ← карта зависимостей, SVG-граф, навигация по месяцам
│       ├── misc.js            ← закрытие меню, person picker, клики по dep-ссылкам
│       ├── timeline.js        ← renderTimeline(), getProjectMonth(), updateMonthStats()
│       ├── editor.js          ← rich text toolbar, initTextEditing(), setTextEditable()
│       ├── proj-status.js     ← статусы проектов, выбор месяца, комментарии
│       ├── tasks.js           ← renderTasks(), initTasks(), задачи + DnD внутри проекта
│       ├── publish.js         ← doPublish(), loadRemote(), applyData(), updatePubStamp()
│       └── projects.js        ← новые программы/проекты, DnD между месяцами, удаление
│
└── .github/
    └── workflows/deploy.yml   ← автодеплой на GitHub Pages при push в main
```

---

## Что НЕ публикуем (в .gitignore)

```
node_modules/           ← устанавливается при разработке (npm install)
package.json            ← конфиг Node.js (нужен только при разработке)
package-lock.json       ← то же самое
Легаси v1.0 монолит/    ← локальный архив оригинала до рефакторинга
```

---

## Порядок загрузки скриптов (plan_timeline.html)

Важно: каждый скрипт зависит от тех, что выше него.

```
1. config/static-config.js     → window.PLAN_CONFIG (все справочные данные)
2. js/utils/months.js          → глобал MONTHS, monthKeyFromDomSection() и др.
3. js/utils/html.js            → глобал escHtml(), sanitize()
4. js/utils/storage.js         → глобал lsGet(), lsSet() и др.
5. js/modules/filters.js       → window.ASSIGNEES, window.filterState, window.applyFilters
6. js/modules/modes.js         → использует window.ASSIGNEES
7. js/modules/statuses.js      → статусы программ
8. js/modules/program-flags.js → window.gatherState, window.applyState
9. js/modules/search.js        → поиск (использует escHtml)
10. js/modules/deps.js          → window.PLAN_DEPS (для графа)
11. js/modules/misc.js          → использует window.filterState, window.applyFilters
12. js/modules/timeline.js      → window.renderTimeline, window.getProjectMonth
13. js/modules/editor.js        → window.initTextEditing, window.saveTextField
14. js/modules/proj-status.js   → window.injectProjStatuses, window.applyChipStyle
15. js/modules/tasks.js         → window.renderTasks, window.initTasks
16. js/modules/publish.js       → window.doPublish, window.updatePubStamp (нужен window.flash)
17. js/modules/projects.js      → window.applyDeleted, window.initProjectsDnD и др.
18. plan_timeline.js            → определяет window.flash, window.openModal; запускает INIT
```

---

## Как что менять

| Нужно изменить | Файл |
|---|---|
| Кто за что отвечает (назначения ролей) | `config/static-config.js` → `DEFAULT_ASSIGNMENTS` |
| Добавить/убрать сотрудника | `config/static-config.js` → `PEOPLE` |
| Изменить зависимости между программами | `config/static-config.js` → `DEPS` |
| Статусы задач (иконки, названия) | `config/static-config.js` → `TASK_ST` |
| Логика фильтров | `js/modules/filters.js` |
| Режимы (brief/detailed/projects/edit) | `js/modules/modes.js` |
| Поиск | `js/modules/search.js` |
| Граф зависимостей / навигация | `js/modules/deps.js` |
| Задачи (добавление, статусы, DnD) | `js/modules/tasks.js` |
| Редактирование текстов | `js/modules/editor.js` |
| Статусы и месяц проектов | `js/modules/proj-status.js` |
| Создание/удаление программ и проектов | `js/modules/projects.js` |
| Публикация на сервер (n8n webhook) | `js/modules/publish.js` |
| Рендер тайм-лайна | `js/modules/timeline.js` |
| Все стили | `plan_timeline.css` (пока монолит) |
| Данные (тексты, задачи) | `data.json` |

---

## Архитектурные решения

**Почему нет сборщика (webpack/vite)?**
Проект — статический сайт на GitHub Pages. Нет Node.js на сервере, нет build-step.
Модули грузятся через `<script>` теги в правильном порядке.

**Почему глобалы (window.renderTasks и т.д.) вместо ES import/export?**
Переход инкрементальный. Текущий подход: каждый модуль — IIFE, экспортирует
ключевые функции через `window.*`. Следующий шаг: `<script type="module">` +
настоящие `import/export` (для этого уже есть заготовка `js/app.js`).

**Почему `plan_timeline.js` всё ещё существует?**
Содержит только `flash()`, `openModal()`, `closeModal()` и INIT-блок (82 строки).
При переходе на ES modules INIT переедет в `js/app.js` и этот файл исчезнет.

---

## Файлы на пересмотр

| Файл | Статус | Что сделать |
|---|---|---|
| `_editor_block.html` | Устаревший | CSS уже в `plan_timeline.css`, JS перенесён в модули. Можно удалить. |
| `js/app.js` | Заготовка | Документация для будущего ES-modules перехода. Оставить. |
| `plan_timeline.css` | Монолит 3353 строки | Task 14: разбить на `css/*.css` файлы |
