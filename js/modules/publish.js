// js/modules/publish.js — публикация: doPublish, collectState, loadRemote, applyData
// Извлечено из plan_timeline.js строки 1145-1299
// Зависимости: lsGet/lsSet (storage.js), window.renderTasks (tasks.js),
//   window.renderTimeline (timeline.js), window.gatherState (program-flags.js)

(function() {
  var LS_TEXTS  = 'po-texts';
  var LS_TASKS  = 'po-tasks';
  var LS_PSTAT  = 'po-proj-statuses';
  var WEBHOOK   = 'https://noslosnodeyim.beget.app/webhook/plan_timeline';
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
    pubInp.value = ''; pubErr.textContent = '';
    openModal('po-pub-modal');
    setTimeout(function () { pubInp.focus(); }, 30);
  });

  function collectState() {
    var progStatuses = {};
    try { progStatuses = JSON.parse(localStorage.getItem('plan-timeline-statuses-v1') || '{}'); } catch (e) {}
    return {
      texts: lsGet(LS_TEXTS), tasks: lsGet(LS_TASKS),
      projStatuses: lsGet(LS_PSTAT), progStatuses: progStatuses,
      projectMonths: lsGet('po-project-months-v1'),
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

  function doPublish() {
    var pwd = pubInp.value;
    if (!pwd) { pubErr.textContent = 'Введите пароль'; return; }
    closeModal('po-pub-modal');
    var btn = document.getElementById('po-btn-pub');
    btn.disabled = true; btn.textContent = 'Публикация...';
    fetch(WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, data: collectState() })
    })
      .then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error(t || 'HTTP ' + r.status); });
        return r.json();
      })
      .then(function (resp) {
        if (resp && resp.error) throw new Error(resp.error);
        btn.textContent = '↑ Опубликовано ✓';
        if (window.showToast) window.showToast('Данные опубликованы', 'success');
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
  }

  function loadRemote() {
    return fetch('https://deniyashin.github.io/plan_timeline/data.json?v=' + Date.now(), { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) applyData(d); })
      .catch(function (err) {
        if (window.showToast) window.showToast('Не удалось загрузить данные' + (err && err.message ? ': ' + err.message : ''), 'error');
      });
  }

  window.updatePubStamp = updatePubStamp;
  window.collectState   = collectState;
  window.doPublish      = doPublish;
  window.applyData      = applyData;
  window.loadRemote     = loadRemote;
})();