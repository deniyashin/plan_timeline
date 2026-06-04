// === Filters + UI === → js/modules/filters.js
// === Mode switcher === → js/modules/modes.js
// === Assignments / program flags === → js/modules/program-flags.js
// === Main app (edit, DnD, tasks, backend) ===
(function () {
  var LS_TEXTS  = 'po-texts';
  var LS_TASKS  = 'po-tasks';
  var LS_PSTAT  = 'po-proj-statuses';
  var LS_MIG    = 'po-migrated-v1';
  var WEBHOOK   = 'https://noslosnodeyim.beget.app/webhook/plan_timeline';

  // lsGet, lsSet, lsRaw, lsRawSet — в js/utils/storage.js


  /* save flash */
  var savedEl = document.getElementById('po-edit-saved');
  var _ft;
  function flash() {
    if (!savedEl) return;
    savedEl.textContent = '✓ Сохранено';
    savedEl.classList.add('flash');
    clearTimeout(_ft);
    _ft = setTimeout(function () {
      savedEl.classList.remove('flash');
      savedEl.textContent = 'Все изменения сохранены';
    }, 2000);
    var _now = new Date().toISOString();
    try { localStorage.setItem('po-doc-edited', _now); } catch (e) {}
    updatePubStamp(_now);
  }
  window.flash = flash; // нужен storage.js (lsSet вызывает window.flash)

  /* modals */
  function openModal(id)  { var el = document.getElementById(id); if (el) el.classList.add('open'); }
  function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('open'); }
  window.openModal  = openModal;
  window.closeModal = closeModal;

  /* exit edit mode */
  document.getElementById('po-btn-logout').addEventListener('click', function () {
    var b = document.querySelector('.mode-btn[data-mode="brief"]');
    if (b) b.click();
  });

  /* reset all local changes */
  document.getElementById('po-btn-reset').addEventListener('click', function () {
    if (!confirm('Сбросить все локальные изменения? Тексты, задачи, статусы и созданные объекты вернутся к исходным из опубликованной версии.')) return;
    var RESET_KEYS = [
      'po-tasks', 'po-texts', 'po-proj-statuses',
      'po-new-projects', 'po-new-programs', 'po-prog-months',
      'po-project-months-v1', 'po-project-dir-order',
      'plan-timeline-assignments-v2', 'plan-timeline-statuses-v1',
      'po-doc-edited', 'po-published-at', 'po-people-overrides',
      'po-people-local-edit', 'po-people-after-reload-mode'
    ];
    RESET_KEYS.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    location.reload();
  });

  /* ================================================================
     SANITIZE HTML (allow only safe formatting)
  ================================================================ */
  // sanitize — в js/utils/html.js

  window.cssVar = function(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };

  window.showToast = function(msg, type) {
    var toast = document.createElement('div');
    toast.className = 'po-toast po-toast-' + (type || 'info');
    toast.textContent = msg;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('is-visible'); });
    setTimeout(function() {
      toast.classList.remove('is-visible');
      setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 3500);
  };

  /* ================================================================
     INIT
  ================================================================ */
  applyDeleted();
  restoreNewPrograms();
  restoreNewProjects();
  migrateProjectMonths();    /* after DOM is populated with new progs/projs */
  assignProjectIds();        /* add data-project-id to all li.project */
  migrateHardcodedTasks();   /* must run before initTasks */
  migrateTasksV2();
  initTextEditing();
  injectProjStatuses();
  initTasks();
  restoreProgramMonths();
  renderTimeline();          /* initial render based on project months */
  initAddProgramBtns();
  initAddProjectBtns();
  hideOldTasksWrap();
  initDeleteButtons();
  initProjectsDnD();
  setTextEditable(document.body.getAttribute('data-mode') === 'edit');
  (function () { var _pa = localStorage.getItem('po-doc-edited') || localStorage.getItem('po-published-at'); if (_pa) updatePubStamp(_pa); }());
  var CLEANUP_VERSION = 'v1-2026-06-03';
  var overlay = document.getElementById('po-load-overlay');
  loadRemote().finally(function() {
    if (overlay) {
      overlay.classList.add('is-done');
      setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }
    if (localStorage.getItem('po-cleanup-done') !== CLEANUP_VERSION) {
      cleanStaleDrafts();
      localStorage.setItem('po-cleanup-done', CLEANUP_VERSION);
    }
  });

})();
