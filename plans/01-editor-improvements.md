# План: Исправление редактора plan_timeline

**Версия:** 2026-06-03  
**Источник:** ТЗ `tz_plan_timeline_editor_improvements_2026_06_03.txt`  
**Репозиторий:** https://github.com/deniyashin/plan_timeline  

---

## Фаза 0: Результаты исследования кода

### Найденные файлы и функции

| Задача | Файл | Строки | Функция |
|--------|------|--------|---------|
| Фильтр "Очистить" | `js/modules/filters.js` | 425–428 | обработчик `#filter-reset` |
| Визуал кнопки Человек | `js/modules/misc.js` | 93–112 | `updateTrigger()` |
| Публикация | `js/modules/publish.js` | 29–38 | `collectState()` |
| Применение данных | `js/modules/publish.js` | 87–158 | `applyData()` |
| Добавление проекта | `js/modules/projects.js` | 289, 308 | `_openNpModal()`, `_confirmNp()` |
| Справочник людей | `js/modules/people-editor.js` | 95, 97 | сохранение → localStorage → reload |
| Применение overrides | `config/static-config.js` | 212–222 | IIFE при загрузке |

### LocalStorage ключи

| Ключ | Модуль | Включён в collectState()? |
|------|--------|--------------------------|
| `po-texts` | projects.js | ✅ да |
| `po-tasks` | projects.js | ✅ да |
| `po-proj-statuses` | projects.js | ✅ да |
| `plan-timeline-statuses-v1` | program-flags.js | ✅ да |
| `po-project-months-v1` | projects.js | ✅ да |
| `po-new-projects` | projects.js | ❌ **НЕТ** |
| `po-new-programs` | projects.js | ❌ **НЕТ** |
| `po-prog-months` | projects.js | ❌ **НЕТ** |
| `po-deleted` | projects.js | ❌ **НЕТ** |
| `po-people-overrides` | people-editor.js | ❌ **НЕТ** |
| `plan-timeline-assignments-v2` | filters.js | ✅ да |

### Корень всех проблем

`collectState()` собирает только часть данных. `applyData()` не умеет восстанавливать новые проекты и справочник людей из удалённых данных. Обработчик "Очистить фильтры" сбрасывает внутреннее состояние, но не вызывает функцию обновления визуала кнопки person picker.

---

## Фаза 1: Исправление сброса фильтра "Человек"

**Цель:** После нажатия "Очистить фильтры" кнопка Человека визуально возвращается в нейтральное состояние.

### 1.1 Экспортировать updateTrigger из misc.js

**Файл:** `js/modules/misc.js`

Найти функцию `updateTrigger()` (строки 93–112). В конце IIFE этого модуля (или после определения функции) добавить:

```js
window.resetPersonPickerUI = function () {
  updateTrigger();
};
```

> Функция уже читает `window.filterState.persons` — если массив пуст, она сама покажет нейтральное состояние.

### 1.2 Вызвать resetPersonPickerUI из filter-reset обработчика

**Файл:** `js/modules/filters.js`, строки 425–428

Текущий код:
```js
document.getElementById('filter-reset').addEventListener('click', () => {
  state.change = null; state.contour = null; state.source = null; state.persons = []; state.role = 'any';
  applyFilters();
});
```

Заменить на:
```js
document.getElementById('filter-reset').addEventListener('click', () => {
  state.change = null; state.contour = null; state.source = null; state.persons = []; state.role = 'any';
  applyFilters();
  if (typeof window.resetPersonPickerUI === 'function') window.resetPersonPickerUI();
});
```

### 1.3 Проверка идемпотентности

Убедиться, что `updateTrigger()` корректно работает при пустом `state.persons = []`:
- `avatar.textContent` = дефолтный текст (обычно `'?'` или иконка)
- `label.textContent` = `'Человек'`
- `trigger.classList.remove('filter-on')`
- `trigger.setAttribute('aria-pressed', 'false')`

Если логика в `updateTrigger` обрабатывает только `persons.length > 0` — добавить ветку для пустого массива.

### Верификация фазы 1

