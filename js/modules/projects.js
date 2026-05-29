// js/modules/projects.js — программы, проекты, DnD, удаление
// Извлечено из plan_timeline.js строки 1300-1946
// Зависимости: lsGet/lsSet (storage.js), window.renderTasks (tasks.js),
//   window.injectProjStatuses (proj-status.js), window.renderTimeline (timeline.js),
//   window.applyFilters (filters.js), window.flash

(function() {
  var LS_TEXTS    = 'po-texts';
  var LS_TASKS    = 'po-tasks';
  var LS_PSTAT    = 'po-proj-statuses';
  /* ================================================================
     NEW PROGRAM CREATION + MONTH MOVE
  ================================================================ */
  var LS_NEWPROG    = 'po-new-programs';
  var LS_PROG_MONTHS = 'po-prog-months';
  function getNewProgs()   { return lsGet(LS_NEWPROG); }
  function saveNewProgs(o) { try { localStorage.setItem(LS_NEWPROG,    JSON.stringify(o)); flash(); } catch (e) {} }
  function getProgMonths() { return lsGet(LS_PROG_MONTHS); }
  function saveProgMonths(o){ try { localStorage.setItem(LS_PROG_MONTHS, JSON.stringify(o)); flash(); } catch (e) {} }

  function buildProgramLi(d) {
    var li = document.createElement('li');
    li.className = 'program po-created-prog';
    li.setAttribute('data-program-id', d.id);
    li.setAttribute('data-source', d.source || 'U');
    li.setAttribute('data-contour', d.contour || '');
    li.setAttribute('data-change', '');
    li.setAttribute('data-assignees-all', '');
    li.setAttribute('data-assignees-anchor', '');
    li.setAttribute('data-assignees-owner', '');
    li.setAttribute('data-assignees-methodologist', '');
    var color = d.color || '#5A554C';
    li.innerHTML =
      '<button class="program-head" type="button" aria-expanded="false">' +
        '<span class="program-accent" style="background:' + color + '"></span>' +
        '<span class="program-kind">Программа</span>' +
        (d.contour ? '<span class="contour-chip contour-chip-lg">' + d.contour + '</span>' : '') +
        '<span class="program-name" data-ek="np-progname-' + d.id + '">' + d.name + '</span>' +
        '<span class="program-roles-slot" data-roles-slot></span>' +
        '<span class="program-flags" data-flags-slot></span>' +
        '<span class="program-id-mono">' + d.id + '</span>' +
        '<span class="project-count" title="Проектов в программе">0</span>' +
        '<span class="chev chev-lg" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="program-body" hidden>' +
        '<div class="field" style="margin-bottom:12px">' +
          '<span class="field-label">Описание</span>' +
          '<p class="field-value" data-ek="np-progdesc-' + d.id + '"></p>' +
        '</div>' +
        '<ol class="project-list"></ol>' +
      '</div>';
    var phead = li.querySelector('.program-head');
    if (phead) _addDeleteBtn(phead, function() { deleteProgram(li); });
    return li;
  }

  function restoreNewPrograms() {
    var np = getNewProgs();
    var pm = getProgMonths();
    /* flatten: progId → data */
    Object.keys(np).forEach(function (origMonthId) {
      (np[origMonthId] || []).forEach(function (d) {
        /* if the program has been moved, place it in new month */
        var monthId = pm[d.id] || origMonthId;
        var sec = document.getElementById(monthId) || document.getElementById(origMonthId);
        if (!sec) return;
        var progList = sec.querySelector('.program-list');
        if (progList) progList.appendChild(buildProgramLi(d));
      });
    });
  }

  function restoreProgramMonths() {
    var pm = getProgMonths();
    Object.keys(pm).forEach(function (progId) {
      var monthId = pm[progId];
      var prog = document.querySelector('.program[data-program-id="' + progId + '"]');
      var sec  = document.getElementById(monthId);
      if (!prog || !sec) return;
      /* skip if already in the right month */
      if (prog.closest('section.month') === sec) return;
      var list = sec.querySelector('.program-list');
      if (list) list.appendChild(prog);
    });
  }

  /* ---- new-program modal ---- */
  var _pmModal = null, _pmTargetSec = null;

  function _ensurePmModal() {
    if (_pmModal) return;
    _pmModal = document.createElement('div');
    _pmModal.className = 'po-newproj-modal'; /* reuse same overlay style */
    _pmModal.innerHTML =
      '<div class="po-newproj-box">' +
        '<div class="po-newproj-title">Новая программа</div>' +
        '<div class="po-newproj-field"><label>Название программы</label>' +
          '<input type="text" id="pm-name" placeholder="Название программы" autocomplete="off"></div>' +
        '<div class="po-newproj-field"><label>ID программы</label>' +
          '<input type="text" id="pm-id" placeholder="U-XXX-P-0.0" autocomplete="off" style="font-family:monospace;font-size:12px"></div>' +
        '<div class="po-newproj-field"><label>Контур (код)</label>' +
          '<input type="text" id="pm-contour" placeholder="CLN, FIN, HRM …" autocomplete="off" maxlength="12"></div>' +
        '<div class="po-newproj-actions">' +
          '<button class="po-newproj-cancel" type="button">Отмена</button>' +
          '<button class="po-newproj-confirm" type="button">Создать</button>' +
        '</div></div>';
    document.body.appendChild(_pmModal);
    _pmModal.querySelector('.po-newproj-cancel').addEventListener('click', _closePmModal);
    _pmModal.querySelector('.po-newproj-confirm').addEventListener('click', _confirmPm);
    _pmModal.addEventListener('click', function (e) { if (e.target === _pmModal) _closePmModal(); });
    _pmModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); _closePmModal(); }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); _confirmPm(); }
    });
    _pmModal.querySelector('#pm-contour').addEventListener('input', function () {
      this.value = this.value.toUpperCase();
    });
  }

  function _openPmModal(sec) {
    _pmTargetSec = sec;
    _ensurePmModal();
    var progList = sec.querySelector('.program-list');
    var existCount = progList ? progList.querySelectorAll('.program').length : 0;
    /* guess month index from section id */
    var monthIdx = (sec.id || '').replace('month-', '');
    _pmModal.querySelector('#pm-name').value = '';
    _pmModal.querySelector('#pm-id').value = 'U-NEW-P-' + (monthIdx || '0') + '.' + (existCount + 1);
    _pmModal.querySelector('#pm-contour').value = '';
    _pmModal.classList.add('open');
    setTimeout(function () { _pmModal.querySelector('#pm-name').focus(); }, 50);
  }

  function _closePmModal() {
    if (_pmModal) _pmModal.classList.remove('open');
    _pmTargetSec = null;
  }

  function _confirmPm() {
    var nameEl    = _pmModal.querySelector('#pm-name');
    var idEl      = _pmModal.querySelector('#pm-id');
    var ctEl      = _pmModal.querySelector('#pm-contour');
    var name    = (nameEl.value || '').trim();
    var id      = (idEl.value  || '').trim();
    var contour = (ctEl.value  || '').trim().toUpperCase();
    if (!name) { nameEl.focus(); return; }
    if (!id)   { idEl.focus();   return; }
    /* check uniqueness */
    if (document.querySelector('.program[data-program-id="' + id + '"]')) {
      idEl.style.borderColor = '#8B2635';
      idEl.title = 'ID уже существует'; idEl.focus(); return;
    }
    idEl.style.borderColor = '';

    var sec = _pmTargetSec;
    _closePmModal();

    var d = { id: id, name: name, contour: contour, source: 'U', color: '#5A554C' };
    var li = buildProgramLi(d);
    var progList = sec.querySelector('.program-list');
    if (progList) progList.appendChild(li);

    /* persist */
    var np = getNewProgs();
    if (!np[sec.id]) np[sec.id] = [];
    np[sec.id].push(d);
    saveNewProgs(np);

    /* inject add-project button */
    var pl2 = li.querySelector('.project-list');
    if (pl2) {
      var ab2 = document.createElement('button');
      ab2.type = 'button'; ab2.className = 'po-add-proj-btn'; ab2.textContent = '+ Добавить проект';
      ab2.addEventListener('click', function (e) { e.stopPropagation(); _openNpModal(li); });
      pl2.after(ab2);
    }


    /* inject progress bar */
    var head = li.querySelector('.program-head');
    if (head && !li.querySelector('.po-prog-wrap')) {
      var pw = document.createElement('div'); pw.className = 'po-prog-wrap';
      pw.innerHTML = '<div class="po-prog-bar"><div class="po-prog-fill" style="width:0%"></div></div><span class="po-prog-lbl">нет задач</span>';
      head.appendChild(pw);
    }

    /* register text fields */
    li.querySelectorAll('[data-ek]').forEach(function (el) {
      if (el.tagName === 'BUTTON' || el.querySelector('button')) return;
      var k = el.dataset.ek;
      var sv = lsGet(LS_TEXTS); if (k && sv[k]) el.innerHTML = sanitize(sv[k]);
      el.classList.add('po-editable'); el.contentEditable = 'true';
      el.addEventListener('paste', function (pe) {
        pe.preventDefault();
        document.execCommand('insertText', false, (pe.clipboardData || window.clipboardData).getData('text/plain'));
      });
      el.addEventListener('blur', function () { saveTextField(el); });
      textEls.push(el);
    });
  }

  /* ---- month-move picker ---- */
  /* ================================================================
     NEW PROJECT CREATION
  ================================================================ */
  var LS_NEWPROJ = 'po-new-projects';
  function getNewProjects() { return lsGet(LS_NEWPROJ); }
  function saveNewProjects(obj) { try { localStorage.setItem(LS_NEWPROJ, JSON.stringify(obj)); flash(); } catch (e) {} }

  function buildProjectLi(d) {
    var li = document.createElement('li');
    li.className = 'project po-created-proj';
    li.setAttribute('data-source', d.source || 'U');
    li.setAttribute('data-contour', d.contour || '');
    li.setAttribute('data-change', '');
    var color = d.accentColor || '#8B2635';
    li.innerHTML =
      '<button class="project-head" type="button" aria-expanded="false">' +
        '<span class="project-accent" style="background:' + color + '"></span>' +
        '<span class="project-index">' + (d.idx || '?') + '</span>' +
        '<span class="project-kind">Проект</span>' +
        (d.contour ? '<span class="contour-chip">' + d.contour + '</span>' : '') +
        '<span class="project-name">' + d.name + '</span>' +
        '<span class="project-id-mono">' + d.id + '</span>' +
        '<span class="task-badge task-badge-empty">—</span>' +
        '<span class="chev" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="project-body" hidden>' +
        '<div class="field"><span class="field-label">Измеримый результат</span>' +
          '<p class="field-value" data-ek="np-result-' + d.id + '"></p></div>' +
        '<div class="field"><span class="field-label">Описание</span>' +
          '<p class="field-value" data-ek="np-desc-' + d.id + '"></p></div>' +
      '</div>';
    var prjHead = li.querySelector('.project-head');
    if (prjHead) _addDeleteBtn(prjHead, function() { deleteProject(li); });
    return li;
  }

  function restoreNewProjects() {
    var np = getNewProjects();
    Object.keys(np).forEach(function (progId) {
      var prog = document.querySelector('.program[data-program-id="' + progId + '"]');
      if (!prog) return;
      var projList = prog.querySelector('.project-list');
      if (!projList) return;
      var accentEl = prog.querySelector('.program-accent');
      var accentColor = accentEl ? accentEl.style.background : '#8B2635';
      var baseIdx = projList.querySelectorAll('.project').length;
      (np[progId] || []).forEach(function (d, i) {
        d.idx = baseIdx + i + 1;
        d.accentColor = accentColor;
        projList.appendChild(buildProjectLi(d));
      });
    });
  }

  var _npModal = null, _npTargetProg = null;

  function _ensureNpModal() {
    if (_npModal) return;
    _npModal = document.createElement('div');
    _npModal.className = 'po-newproj-modal';
    _npModal.innerHTML =
      '<div class="po-newproj-box">' +
        '<div class="po-newproj-title">Новый проект</div>' +
        '<div class="po-newproj-field"><label>Название проекта</label>' +
          '<input type="text" id="np-name" placeholder="Название проекта" autocomplete="off"></div>' +
        '<div class="po-newproj-field"><label>ID проекта</label>' +
          '<input type="text" id="np-id" placeholder="U-XXX-PR-0.0.1" autocomplete="off" style="font-family:monospace;font-size:12px"></div>' +
        '<div class="po-newproj-field"><label>Контур (код)</label>' +
          '<input type="text" id="np-contour" placeholder="CLN, FIN, HRM …" autocomplete="off" maxlength="12"></div>' +
        '<div class="po-newproj-actions">' +
          '<button class="po-newproj-cancel" type="button">Отмена</button>' +
          '<button class="po-newproj-confirm" type="button">Создать</button>' +
        '</div></div>';
    document.body.appendChild(_npModal);
    _npModal.querySelector('.po-newproj-cancel').addEventListener('click', _closeNpModal);
    _npModal.querySelector('.po-newproj-confirm').addEventListener('click', _confirmNp);
    _npModal.addEventListener('click', function (e) { if (e.target === _npModal) _closeNpModal(); });
    _npModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); _closeNpModal(); }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); _confirmNp(); }
    });
    _npModal.querySelector('#np-contour').addEventListener('input', function () {
      this.value = this.value.toUpperCase();
    });
  }

  function _openNpModal(prog) {
    _npTargetProg = prog;
    _ensureNpModal();
    var progId = prog.getAttribute('data-program-id') || '';
    var base = progId.replace(/-P-/, '-PR-');
    var projList = prog.querySelector('.project-list');
    var existingCount = projList ? projList.querySelectorAll('.project').length : 0;
    _npModal.querySelector('#np-name').value = '';
    _npModal.querySelector('#np-id').value = base + '.' + (existingCount + 1);
    _npModal.querySelector('#np-contour').value = '';
    _npModal.classList.add('open');
    setTimeout(function () { _npModal.querySelector('#np-name').focus(); }, 50);
  }

  function _closeNpModal() {
    if (_npModal) _npModal.classList.remove('open');
    _npTargetProg = null;
  }

  function _confirmNp() {
    var nameEl = _npModal.querySelector('#np-name');
    var idEl   = _npModal.querySelector('#np-id');
    var ctEl   = _npModal.querySelector('#np-contour');
    var name    = (nameEl.value || '').trim();
    var id      = (idEl.value  || '').trim();
    var contour = (ctEl.value  || '').trim().toUpperCase();
    if (!name) { nameEl.focus(); return; }
    if (!id)   { idEl.focus();   return; }

    var prog = _npTargetProg;
    _closeNpModal();

    var progId = prog.getAttribute('data-program-id') || '';
    var source = (progId || 'U').charAt(0);
    var accentEl = prog.querySelector('.program-accent');
    var accentColor = accentEl ? accentEl.style.background : '#8B2635';
    var projList = prog.querySelector('.project-list');
    var idx = projList ? projList.querySelectorAll('.project').length + 1 : 1;

    var d = { id: id, name: name, contour: contour, source: source, accentColor: accentColor, idx: idx };
    var li = buildProjectLi(d);
    if (projList) projList.appendChild(li);

    /* persist */
    var np = getNewProjects();
    if (!np[progId]) np[progId] = [];
    np[progId].push({ id: id, name: name, contour: contour, source: source });
    saveNewProjects(np);

    /* inject status chips */
    var pbody = li.querySelector('.project-body');
    if (pbody && !pbody.querySelector('.po-proj-status-row')) {
      var savedPs = lsGet(LS_PSTAT);
      var row = document.createElement('div');
      row.className = 'po-proj-status-row';
      PROJ_STATUS_DEF.forEach(function (def) {
        var cell = document.createElement('span'); cell.className = 'po-proj-status-cell';
        var lbl  = document.createElement('span'); lbl.className  = 'po-proj-status-label'; lbl.textContent = def.label;
        var chip = document.createElement('span'); chip.className = 'po-status-chip'; chip.dataset.field = def.field;
        var sv = savedPs[id] && savedPs[id][def.field];
        var opt = def.options.find(function (o) { return o.value === sv; }) || def.options[0];
        applyChipStyle(chip, opt);
        cell.appendChild(lbl); cell.appendChild(chip);
        row.appendChild(cell);
      });
      pbody.insertBefore(row, pbody.firstChild);
    }

    /* register text fields */
    var savedTexts = lsGet(LS_TEXTS);
    if (pbody) pbody.querySelectorAll('[data-ek]').forEach(function (el) {
      var k = el.dataset.ek;
      if (k && savedTexts[k] !== undefined) el.innerHTML = sanitize(savedTexts[k]);
      el.classList.add('po-editable');
      el.contentEditable = 'true';
      el.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });
      el.addEventListener('blur', function () { saveTextField(el); });
      textEls.push(el);
    });

    /* progress bar */
    var badge = li.querySelector('.task-badge');
    if (badge && !li.querySelector('.po-proj-prog')) {
      var pg = document.createElement('span');
      pg.className = 'po-proj-prog';
      pg.innerHTML = '<span class="po-proj-prog-bar"><span class="po-proj-prog-fill" style="width:0%"></span></span><span class="po-proj-prog-lbl"></span>';
      badge.parentNode.insertBefore(pg, badge.nextSibling);
    }

    /* tasks */
    if (pbody) renderTasks(id, pbody, li);
    syncTaskEdit(pbody);
    updateProgProgress(prog);
  }

  function initAddProjectBtns() {
    document.querySelectorAll('.program[data-program-id]').forEach(function (prog) {
      var projList = prog.querySelector('.project-list');
      if (!projList) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'po-add-proj-btn';
      btn.textContent = '+ Добавить проект';
      btn.addEventListener('click', function (e) { e.stopPropagation(); _openNpModal(prog); });
      projList.after(btn);
    });
  }

  /* ================================================================
     РЕЖИМ ПРОЕКТЫ: DnD перенос между месяцами (независим от Подробно)
  ================================================================ */
  var LS_PROJ_MONTHS = 'po-proj-month-moves';

  function getProjMonthMoves() {
    try { return JSON.parse(localStorage.getItem(LS_PROJ_MONTHS) || '{}'); } catch(e) { return {}; }
  }
  function saveProjMonthMoves(o) { try { localStorage.setItem(LS_PROJ_MONTHS, JSON.stringify(o)); flash(); } catch(e) {} }

  /* ---------- Snapshot оригинальных позиций (для Подробно) ---------- */
  var _projOrigPositions = {}; /* projId -> { parent, nextSibling } */

  function recordProjOrigPositions() {
    _projOrigPositions = {};
    document.querySelectorAll('.project').forEach(function(proj) {
      var pidEl = proj.querySelector('.project-id-mono');
      if (!pidEl) return;
      var pid = pidEl.textContent.trim();
      _projOrigPositions[pid] = { parent: proj.parentElement, nextSibling: proj.nextElementSibling };
    });
  }

  function _findProjById(projId) {
    var result = null;
    document.querySelectorAll('.project-id-mono').forEach(function(mono) {
      if (mono.textContent.trim() === projId) result = mono.closest('.project');
    });
    return result;
  }

  /* Применяем сохранённые перемещения (для режима Проекты) */
  function applyProjectsModeOrder() {
    var moves = getProjMonthMoves();
    Object.keys(moves).forEach(function(projId) {
      var targetMonthId = moves[projId];
      var proj = _findProjById(projId);
      if (!proj) return;
      var targetMonth = document.getElementById(targetMonthId);
      if (!targetMonth || proj.closest('section.month, .month') === targetMonth) return;
      var targetList = targetMonth.querySelector('.project-list');
      if (!targetList) {
        var prog = targetMonth.querySelector('.program');
        if (!prog) return;
        var progBody = prog.querySelector('.program-body');
        if (!progBody) return;
        targetList = document.createElement('ol');
        targetList.className = 'project-list';
        progBody.appendChild(targetList);
      }
      targetList.appendChild(proj);
    });
  }

  /* Восстанавливаем оригинальные позиции (для режима Подробно) */
  function restoreProjOrigPositions() {
    Object.keys(_projOrigPositions).forEach(function(pid) {
      var orig = _projOrigPositions[pid];
      var proj = _findProjById(pid);
      if (!proj || !orig || !orig.parent) return;
      var ns = orig.nextSibling;
      if (ns && ns.parentElement === orig.parent) {
        orig.parent.insertBefore(proj, ns);
      } else {
        orig.parent.appendChild(proj);
      }
    });
  }

  var _projDragSrc = null;

  function initProjectsDnD() {
    // Добавляем дроп-зоны к каждому месячному разделу
    document.querySelectorAll('section.month, .month').forEach(function(sec) {
      if (sec.querySelector('.po-proj-drop-zone')) return;
      var zone = document.createElement('div');
      zone.className = 'po-proj-drop-zone';
      zone.textContent = 'Перетащите проект сюда';
      zone.style.cssText = 'display:none;text-align:center;font-size:12px;color:var(--ink-soft);line-height:40px;';
      sec.appendChild(zone);

      zone.addEventListener('dragover', function(e) {
        if (!_projDragSrc) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('po-drop-active');
      });
      zone.addEventListener('dragleave', function() {
        zone.classList.remove('po-drop-active');
      });
      zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('po-drop-active');
        if (!_projDragSrc) return;
        var targetList = sec.querySelector('.project-list');
        if (!targetList) {
          var prog = sec.querySelector('.program');
          if (!prog) return;
          var progBody = prog.querySelector('.program-body');
          if (!progBody) return;
          targetList = document.createElement('ol');
          targetList.className = 'project-list';
          progBody.appendChild(targetList);
        }
        targetList.appendChild(_projDragSrc);
        var pidEl = _projDragSrc.querySelector('.project-id-mono');
        if (pidEl && sec.id) {
          var moves = getProjMonthMoves();
          moves[pidEl.textContent.trim()] = sec.id;
          saveProjMonthMoves(moves);
          /* Обновляем snapshot: новая позиция становится текущей для режима Проекты */
        }
        _projDragSrc = null;
      });
    });

    // Делаем проекты перетаскиваемыми только в режиме Проекты
    document.querySelectorAll('.project').forEach(function(proj) {
      if (proj.dataset.projDndReady) return;
      proj.dataset.projDndReady = '1';
      proj.addEventListener('dragstart', function(e) {
        if (document.body.getAttribute('data-mode') !== 'projects') return;
        _projDragSrc = proj;
        e.dataTransfer.effectAllowed = 'move';
        document.body.classList.add('po-dnd-active');
        setTimeout(function() { proj.classList.add('po-proj-dragging'); }, 0);
      });
      proj.addEventListener('dragend', function() {
        proj.classList.remove('po-proj-dragging');
        document.body.classList.remove('po-dnd-active');
        _projDragSrc = null;
        document.querySelectorAll('.po-proj-drop-zone').forEach(function(z) { z.classList.remove('po-drop-active'); });
      });
    });
  }

  /* Синхронизация draggable + применение/восстановление позиций при смене режима */
  (function() {
    function _syncDraggable() {
      var isDnd = document.body.getAttribute('data-mode') === 'projects';
      document.querySelectorAll('.project').forEach(function(proj) {
        proj.draggable = isDnd;
      });
    }
    var _prevObsMode = document.body.getAttribute('data-mode');
    var _modeObs = new MutationObserver(function(muts) {
      muts.forEach(function(m) {
        if (m.attributeName !== 'data-mode' && m.attributeName !== 'data-base-mode') return;
        _syncDraggable();
        var newMode = document.body.getAttribute('data-mode');
        if (newMode === _prevObsMode) return;
        if (_prevObsMode === 'projects' && newMode !== 'projects') {
          restoreProjOrigPositions();
        }
        if (newMode === 'projects' && _prevObsMode !== 'projects') {
          applyProjectsModeOrder();
        }
        _prevObsMode = newMode;
      });
    });
    _modeObs.observe(document.body, { attributes: true });
  }());

  /* ================================================================
     DELETE PROGRAMS / PROJECTS
  ================================================================ */
  var LS_DELETED = 'po-deleted';

  function getDeleted() {
    try { return JSON.parse(localStorage.getItem(LS_DELETED) || '{"programs":[],"projects":[]}'); } catch(e) { return {programs:[], projects:[]}; }
  }
  function saveDeleted(o) { try { localStorage.setItem(LS_DELETED, JSON.stringify(o)); flash(); } catch(e) {} }

  function applyDeleted() {
    var d = getDeleted();
    (d.programs || []).forEach(function(id) {
      getProgramInstances(id).forEach(function (el) { el.remove(); });
    });
    (d.projects || []).forEach(function(pid) {
      document.querySelectorAll('.project-id-mono').forEach(function(mono) {
        if (mono.textContent.trim() === pid) {
          var proj = mono.closest('.project');
          if (proj) proj.remove();
        }
      });
    });
  }

  function _cleanProjectData(pid) {
    var texts = lsGet(LS_TEXTS);
    Object.keys(texts).forEach(function(k) { if (k.indexOf(pid) !== -1) delete texts[k]; });
    lsSet(LS_TEXTS, texts);
    var tasks = lsGet(LS_TASKS);
    delete tasks[pid];
    lsSet(LS_TASKS, tasks);
    var stat = lsGet(LS_PSTAT);
    delete stat[pid];
    lsSet(LS_PSTAT, stat);
  }

  function deleteProject(proj) {
    var pidMonoEl = proj.querySelector('.project-id-mono');
    var pid = pidMonoEl ? pidMonoEl.textContent.trim() : '';
    var name = (proj.querySelector('.project-name') || {}).textContent || pid;
    if (!confirm('Удалить проект «' + name + '»?\nЗадачи, статусы и тексты проекта будут удалены.')) return;
    if (pid) _cleanProjectData(pid);
    if (pid) {
      var d = getDeleted();
      if (d.projects.indexOf(pid) === -1) d.projects.push(pid);
      saveDeleted(d);
    }
    var prog = proj.closest('.program');
    proj.remove();
    if (prog) { updateProgProgress(prog); }
  }

  function deleteProgram(prog) {
    var progId = prog.getAttribute('data-program-id') || '';
    var name = (prog.querySelector('.program-name') || {}).textContent || progId;
    var projCount = prog.querySelectorAll('.project').length;
    var msg = 'Удалить программу «' + name + '»?';
    if (projCount > 0) msg += '\nВместе с ней будут удалены ' + projCount + ' проект(ов) и все их задачи.';
    if (!confirm(msg)) return;
    prog.querySelectorAll('.project-id-mono').forEach(function(mono) {
      _cleanProjectData(mono.textContent.trim());
    });
    var d = getDeleted();
    if (progId && d.programs.indexOf(progId) === -1) d.programs.push(progId);
    saveDeleted(d);
    prog.remove();
  }

  function _addDeleteBtn(headEl, handler) {
    if (headEl.querySelector('.po-delete-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'po-delete-btn';
    btn.title = 'Удалить';
    btn.innerHTML = '&#128465;';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      handler();
    });
    headEl.appendChild(btn);
  }

  function initDeleteButtons() {
    document.querySelectorAll('.program').forEach(function(prog) {
      var head = prog.querySelector('.program-head');
      if (head) _addDeleteBtn(head, function() { deleteProgram(prog); });
    });
    document.querySelectorAll('.project').forEach(function(proj) {
      var head = proj.querySelector('.project-head');
      if (head) _addDeleteBtn(head, function() { deleteProject(proj); });
    });
  }

  // Добавляет кнопки "+ Добавить программу" к каждому месячному разделу.
  // Функция отсутствовала в оригинале (вызов без определения),
  // что приводило к обрыву INIT после recordProjOrigPositions.
  function initAddProgramBtns() {
    document.querySelectorAll('section.month').forEach(function (sec) {
      var progList = sec.querySelector('.program-list');
      if (!progList) return;
      if (progList.querySelector('.po-add-prog-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'po-add-prog-btn';
      btn.textContent = '+ Добавить программу';
      btn.addEventListener('click', function (e) { e.stopPropagation(); _openPmModal(sec); });
      progList.appendChild(btn);
    });
  }

  window.applyDeleted           = applyDeleted;
  window.restoreNewPrograms     = restoreNewPrograms;
  window.restoreNewProjects     = restoreNewProjects;
  window.restoreProgramMonths   = restoreProgramMonths;
  window.initAddProgramBtns     = initAddProgramBtns;
  window.initAddProjectBtns     = initAddProjectBtns;
  window.initProjectsDnD        = initProjectsDnD;
  window.recordProjOrigPositions = recordProjOrigPositions;
  window.applyProjectsModeOrder = applyProjectsModeOrder;
  window.initDeleteButtons      = initDeleteButtons;
})();