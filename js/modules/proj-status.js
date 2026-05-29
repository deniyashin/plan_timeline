// js/modules/proj-status.js — статусы проектов, миграция задач
// Извлечено из plan_timeline.js строки 398-652
// Зависимости: lsGet/lsSet (storage.js), window.PLAN_CONFIG

(function() {
  var LS_PSTAT = 'po-proj-statuses';
  var LS_TEXTS = 'po-texts';         // для комментариев проектов
  var LS_MIG   = 'po-migrated-v1';
  var LS_TASKS = 'po-tasks';
  /* ================================================================
     PROJECT STATUS CHIPS
  ================================================================ */
  var PROJ_STATUS_DEF = window.PLAN_CONFIG.PROJ_STATUS_DEF;

  function applyChipStyle(chip, opt) {
    chip.textContent = opt.label;
    chip.style.color        = opt.color;
    chip.style.borderColor  = opt.color + '40';
    chip.style.background   = opt.color + '18';
    chip.dataset.value = opt.value;
  }

  function injectProjStatuses() {
    var saved = lsGet(LS_PSTAT);
    document.querySelectorAll('.project').forEach(function (proj) {
      var pidEl = proj.querySelector('.project-id-mono');
      if (!pidEl) return;
      var pid = pidEl.textContent.trim();
      var body = proj.querySelector('.project-body');
      if (!body || body.querySelector('.po-proj-status-row')) return;
      var row = document.createElement('div');
      row.className = 'po-proj-status-row';
      PROJ_STATUS_DEF.forEach(function (def) {
        var cell = document.createElement('span');
        cell.className = 'po-proj-status-cell';
        var lbl = document.createElement('span');
        lbl.className = 'po-proj-status-label';
        lbl.textContent = def.label;
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'po-status-chip';
        chip.dataset.field = def.field;
        var savedVal = saved[pid] && saved[pid][def.field];
        var opt0 = (savedVal && def.options.find(function (o) { return o.value === savedVal; })) || def.options[0];
        applyChipStyle(chip, opt0);
        chip.addEventListener('click', function (e) {
          e.stopPropagation();
          if (document.body.getAttribute('data-mode') !== 'edit') return;
          var cur  = def.options.findIndex(function (o) { return o.value === chip.dataset.value; });
          var next = def.options[(cur + 1) % def.options.length];
          applyChipStyle(chip, next);
          var d = lsGet(LS_PSTAT);
          if (!d[pid]) d[pid] = {};
          d[pid][def.field] = next.value;
          lsSet(LS_PSTAT, d);
          var pr = proj.closest('.program');
          if (pr && def.field === 'status') updateProgProgress(pr);
        });
        cell.appendChild(lbl);
        cell.appendChild(chip);
        row.appendChild(cell);
      });

      /* --- Owner (Ответственный) cell --- */
      (function () {
        var ownerCell = document.createElement('span');
        ownerCell.className = 'po-proj-status-cell';
        var ownerLbl = document.createElement('span');
        ownerLbl.className = 'po-proj-status-label';
        ownerLbl.textContent = 'Ответственный';
        var ownerBtn = document.createElement('button');
        ownerBtn.type = 'button';
        ownerBtn.className = 'po-proj-owner-btn';
        var ownerAv = document.createElement('span');
        ownerAv.className = 'po-proj-owner-av';
        var ownerNm = document.createElement('span');
        ownerNm.style.fontSize = '11px';

        function refreshOwner(code) {
          var a = code && window.ASSIGNEES && window.ASSIGNEES[code];
          ownerAv.textContent = a ? a.initials : '—';
          ownerNm.textContent = a ? a.last : 'не назначен';
        }
        var savedOwner = saved[pid] && saved[pid]['owner'];
        refreshOwner(savedOwner || '');
        ownerBtn.appendChild(ownerAv);
        ownerBtn.appendChild(ownerNm);

        ownerBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (document.body.getAttribute('data-mode') !== 'edit') return;
          var existing = document.getElementById('po-proj-owner-drop');
          if (existing) { existing.remove(); return; }
          var drop = document.createElement('div');
          drop.id = 'po-proj-owner-drop';
          drop.style.cssText = 'position:fixed;z-index:700;background:#FDFBF6;border:1px solid #DDD5C5;border-radius:8px;min-width:200px;max-height:280px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,0.14);padding:4px 0';
          var rect = ownerBtn.getBoundingClientRect();
          drop.style.top  = (rect.bottom + 6) + 'px';
          drop.style.left = rect.left + 'px';
          /* Clear option */
          var clearOpt = document.createElement('button');
          clearOpt.type = 'button';
          clearOpt.style.cssText = 'display:block;width:100%;background:transparent;border:none;border-bottom:1px solid #EDE8DF;padding:6px 12px;font-family:inherit;font-size:11px;color:#8B2635;cursor:pointer;text-align:left';
          clearOpt.textContent = '✕ убрать ответственного';
          clearOpt.addEventListener('click', function (ev) { ev.stopPropagation(); drop.remove(); document.removeEventListener('click', closeOwner, true); refreshOwner(''); var d = lsGet(LS_PSTAT); if (!d[pid]) d[pid] = {}; d[pid]['owner'] = ''; lsSet(LS_PSTAT, d); });
          drop.appendChild(clearOpt);
          Object.entries(window.ASSIGNEES || {}).forEach(function (pair) {
            var code = pair[0], a = pair[1];
            var opt = document.createElement('button');
            opt.type = 'button';
            opt.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;background:transparent;border:none;padding:5px 12px;font-family:inherit;font-size:12px;color:var(--ink);cursor:pointer;text-align:left';
            opt.onmouseenter = function () { opt.style.background = '#F0EDE6'; };
            opt.onmouseleave = function () { opt.style.background = 'transparent'; };
            var av2 = document.createElement('span');
            av2.style.cssText = 'flex-shrink:0;width:18px;height:18px;border-radius:50%;background:#E8E2D8;color:#6B6560;display:inline-flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:700;font-family:"Geist Mono",monospace';
            av2.textContent = a.initials || code;
            var nm2 = document.createElement('span');
            nm2.textContent = (a.last || code) + (a.first ? ' ' + a.first : '');
            opt.appendChild(av2); opt.appendChild(nm2);
            opt.addEventListener('click', function (ev) {
              ev.stopPropagation();
              drop.remove(); document.removeEventListener('click', closeOwner, true);
              refreshOwner(code);
              var d = lsGet(LS_PSTAT);
              if (!d[pid]) d[pid] = {};
              d[pid]['owner'] = code;
              lsSet(LS_PSTAT, d);
            });
            drop.appendChild(opt);
          });
          document.body.appendChild(drop);
          function closeOwner(ev) {
            if (!drop.contains(ev.target) && ev.target !== ownerBtn) { drop.remove(); document.removeEventListener('click', closeOwner, true); }
          }
          setTimeout(function () { document.addEventListener('click', closeOwner, true); }, 0);
        });

        ownerCell.appendChild(ownerLbl);
        ownerCell.appendChild(ownerBtn);
        row.appendChild(ownerCell);
      }());

      body.insertBefore(row, body.firstChild);

      /* --- Month picker row (Задача 6) --- */
      (function () {
        var monthRow = document.createElement('div');
        monthRow.className = 'po-proj-month-row';
        var _editNow = document.body.getAttribute('data-mode') === 'edit';
        monthRow.style.cssText = 'align-items:center;gap:8px;padding:4px 0 6px;font-size:11px;color:var(--ink-muted);display:' + (_editNow ? 'flex' : 'none');
        var monthLbl = document.createElement('span');
        monthLbl.className = 'po-proj-status-label';
        monthLbl.textContent = 'Месяц проекта:';
        var sel = document.createElement('select');
        sel.className = 'project-month-select';
        sel.style.cssText = 'font-family:inherit;font-size:11px;padding:2px 6px;border:1px solid #DDD5C5;border-radius:4px;background:#FDFBF6;color:var(--ink);cursor:pointer';
        MONTHS.forEach(function (m) {
          var opt = document.createElement('option');
          opt.value = m.key;
          opt.textContent = m.label;
          sel.appendChild(opt);
        });
        sel.value = getProjectMonth(pid);
        sel.addEventListener('change', function (e) {
          e.stopPropagation();
          if (document.body.getAttribute('data-mode') !== 'edit') return;
          setProjectMonth(pid, sel.value);
          renderTimeline();
        });
        monthRow.appendChild(monthLbl);
        monthRow.appendChild(sel);
        body.insertBefore(monthRow, row.nextSibling);
      }());

      /* --- Comment field --- */
      var commentKey = 'proj-comment-' + pid;
      var commentEl = document.createElement('div');
      commentEl.className = 'po-proj-comment po-editable';
      commentEl.contentEditable = 'false';
      commentEl.spellcheck = false;
      commentEl.dataset.ek = commentKey;
      commentEl.setAttribute('data-placeholder', 'Комментарий...');
      var savedTexts = lsGet(LS_TEXTS);
      if (savedTexts[commentKey] !== undefined) commentEl.innerHTML = sanitize(savedTexts[commentKey]);
      // Проставляем класс пустоты для скрытия вне редактирования
      function _updateCommentEmpty() {
        var isEmpty = commentEl.textContent.trim() === '' || commentEl.innerHTML === '<br>';
        commentEl.classList.toggle('po-comment-empty', isEmpty);
      }
      _updateCommentEmpty();
      commentEl.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });
      commentEl.addEventListener('blur', function () { saveTextField(commentEl); _updateCommentEmpty(); });
      commentEl.addEventListener('input', _updateCommentEmpty);
      textEls.push(commentEl);
      body.appendChild(commentEl);
    });
  }

  /* ================================================================
     MIGRATE HARDCODED TASKS TO po-tasks FORMAT (runs once)
  ================================================================ */
  function migrateHardcodedTasks() {
    if (lsRaw(LS_MIG)) return; /* already migrated on this device */
    var tasks = lsGet(LS_TASKS);
    document.querySelectorAll('.project').forEach(function (proj) {
      var pidEl = proj.querySelector('.project-id-mono');
      if (!pidEl) return;
      var pid = pidEl.textContent.trim();
      if (tasks[pid] && tasks[pid].length > 0) return; /* don't overwrite existing */
      var items = proj.querySelectorAll('.tasks-wrap .task-list .task');
      if (!items.length) return;
      var migrated = [];
      items.forEach(function (item) {
        var idEl   = item.querySelector('.task-id');
        var nameEl = item.querySelector('.task-name');
        migrated.push({
          id: '',
          taskId:   idEl   ? idEl.textContent.trim()   : '',
          text:     nameEl ? nameEl.textContent.trim() : '',
          assignee: '',
          dueDate:  '',
          legacy_id: idEl ? idEl.textContent.trim() : '',
          status:   'not_started'
        });
      });
      if (migrated.length) tasks[pid] = migrated;
    });
    try { localStorage.setItem(LS_TASKS, JSON.stringify(tasks)); } catch (e) {}
    lsRawSet(LS_MIG, '1');
  }

  /* v2 migration: assign sequential T-xxxx IDs, normalize status vocabulary */
  function migrateTasksV2() {
    var LS_MIG2 = 'po-migrated-v2';
    if (lsRaw(LS_MIG2)) return;
    var ST_MAP = { todo: 'not_started', doing: 'in_progress' };
    var tasks = lsGet(LS_TASKS);
    var counter = 1;
    Object.keys(tasks).forEach(function (pid) {
      tasks[pid] = (tasks[pid] || []).map(function (t) {
        if (ST_MAP[t.status]) t.status = ST_MAP[t.status];
        if (!t.id) {
          t.id = 'T-' + String(counter).padStart(4, '0');
          if (!t.legacy_id && t.taskId) t.legacy_id = t.taskId;
          counter++;
        }
        return t;
      });
    });
    try { localStorage.setItem(LS_TASKS, JSON.stringify(tasks)); } catch (e) {}
    lsRawSet(LS_MIG2, '1');
  }

  /* hide the old tasks-wrap elements (replaced by .po-task-section) */
  function hideOldTasksWrap() {
    document.querySelectorAll('.tasks-wrap').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  window.injectProjStatuses    = injectProjStatuses;
  window.applyChipStyle        = applyChipStyle;  // нужен publish.js (applyData)
  window.migrateHardcodedTasks = migrateHardcodedTasks;
  window.migrateTasksV2        = migrateTasksV2;
  window.hideOldTasksWrap      = hideOldTasksWrap;
})();