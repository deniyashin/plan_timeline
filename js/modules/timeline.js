// js/modules/timeline.js — тайм-лайн: renderTimeline, getProjectMonth, updateMonthStats
// Извлечено из plan_timeline.js строки 14-186
// Зависимости: lsGet/lsSet (storage.js), isValidMonthKey/monthKeyFromDomSection (months.js)

(function() {
  var LS_PROJMONTHS_V1 = 'po-project-months-v1';
  function migrateProjectMonths() {
    if (localStorage.getItem(LS_PROJMONTHS_V1)) return;
    var progMonths = lsGet('po-prog-months');
    var result = {};
    document.querySelectorAll('li.project').forEach(function (li) {
      var pidEl = li.querySelector('.project-id-mono');
      var projectId = pidEl ? pidEl.textContent.trim() : '';
      if (!projectId) return;
      var programEl = li.closest('.program');
      var programId = programEl ? programEl.getAttribute('data-program-id') : null;
      var section   = li.closest('section.month');
      var monthKey  = 'unscheduled';
      if (programId && progMonths[programId] && isValidMonthKey(progMonths[programId])) {
        monthKey = progMonths[programId];
      } else if (section) {
        monthKey = monthKeyFromDomSection(section);
      }
      result[projectId] = monthKey;
    });
    try { localStorage.setItem(LS_PROJMONTHS_V1, JSON.stringify(result)); } catch (e) {}
  }

  /* ================================================================
     ASSIGN data-project-id ATTRIBUTES  (Задача 3)
  ================================================================ */
  function assignProjectIds() {
    document.querySelectorAll('li.project').forEach(function (li) {
      var pidEl = li.querySelector('.project-id-mono');
      var projectId = pidEl ? pidEl.textContent.trim() : '';
      if (projectId && !li.dataset.projectId) {
        li.dataset.projectId = projectId;
      }
    });
  }

  /* ================================================================
     READ / WRITE PROJECT MONTH  (Задача 4)
  ================================================================ */
  function getProjectMonth(projectId) {
    var store = lsGet(LS_PROJMONTHS_V1);
    var key = store[projectId];
    return isValidMonthKey(key) ? key : 'unscheduled';
  }

  function setProjectMonth(projectId, monthKey) {
    var store = lsGet(LS_PROJMONTHS_V1);
    store[projectId] = isValidMonthKey(monthKey) ? monthKey : 'unscheduled';
    try { localStorage.setItem(LS_PROJMONTHS_V1, JSON.stringify(store)); flash(); } catch (e) {}
  }

  /* ================================================================
     UPDATE MONTH STATS  (Задача 9)
  ================================================================ */
  function updateMonthStats(sectionEl, store) {
    var statsEl = sectionEl.querySelector('.month-stats');
    if (!statsEl) return;
    var monthKey = monthKeyFromDomSection(sectionEl);
    /* Use master projects only (clones would double-count) */
    var allProjects = Array.from(sectionEl.querySelectorAll('li.project[data-project-id]'));
    var projectsInMonth = allProjects.filter(function (li) {
      /* Skip projects inside clones */
      if (li.closest('.program[data-pm-clone]')) return false;
      var k = store && store[li.dataset.projectId];
      var key = isValidMonthKey(k) ? k : 'unscheduled';
      return key === monthKey;
    });
    var programIds = new Set();
    projectsInMonth.forEach(function (li) {
      var prog = li.closest('.program[data-program-id]');
      if (prog) programIds.add(prog.getAttribute('data-program-id'));
    });
    statsEl.textContent = programIds.size + ' программ · ' + projectsInMonth.length + ' проектов';
  }

  /* ================================================================
     RENDER TIMELINE  (Задача 5)
  ================================================================ */
  function renderTimeline() {
    /* 0. Ensure every project has data-project-id (covers dynamically added projects) */
    assignProjectIds();

    /* 1. Remove all clone program instances */
    document.querySelectorAll('.program[data-pm-clone]').forEach(function (el) { el.remove(); });

    /* 2. Ensure all original programs are marked as master */
    document.querySelectorAll('.program[data-program-id]').forEach(function (prog) {
      prog.setAttribute('data-pm-master', '');
    });

    /* 3. Build month→{progId→[li]} map — read store once for performance */
    var monthStore = lsGet(LS_PROJMONTHS_V1);
    function _projMonth(pid) {
      var k = monthStore[pid];
      return isValidMonthKey(k) ? k : 'unscheduled';
    }

    var byMonth = {};
    document.querySelectorAll('li.project[data-project-id]').forEach(function (li) {
      var pid = li.dataset.projectId;
      var monthKey = _projMonth(pid);
      var progEl = li.closest('.program[data-pm-master]');
      if (!progEl) return;
      var progId = progEl.getAttribute('data-program-id');
      if (!byMonth[monthKey]) byMonth[monthKey] = {};
      if (!byMonth[monthKey][progId]) byMonth[monthKey][progId] = [];
      byMonth[monthKey][progId].push(li);
    });

    /* 4. Reset all project visibility in master programs */
    document.querySelectorAll('.program[data-pm-master] li.project').forEach(function (li) {
      li.style.display = '';
    });

    /* 5. For each month section manage program instances */
    MONTHS.forEach(function (m) {
      var sec = document.getElementById(m.domId);
      if (!sec) return;
      var progList = sec.querySelector('.program-list');
      if (!progList) return;
      var monthPrograms = byMonth[m.key] || {};

      Object.keys(monthPrograms).forEach(function (progId) {
        var masterProg = progList.querySelector('.program[data-pm-master][data-program-id="' + CSS.escape(progId) + '"]');

        if (masterProg) {
          /* Master lives here: show only projects for this month */
          masterProg.querySelectorAll('li.project[data-project-id]').forEach(function (li) {
            li.style.display = (_projMonth(li.dataset.projectId) === m.key) ? '' : 'none';
          });
          masterProg.style.display = '';
        } else {
          /* Need a clone of the master in this section */
          var globalMaster = document.querySelector('.program[data-pm-master][data-program-id="' + CSS.escape(progId) + '"]');
          if (!globalMaster) return;
          var clone = globalMaster.cloneNode(true);
          clone.setAttribute('data-pm-clone', '');
          clone.removeAttribute('data-pm-master');
          /* Hide action buttons that rely on direct event listeners and don't work on clones */
          clone.querySelectorAll('.po-delete-btn, .po-add-proj-btn').forEach(function (btn) {
            btn.style.display = 'none';
          });
          /* Show only projects for this month */
          clone.querySelectorAll('li.project[data-project-id]').forEach(function (li) {
            li.style.display = (_projMonth(li.dataset.projectId) === m.key) ? '' : 'none';
          });
          /* Hide month-select row in clones (edit actions belong to the master) */
          clone.querySelectorAll('.po-proj-month-row').forEach(function (r) { r.style.display = 'none'; });
          var addBtn = progList.querySelector('.po-add-prog-btn');
          if (addBtn) progList.insertBefore(clone, addBtn);
          else progList.appendChild(clone);
        }
      });

      /* Hide master programs in this section that have 0 projects for this month */
      progList.querySelectorAll('.program[data-pm-master]').forEach(function (prog) {
        var progId = prog.getAttribute('data-program-id');
        if (!monthPrograms[progId]) {
          prog.style.display = 'none';
        }
      });

      /* Update month stats */
      updateMonthStats(sec, monthStore);
    });

    /* 6. Re-apply active filter state to newly created clones */
    document.dispatchEvent(new CustomEvent('po-timeline-rendered'));
  }
  window.migrateProjectMonths  = migrateProjectMonths;
  window.assignProjectIds      = assignProjectIds;
  window.getProjectMonth       = getProjectMonth;
  window.setProjectMonth       = setProjectMonth;
  window.updateMonthStats      = updateMonthStats;
  window.renderTimeline        = renderTimeline;
})();