```
1. Выбрать человека в фильтре "Человек"
2. Убедиться что кнопка синяя с инициалами
3. Нажать "Очистить фильтры"
4. Ожидаемо: кнопка белая с текстом "? Человек"
5. DOM: aria-pressed=false, нет класса .filter-on
```

---

## Фаза 2: Справочник людей — синхронизация через publish

**Цель:** Изменения справочника сотрудников попадают в публикуемый JSON и восстанавливаются через `applyData()` у всех пользователей после перезагрузки.

### 2.1 Добавить people в collectState()

**Файл:** `js/modules/publish.js`, функция `collectState()` (строки 29–38)

```js
function collectState() {
  var progStatuses = {};
  try { progStatuses = JSON.parse(localStorage.getItem('plan-timeline-statuses-v1') || '{}'); } catch (e) {}

  // Справочник людей: overrides из localStorage, или текущий PLAN_CONFIG.PEOPLE
  var peopleOverrides = null;
  try {
    var raw = localStorage.getItem('po-people-overrides');
    peopleOverrides = raw ? JSON.parse(raw) : null;
  } catch (e) {}

  return {
    texts: lsGet(LS_TEXTS),
    tasks: lsGet(LS_TASKS),
    projStatuses: lsGet(LS_PSTAT),
    progStatuses: progStatuses,
    projectMonths: lsGet('po-project-months-v1'),
    people: peopleOverrides || window.PLAN_CONFIG.PEOPLE,
    publishedAt: new Date().toISOString()
  };
}
```

### 2.2 Применять people в applyData()

**Файл:** `js/modules/publish.js`, функция `applyData()` (строки 87–158)

В начале `applyData(d)` добавить блок:

```js
// Обновить справочник людей
if (d.people && typeof d.people === 'object' && !Array.isArray(d.people)) {
  window.PLAN_CONFIG.PEOPLE = d.people;
  // Сохранить в localStorage чтобы static-config подхватил при следующей загрузке
  try { localStorage.setItem('po-people-overrides', JSON.stringify(d.people)); } catch (e) {}
  // Обновить все views если функция зарегистрирована
  if (typeof window.refreshPeopleViews === 'function') window.refreshPeopleViews();
}
```

### 2.3 Создать refreshPeopleViews()

Собрать в отдельную функцию (добавить в `plan_timeline.js` или в `js/modules/misc.js`) обновление всех мест, читающих PEOPLE/ASSIGNEES:

```js
window.refreshPeopleViews = function () {
  // Пересинхронизировать алиас
  window.ASSIGNEES = window.PLAN_CONFIG.PEOPLE;

  // Перерисовать фильтр-дропдаун людей (если функция есть в filters.js)
  if (typeof window.rebuildPersonDropdown === 'function') window.rebuildPersonDropdown();

  // Обновить бейджи ролей в шапках программ
  document.querySelectorAll('[data-role-badge]').forEach(function (el) {
    var code = el.dataset.roleBadge;
    var p = window.ASSIGNEES[code];
    if (p) {
      el.textContent = p.initials || code;
      el.title = (p.full || p.last || code) + (p.role ? ' — ' + p.role : '');
    }
  });

  // Обновить person picker trigger
  if (typeof window.resetPersonPickerUI === 'function') window.resetPersonPickerUI();
};
```

> **Примечание:** Конкретные селекторы `[data-role-badge]` нужно уточнить по реальной HTML-разметке.
> Если бейджи не имеют data-атрибутов — ориентироваться на классы/структуру из `filters.js:68-84`.

### 2.4 Запретить редактирование кода сотрудника

**Файл:** `js/modules/people-editor.js`

В функции рендеринга строки таблицы найти поле ввода для кода (технического ID) и добавить `readonly`:

```js
// Было:
'<td><input type="text" value="' + escHtml(code) + '" data-field="code"></td>'

// Стало:
'<td><input type="text" value="' + escHtml(code) + '" readonly style="background:#f0f0f0;cursor:not-allowed" title="Код сотрудника нельзя изменять"></td>'
```

### Верификация фазы 2

```
1. Войти в режим редактирования
2. Открыть справочник сотрудников
3. Изменить фамилию сотрудника (например, код OS)
4. Убедиться, что поле кода недоступно для ввода
5. Нажать "Сохранить" в справочнике
6. Нажать "Опубликовать"
7. Открыть страницу в другом браузере / инкогнито
8. Ожидаемо: новая фамилия отображается в фильтрах, бейджах, тултипах
9. Перезагрузить первый браузер — фамилия сохранилась
```

