# План: Git-деплой + бекенд-публикация

## Контекст

**Текущее состояние:**
- Код: локальный git → GitHub (github.com/deniyashin/plan_timeline)
- Сайт: `https://po.dfprod.ru` (VPS, Node.js, `/home/dev/projects/po-board/`)
- Публикация данных: `POST` на n8n webhook `noslosnodeyim.beget.app` → сохраняет `data.json` на GitHub Pages
- Загрузка данных: `fetch('https://deniyashin.github.io/plan_timeline/data.json')`
- server.js: только статика, нет API-эндпоинтов

**Целевое состояние:**
- Код: `git push main` → GitHub Actions → SSH-деплой на сервер (без n8n, без GitHub Pages в цепочке)
- Публикация данных: UI → `POST /api/save` на po.dfprod.ru → пишет `public/data.json` на сервере
- Загрузка данных: `fetch('/data.json')` — относительный URL, тот же сервер
- server.js: статика + `/api/save` эндпоинт с авторизацией по секрету

**Два независимых потока:**
```
Код (HTML/JS/CSS)  →  git commit + push  →  GitHub Actions  →  scp на сервер
Данные (data.json) →  Кнопка "Опубликовать" в UI  →  POST /api/save  →  data.json на сервере
```

---

## Phase 0: Сбор фактов (выполнен)

**Источники данных:**
- `js/modules/publish.js` — строки 10, 62–93, 188–203
- `server.js` на сервере `/home/dev/projects/po-board/server.js`

**Ключевые находки:**

| Факт | Значение |
|---|---|
| Текущий WEBHOOK | `https://noslosnodeyim.beget.app/webhook/plan_timeline` |
| Текущий loadRemote URL | `https://deniyashin.github.io/plan_timeline/data.json` |
| Формат запроса публикации | `POST {password, data: collectState()}` |
| Формат ответа n8n | `{error?}` — достаточно `{ok: true}` |
| server.js сейчас | Только статика, ~30 строк, нет роутинга для POST |
| data.json путь на сервере | `/home/dev/projects/po-board/public/data.json` |
| SSH ключ | `~/.ssh/dfprod_dev` (OpenSSH format) |
| Сервер | `dev@176.12.66.250`, порт 3002, PM2 процесс `po-board` |

**Что менять в publish.js:**
- `WEBHOOK` → `/api/save` (относительный URL)
- `loadRemote` fetch URL → `/data.json`
- Авторизация: вместо `{password}` в теле — заголовок `Authorization: Bearer <SECRET>`

---

## Phase 1: GitHub Actions — автодеплой кода

**Что делаем:** при `git push` в ветку `main` автоматически копируем файлы на сервер через SSH.

### 1.1 Добавить SSH ключ в GitHub Secrets

В репозитории GitHub → Settings → Secrets → Actions → New repository secret:

| Secret | Значение |
|---|---|
| `SSH_PRIVATE_KEY` | содержимое файла `~/.ssh/dfprod_dev` |
| `SSH_HOST` | `176.12.66.250` |
| `SSH_USER` | `dev` |
| `DEPLOY_PATH` | `/home/dev/projects/po-board/public` |

### 1.2 Создать `.github/workflows/deploy.yml`

```yaml
name: Deploy to po.dfprod.ru

on:
  push:
    branches: [main]
    paths-ignore:
      - 'plans/**'
      - '*.md'
      - 'deploy.ps1'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy files
        run: |
          rsync -avz --delete \
            --exclude='.git' \
            --exclude='plans/' \
            --exclude='*.md' \
            --exclude='deploy.ps1' \
            --exclude='.github/' \
            --exclude='.claude/' \
            --exclude='data.json' \
            -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no" \
            ./ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:${{ secrets.DEPLOY_PATH }}/
```

**Важно:** `data.json` в `--exclude` — данные живут только на сервере, git их не перетирает.

### Проверка Phase 1:
- `git push` запускает Action (вкладка Actions на GitHub)
- Action завершается с зелёной галочкой
- Изменённый файл появляется на po.dfprod.ru

---

## Phase 2: Бекенд — эндпоинт `/api/save` в server.js

**Что делаем:** добавляем в server.js обработку `POST /api/save` с проверкой секрета и записью `data.json`.

### 2.1 Секрет авторизации

Создать на сервере файл `/home/dev/projects/po-board/.env`:
```
SAVE_SECRET=<придумать строку, например uuid>
```

server.js уже читает `.env` по паттерну — нет, он не читает. Добавить чтение.

### 2.2 Изменения в server.js

Добавить **в начало** (после констант PORT/PUBLIC_DIR):
```js
// Читаем .env
try {
  require('fs').readFileSync(path.join(__dirname, '.env'), 'utf8')
    .split('\n').forEach(function(line) {
      var m = line.match(/^([A-Z0-9_]+)=(.+)$/);
      if (m) process.env[m[1]] = m[2].trim();
    });
} catch(e) {}

var SAVE_SECRET = process.env.SAVE_SECRET || '';
var DATA_PATH   = path.join(PUBLIC_DIR, 'data.json');
```

