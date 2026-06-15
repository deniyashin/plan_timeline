// js/modules/publish.js — публикация: doPublish, collectState, loadRemote, applyData
// Извлечено из plan_timeline.js строки 1145-1299
// Зависимости: lsGet/lsSet (storage.js), window.renderTasks (tasks.js),
//   window.renderTimeline (timeline.js), window.gatherState (program-flags.js)

(function() {
  var LS_TEXTS  = 'po-texts';
  var LS_TASKS  = 'po-tasks';
  var LS_PSTAT  = 'po-proj-statuses';
  var WEBHOOK   = '/api/save';
  var LS_SECRET = 'po-save-secret';
  /* ================================================================
     PUBLISH
  ================================================================ */
  var pubInp = document.getElementById('po-pub-inp');
  var pubErr = document.getElementById('po-pub-err');

  document.getElementById('po-pub-cancel').addEventListener('click', function () { closeModal('po-pub-modal'); });
  document.getElementById('po-pub-modal').addEventListener('click', function (e) {
    if (e.target === this) closeModal('po-pub-modal');
  });
  document.getElementById('po-pub-ok').addEventListener('click', doPublish);
  pubInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doPublish(); });
  document.getElementById('po-btn-pub').addEventListener('click', function () {
    try { pubInp.value = localStorage.getItem(LS_SECRET) || ''; } catch(e) { pubInp.value = ''; }
    pubErr.textContent = '';
    openModal('po-pub-modal');
    setTimeout(function () { pubInp.focus(); }, 30);
  });

  function collectState() {
    var progStatuses = {};
    try { progStatuses = JSON.parse(localStorage.getItem('plan-timeline-statuses-v1') || '{}'); } catch (e) {}
    var peopleOverrides = null;
    try {
      var raw = localStorage.getItem('po-people-overrides');
      peopleOverrides = raw ? JSON.parse(raw) : null;
    } catch (e) {}
    return {
      texts: lsGet(LS_TEXTS), tasks: lsGet(LS_TASKS),
      projStatuses: lsGet(LS_PSTAT), progStatuses: progStatuses,
      projectMonths: lsGet('po-project-months-v1'),
      people: peopleOverrides || window.PLAN_CONFIG.PEOPLE,
      newProjects:  lsGet('po-new-projects'),
      newPrograms:  lsGet('po-new-programs'),
      deletedItems: lsGet('po-deleted'),
      publishedAt: new Date().toISOString()
    };
  }

  function updatePubStamp(iso) {
    var wrap = document.getElementById('po-pub-stamp');
    var timeEl = document.getElementById('po-pub-stamp-time');
    if (!wrap || !timeEl || !iso) return;
    var d = new Date(iso);
    if (isNaN(d)) return;
    var months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
    var date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    var time = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    timeEl.textContent = date + ' · ' + time;
    wrap.removeAttribute('hidden');
  }

  function flushEditableFields() {
    /* Сбрасываем все открытые contentEditable поля в localStorage до collectState.
       Без этого текст, набранный без blur, не попадает в публикацию. */
    (window.textEls || []).forEach(function (el) {
      if (el.contentEditable === 'true' && el.dataset.ek) {
        if (typeof window.saveTextField === 'function') window.saveTextField(el);
      }
    });
  }

  function doPublish() {
    var pwd = pubInp.value.trim();
    if (!pwd) { pubErr.textContent = 'Введите секрет'; return; }
    try { localStorage.setItem(LS_SECRET, pwd); } catch(e) {}
    closeModal('po-pub-modal');
    flushEditableFields();
    var btn = document.getElementById('po-btn-pub');
    btn.disabled = true; btn.textContent = 'Публикация...';
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + pwd },
      body: JSON.stringify(collectState())
    })
      .then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error(t || 'HTTP ' + r.status); });
        return r.json();
      })
      .then(function (resp) {
        if (resp && resp.error) throw new Error(resp.error);
        btn.textContent = '↑ Опубликовано ✓';
        if (window.showToast) window.showToast('Данные опубликованы', 'success');
        /* локальные изменения справочника теперь в data.json — снимаем защитный флаг */
        try { localStorage.removeItem('po-people-local-edit'); } catch(e2) {}
        setTimeout(function () { btn.disabled = false; btn.textContent = '↑ Опубликовать'; }, 5000);
        var nowIso = new Date().toISOString();
        try { localStorage.setItem('po-doc-edited', nowIso); } catch (e) {}
        updatePubStamp(nowIso);
      })
      .catch(function (err) {
        btn.disabled = false; btn.textContent = '↑ Опубликовать';
        pubErr.textContent = 'Ошибка: ' + err.message;
        openModal('po-pub-modal');
        setTimeout(function () { pubInp.focus(); }, 30);
      });
  }

  /* ================================================================
     LOAD REMOTE DATA
  ================================================================ */
  function applyData(data) {
    if (!data) return;
    if (data.people && typeof data.people === 'object' && !Array.isArray(data.people)) {
      var _hasLocalPeopleEdit = false;
      try { _hasLocalPeopleEdit = !!localStorage.getItem('po-people-local-edit'); } catch(e2) {}
      if (!_hasLocalPeopleEdit) {
        /* нет локальных несохранённых изменений — применяем данные с сервера */
        window.PLAN_CONFIG.PEOPLE = data.people;
        try { localStorage.setItem('po-people-overrides', JSON.stringify(data.people)); } catch (e) {}
      }
      /* в любом случае обновляем ASSIGNEES и UI */
      if (typeof window.refreshPeopleViews === 'function') window.refreshPeopleViews();
    }
    if (data.newPrograms && typeof data.newPrograms === 'object' && Object.keys(data.newPrograms).length) {
      try { localStorage.setItem('po-new-programs', JSON.stringify(data.newPrograms)); } catch (e) {}
      if (typeof window.restoreNewPrograms === 'function') window.restoreNewPrograms();
    }
    if (data.newProjects && typeof data.newProjects === 'object') {
      try { localStorage.setItem('po-new-projects', JSON.stringify(data.newProjects)); } catch (e) {}
      if (typeof window.restoreNewProjects === 'function') window.restoreNewProjects();
      if (typeof window.injectProjStatuses === 'function') window.injectProjStatuses();
    }
    if (data.deletedItems && typeof data.deletedItems === 'object') {
      try { localStorage.setItem('po-deleted', JSON.stringify(data.deletedItems)); } catch (e) {}
      if (typeof window.applyDeleted === 'function') window.applyDeleted();
    }
    if (data.texts && Object.keys(data.texts).length) {
      try { localStorage.setItem(LS_TEXTS, JSON.stringify(data.texts)); } catch (e) {}
      (window.textEls || []).forEach(function (el) {
        var k = el.dataset.ek;
        if (k && data.texts[k] !== undefined) el.innerHTML = sanitize(data.texts[k]);
      });
    }
    if (data.tasks && Object.keys(data.tasks).length) {
      try { localStorage.setItem(LS_TASKS, JSON.stringify(data.tasks)); } catch (e) {}
      document.querySelectorAll('.project').forEach(function (proj) {
        var pidEl = proj.querySelector('.project-id-mono');
        var body  = proj.querySelector('.project-body');
        if (!pidEl || !body) return;
        renderTasks(pidEl.textContent.trim(), body, proj);
      });
      document.querySelectorAll('.program').forEach(updateProgProgress);
    }
    if (data.projStatuses && Object.keys(data.projStatuses).length) {
      try { localStorage.setItem(LS_PSTAT, JSON.stringify(data.projStatuses)); } catch (e) {}
      document.querySelectorAll('.project').forEach(function (proj) {
        var pidEl = proj.querySelector('.project-id-mono');
        if (!pidEl) return;
        var pid = pidEl.textContent.trim();
        var ps  = data.projStatuses[pid];
        if (!ps) return;
        (window.PLAN_CONFIG.PROJ_STATUS_DEF || []).forEach(function (def) {
          var chip = proj.querySelector('.po-status-chip[data-field="' + def.field + '"]');
          if (!chip) return;
          var opt = def.options.find(function (o) { return o.value === ps[def.field]; });
          if (opt && window.applyChipStyle) window.applyChipStyle(chip, opt);
        });
        /* restore owner */
        if (ps['owner'] !== undefined) {
          var ownerBtn = proj.querySelector('.po-proj-owner-btn');
          if (ownerBtn) {
            var code = ps['owner'];
            var a = code && window.ASSIGNEES && window.ASSIGNEES[code];
            var av = ownerBtn.querySelector('.po-proj-owner-av');
            var nm = ownerBtn.querySelector('span:last-child');
            if (av) av.textContent = a ? a.initials : '—';
            if (nm) nm.textContent = a ? a.last : 'не назначен';
          }
        }
      });
    }
    if (data.progStatuses && Object.keys(data.progStatuses).length) {
      try { localStorage.setItem('plan-timeline-statuses-v1', JSON.stringify(data.progStatuses)); } catch (e) {}
      Object.keys(data.progStatuses).forEach(function (key) {
        var parts = key.split(':'), field = parts.pop(), pid = parts.join(':');
        getProgramInstances(pid).forEach(function (prog) {
          var editor = prog.querySelector('.status-editor[data-field="' + field + '"]');
          if (!editor) return;
          var chip = editor.querySelector('.status-chip');
          if (!chip) return;
          var v = data.progStatuses[key];
          if (!v || !v.css) return;
          chip.className = 'status-chip ' + v.css;
          chip.textContent = v.label;
          chip.dataset.current = v.css;
        });
      });
    }
    /* Задача 10: restore projectMonths */
    if (data.projectMonths && Object.keys(data.projectMonths).length) {
      try { localStorage.setItem('po-project-months-v1', JSON.stringify(data.projectMonths)); } catch (e) {}
    } else {
      migrateProjectMonths();
    }
    renderTimeline();
    if (typeof window.cleanStaleDrafts === 'function') window.cleanStaleDrafts();
  }

  function loadRemote() {
    return fetch('/data.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d) {
          applyData(d);
          var errEl = document.getElementById('po-load-error');
          if (errEl) { errEl.hidden = true; }
        }
      })
      .catch(function (err) {
        if (window.showToast) window.showToast('Не удалось загрузить данные' + (err && err.message ? ': ' + err.message : ''), 'error');
        var errEl = document.getElementById('po-load-error');
        if (errEl) { errEl.hidden = false; }
      });
  }

  window.updatePubStamp = updatePubStamp;
  window.collectState   = collectState;
  window.doPublish      = doPublish;
  window.applyData      = applyData;
  window.loadRemote     = loadRemote;
})();