---

## Фаза 3: Новые проекты — включить в publish

**Цель:** Проект, добавленный через "Добавить проект", после нажатия "Опубликовать" сохраняется в data.json и виден всем пользователям.

### 3.1 Добавить новые проекты в collectState()

**Файл:** `js/modules/publish.js`, функция `collectState()`

```js
return {
  texts: lsGet(LS_TEXTS),
  tasks: lsGet(LS_TASKS),
  projStatuses: lsGet(LS_PSTAT),
  progStatuses: progStatuses,
  projectMonths: lsGet('po-project-months-v1'),
  people: peopleOverrides || window.PLAN_CONFIG.PEOPLE,
  newProjects: lsGet('po-new-projects') || {},   // { progId: [{id, name, contour, source}] }
  newPrograms: lsGet('po-new-programs') || {},   // если используется
  deletedItems: lsGet('po-deleted') || [],       // если используется
  publishedAt: new Date().toISOString()
};
```

> `lsGet` возвращает объект из localStorage (через `JSON.parse`) — убедиться что ключи совпадают с теми, что используются в `projects.js`.

### 3.2 Восстанавливать новые проекты в applyData()

**Файл:** `js/modules/publish.js`, функция `applyData(d)`

После блока people, добавить:

```js
// Восстановить новые проекты из удалённых данных
if (d.newProjects && typeof d.newProjects === 'object') {
  // Сохранить в localStorage чтобы restoreNewProjects() подхватил
  try { localStorage.setItem('po-new-projects', JSON.stringify(d.newProjects)); } catch (e) {}
  // Восстановить DOM (функция из projects.js)
  if (typeof window.restoreNewProjects === 'function') window.restoreNewProjects();
}
```

### 3.3 Экспортировать restoreNewProjects из projects.js

**Файл:** `js/modules/projects.js`

Найти функцию `restoreNewProjects()` (строка ~239) и убедиться, что она экспортирована:

```js
window.restoreNewProjects = restoreNewProjects; // добавить если отсутствует
```

> Важно: `restoreNewProjects()` не должна дважды добавлять один и тот же проект. Добавить проверку: перед созданием DOM-элемента проверить `document.getElementById(id)`.

### 3.4 Очистка устаревших черновиков при загрузке

**Файл:** `js/modules/projects.js`, в начале `restoreNewProjects()` или сразу после `applyData()`

Логика: после загрузки удалённых данных удалить из `po-new-projects` те проекты, ID которых уже присутствуют в DOM (они теперь "официальные"):

```js
function cleanStaleDrafts() {
  var np = getNewProjects();  // читает po-new-projects
  var changed = false;
  Object.keys(np).forEach(function (progId) {
    np[progId] = (np[progId] || []).filter(function (proj) {
      var inDOM = !!document.getElementById(proj.id);
      if (inDOM) changed = true;
      return !inDOM; // оставить только те, которых НЕТ в DOM
    });
    if (np[progId].length === 0) delete np[progId];
  });
  if (changed) saveNewProjects(np);
}
```

Вызвать `cleanStaleDrafts()` после завершения `applyData()`.

### 3.5 Проверить автогенерацию ID

**Файл:** `js/modules/projects.js`, строки ~289-308 (`_openNpModal`)

Проверить что:
- Базовая часть ID берётся из `data-prog` атрибута родительского элемента программы
- Контур (contour) наследуется из программы (атрибут `data-contour` на элементе программы)
- Месяц наследуется из программы (атрибут или текущий контекст месяца)
- Подбирается следующий свободный N, не конфликтующий с существующими проектами в DOM и в localStorage

Если ID берётся не как `U-CCT-PR-3.7.N`, а по другой схеме — оставить текущую схему, только убедиться что нет дублей.

### 3.6 Защита от дублей в confirmNp

**Файл:** `js/modules/projects.js`, функция `_confirmNp()` (строка ~308)

Перед добавлением проекта:

```js
// Проверить что ID не занят
if (document.getElementById(id)) {
  alert('Проект с ID ' + id + ' уже существует. Выберите другой ID.');
  return;
}
```

### Верификация фазы 3

```
1. Войти в режим редактирования → режим "Подробно"
2. В нужной программе нажать "Добавить проект"
3. Проверить автозаполнение: ID, контур, месяц, программа
4. Заполнить название проекта
5. Нажать "Опубликовать"
6. Обновить страницу — проект остался
7. Открыть страницу в другом браузере — проект виден
8. Счётчики программ/проектов увеличились
9. Проект виден в поиске, фильтрах, режимах "Проекты" и "Редактирование"
```

---

## Фаза 4: Очистка старых черновиков (одноразовая)

**Цель:** При первом открытии после деплоя удалить устаревшие черновики из предыдущих неудачных попыток добавления проектов.

### 4.1 Миграция localStorage при инициализации

**Файл:** `plan_timeline.js` (точка входа) или в начале `js/modules/projects.js`

После загрузки страницы и применения удалённых данных, вызвать `cleanStaleDrafts()` (из фазы 3.4).

Дополнительно: если в `po-new-projects` есть проекты с ID, которых нет в DOM И нет в удалённых данных — это действительно устаревшие черновики, удалить.

```js
// Версионирование очистки чтобы не запускать повторно
var CLEANUP_VERSION = 'v1-2026-06-03';
if (localStorage.getItem('po-cleanup-done') !== CLEANUP_VERSION) {
  cleanStaleDrafts();
  localStorage.setItem('po-cleanup-done', CLEANUP_VERSION);
}
```

### Верификация фазы 4

```
1. Вручную добавить что-то в po-new-projects в DevTools
2. Обновить страницу
3. Ожидаемо: черновик без соответствующего DOM-элемента удалён из localStorage
4. Реальные опубликованные данные не затронуты
```

---

## Фаза 5: Регрессионная проверка

После всех изменений вручную проверить:

```
□ Режим "Краткий" — всё отображается
□ Режим "Подробно" — всё отображается
□ Режим "Проекты" — всё отображается
□ Режим "Редактирование" — всё отображается
□ Фильтр по изменению — работает
□ Фильтр по контуру — работает
□ Фильтр по роли — работает
□ Фильтр по Человеку — выбор и сброс работают
□ Быстрые выборки — работают
□ Поиск — работает
□ Сворачивание/разворачивание программ — работает
□ Карта зависимостей — открывается
□ Публикация — отправляет на webhook
□ Загрузка удалённых данных — применяется
□ Счётчики — корректны
□ Добавление задачи — работает
□ DnD задач — работает
□ Статусы проектов — сохраняются
```

---

## Критерии готовности

1. ✅ Изменение сотрудника через справочник после публикации отображается везде и сохраняется после перезагрузки.
2. ✅ Технический код сотрудника нельзя изменить в обычном редакторе.
3. ✅ Новый проект, добавленный через "Добавить проект", получает корректный ID, контур, месяц и родительскую программу.
4. ✅ Новый проект после "Опубликовать" не пропадает после закрытия вкладки и виден другим пользователям после публикации общей модели данных.
5. ✅ Старые локальные черновики добавленных проектов очищены и не мешают работе.
6. ✅ Общая кнопка "Очистить фильтры" полностью сбрасывает фильтр по человеку: и внутреннее состояние, и визуальный вид.
7. ✅ После сброса фильтра кнопка выглядит как нейтральная белая кнопка "? Человек", а не как синяя выбранная.
8. ✅ Все изменения реализованы через исправление модели данных, рендеринга и публикации, а не через точечные правки HTML.

---

## Порядок выполнения (рекомендуемый)

```
Фаза 1 → Фаза 2 → Фаза 3 → Фаза 4 → Фаза 5
```

Каждую фазу можно выполнять и проверять независимо. Фазы 1 и 2 не зависят друг от друга и могут быть реализованы параллельно.

**Наиболее рискованная** — Фаза 3 (затрагивает `collectState()`, `applyData()`, `restoreNewProjects()`). Рекомендуется сначала задеплоить Фазы 1–2, убедиться в отсутствии регрессий, затем внедрить Фазу 3.