Добавить **в начало http.createServer handler** (до статики):
```js
// POST /api/save
if (req.method === 'POST' && urlPath === '/api/save') {
  var auth = req.headers['authorization'] || '';
  if (!SAVE_SECRET || auth !== 'Bearer ' + SAVE_SECRET) {
    res.writeHead(401, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({error: 'Unauthorized'}));
  }
  var body = '';
  req.on('data', function(chunk) { body += chunk; });
  req.on('end', function() {
    try {
      var parsed = JSON.parse(body);
      fs.writeFile(DATA_PATH, JSON.stringify(parsed, null, 2), function(err) {
        if (err) {
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: err.message}));
        } else {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ok: true, publishedAt: parsed.publishedAt || new Date().toISOString()}));
        }
      });
    } catch(e) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Invalid JSON'}));
    }
  });
  return;
}
```

### 2.3 Перезапустить PM2 после изменения server.js
```bash
ssh -i ~/.ssh/dfprod_dev dev@176.12.66.250 \
  "export PATH=\$HOME/.local/bin:\$PATH; pm2 restart po-board"
```

### Проверка Phase 2:
```bash
# Проверка без секрета → 401
curl -X POST https://po.dfprod.ru/api/save -d '{}' -w '\n%{http_code}'

# Проверка с секретом → 200 {"ok":true}
curl -X POST https://po.dfprod.ru/api/save \
  -H "Authorization: Bearer <SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"test":true}' -w '\n%{http_code}'
```

---

## Phase 3: Фронтенд — обновить publish.js

**Что делаем:** заменить n8n webhook и GitHub Pages URL на наш сервер. Секрет хранить в localStorage (один раз вводится, запоминается).

### 3.1 Изменить константы в `js/modules/publish.js`

```js
// Было:
var WEBHOOK = 'https://noslosnodeyim.beget.app/webhook/plan_timeline';

// Стало:
var WEBHOOK = '/api/save';
```

### 3.2 Изменить `doPublish()` — авторизация через заголовок

```js
function doPublish() {
  var pwd = pubInp.value;
  if (!pwd) { pubErr.textContent = 'Введите секрет'; return; }
  // Запоминаем секрет в localStorage чтобы не вводить каждый раз
  try { localStorage.setItem('po-save-secret', pwd); } catch(e) {}
  closeModal('po-pub-modal');
  var btn = document.getElementById('po-btn-pub');
  btn.disabled = true; btn.textContent = 'Публикация...';
  fetch(WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + pwd
    },
    body: JSON.stringify(collectState())   // ← без обёртки {password, data}
  })
  // ... обработка ответа без изменений
}
```

Заполнять поле из localStorage при открытии модалки:
```js
document.getElementById('po-btn-pub').addEventListener('click', function () {
  var saved = '';
  try { saved = localStorage.getItem('po-save-secret') || ''; } catch(e) {}
  pubInp.value = saved;
  // ...
});
```

### 3.3 Изменить `loadRemote()` — относительный URL

```js
function loadRemote() {
  return fetch('/data.json')   // ← было: 'https://deniyashin.github.io/...'
    .then(function(r) { return r.ok ? r.json() : null; })
    // ... остальное без изменений
}
```

### Проверка Phase 3:
- Открыть po.dfprod.ru → данные загружаются (нет ошибок в консоли)
- Нажать "Опубликовать", ввести секрет → `↑ Опубликовано ✓`
- Обновить страницу → данные сохранились
- Повторная публикация — секрет уже заполнен из localStorage

---

## Phase 4: Финальная проверка

### Чеклист
```
[ ] git push → GitHub Action завершается успешно
[ ] Изменение в JS-файле видно на сайте после push (без ручного деплоя)
[ ] data.json НЕ перезаписывается при деплое (exclude в rsync)
[ ] POST /api/save без секрета → 401
[ ] POST /api/save с секретом → 200, данные сохранились
[ ] Загрузка страницы: данные подтягиваются из /data.json
[ ] Старый n8n webhook больше не вызывается (проверить Network в DevTools)
[ ] Откат кода: git revert + push → Action перезаписывает файлы
[ ] Откат данных: cp backup_data.json public/data.json на сервере
```

### Резервные копии data.json (опционально, после Phase 3)

Добавить в server.js при `/api/save` — перед записью делать бекап:
```js
var backupPath = DATA_PATH + '.' + Date.now() + '.bak';
fs.copyFile(DATA_PATH, backupPath, function() { /* ignore error */ });
// Чистить старые бекапы — оставлять 5 последних
```

---

## Порядок выполнения

1. **Phase 2 первой** — бекенд на сервере, не требует git
2. **Phase 3** — фронтенд, сразу проверить через локальный сервер или прямым деплоем
3. **Phase 1 последней** — GitHub Actions, когда убедились что всё работает вручную

Это позволяет на каждом шаге проверить что работает, прежде чем автоматизировать.
