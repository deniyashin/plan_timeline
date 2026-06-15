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

    /* 2b. Brief mode: каждая программа один раз, все проекты видны */
    if (document.body.getAttribute('data-mode') === 'brief') {
      document.querySelectorAll('.program[data-pm-master]').forEach(function (prog) {
        prog.style.display = '';
        prog.querySelectorAll('li.project').forEach(function (li) { li.style.display = ''; });
      });
      var _store = lsGet(LS_PROJMONTHS_V1);
      MONTHS.forEach(function (m) {
        var sec = document.getElementById(m.domId);
        if (sec) updateMonthStats(sec, _store);
      });
      document.dispatchEvent(new CustomEvent('po-timeline-rendered'));
      return;
    }

    /* 3. Build month→{progId→[li]} map — read store once for performance */
    var monthStore = lsGet(LS_PROJMONTHS_V1);
    /* Порядок программ по DOM для правильной вставки клонов */
    var _globalProgOrder = Array.from(
      document.querySelectorAll('.program[data-pm-master][data-program-id]')
    ).map(function(p) { return p.getAttribute('data-program-id'); });
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

      /* Сортируем программы месяца по глобальному порядку из DOM */
      var _monthProgIds = Object.keys(monthPrograms);
      _monthProgIds.sort(function(a, b) {
        var ia = _globalProgOrder.indexOf(a);
        var ib = _globalProgOrder.indexOf(b);
        return (ia === -1 ? 99999 : ia) - (ib === -1 ? 99999 : ib);
      });
      _monthProgIds.forEach(function (progId) {
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
          clone.querySelectorAll('.po-proj-month-row, .po-proj-order-row').forEach(function (r) { r.style.display = 'none'; });
          var addBtn = progList.querySelector('.po-add-prog-btn');
          if (addBtn) progList.insertBefore(clone, addBtn);
          else progList.appendChild(clone);
        }
      });

      /* Hide master programs in this section that have 0 projects for this month */
      progList.querySelectorAll('.program[data-pm-master]').forEach(function (prog) {
        var progId = prog.getAttribute('data-program-id');
        if (!monthPrograms[progId] && !prog.classList.contains('po-created-prog')) {
          prog.style.display = 'none';
        }
      });

      /* Update month stats */
      updateMonthStats(sec, monthStore);
    });

    /* 6. Sync project-month-select values in master programs to current stored month */
    document.querySelectorAll('.program[data-pm-master] li.project[data-project-id] .project-month-select').forEach(function(sel) {
      var proj = sel.closest('.project[data-project-id]');
      if (!proj) return;
      var newVal = _projMonth(proj.dataset.projectId);
      if (sel.value !== newVal) sel.value = newVal;
    });

    /* 7. Re-apply active filter state to newly created clones */
    document.dispatchEvent(new CustomEvent('po-timeline-rendered'));
  }
  /* ================================================================
     PROJECT DIR-ORDER  — хранит порядок проектов внутри направления
  ================================================================ */
  var LS_DIR_ORDER = 'po-project-dir-order';

  function getDirOrder(projectId) {
    var store = lsGet(LS_DIR_ORDER);
    var v = store[projectId];
    return (v !== undefined && v !== null && v !== '') ? parseInt(v, 10) : 99999;
  }

  function setDirOrder(projectId, val) {
    var store = lsGet(LS_DIR_ORDER);
    var n = parseInt(val, 10);
    if (isNaN(n) || n < 1) { delete store[projectId]; }
    else { store[projectId] = n; }
    try {
      localStorage.setItem(LS_DIR_ORDER, JSON.stringify(store));
      if (typeof window.flash === 'function') window.flash();
    } catch (e) {}
  }

  /* ================================================================
     RENDER DIRECTION GROUPS  (группировка по направлениям I-1…I-5)
     Вызывается из applyFilters после каждой перерисовки/фильтрации.
  ================================================================ */
  function renderDirectionGroups() {
    /* 1. Восстановить оригинальные индексы; убрать dir-grp */
    document.querySelectorAll('.project-index[data-orig-idx]').forEach(function(el) {
      el.textContent = el.getAttribute('data-orig-idx');
      el.removeAttribute('data-orig-idx');
    });
    document.querySelectorAll('li.project[data-dir-grp]').forEach(function(p) { p.removeAttribute('data-dir-grp'); });
    /* 2. Убрать старые разделители; сбросить order у программ и проектов */
    document.querySelectorAll('.direction-separator').forEach(function(el) { el.remove(); });
    document.querySelectorAll('.program').forEach(function(p) { p.style.removeProperty('order'); });
    document.querySelectorAll('li.project').forEach(function(p) { p.style.removeProperty('order'); });

    var mode = document.body.getAttribute('data-mode');
    var baseMode = document.body.getAttribute('data-base-mode');
    if (mode !== 'projects' && !(mode === 'edit' && baseMode === 'projects')) return;

    var DIRECTION_ORDER = ['U-ALL-I-1', 'U-ALL-I-2', 'U-ALL-I-3', 'U-ALL-I-4', 'U-ALL-I-5', 'out'];
    var CHANGE_COLORS   = (window.PLAN_CONFIG && window.PLAN_CONFIG.CHANGE_COLORS) || {};
    var CHANGE_NUM      = {'U-ALL-I-1':'1','U-ALL-I-2':'2','U-ALL-I-3':'3','U-ALL-I-4':'4','U-ALL-I-5':'5','out':'0'};
    var DIR_LABELS      = {'U-ALL-I-1':'I-1','U-ALL-I-2':'I-2','U-ALL-I-3':'I-3','U-ALL-I-4':'I-4','U-ALL-I-5':'I-5','out':'—'};
    var orderStore = lsGet(LS_DIR_ORDER);

    function _ord(pid) {
      var v = orderStore[pid];
      return (v !== undefined && v !== null && v !== '') ? parseInt(v, 10) : 99999;
    }

    document.querySelectorAll('section.month').forEach(function(sec) {
      var progList = sec.querySelector('.program-list');
      if (!progList) return;

      DIRECTION_ORDER.forEach(function(dir, i) {
        /* Видимые программы этого направления в данной секции */
        var progsForDir = Array.from(
          progList.querySelectorAll('.program[data-change="' + dir + '"]')
        ).filter(function(p) { return p.style.display !== 'none'; });

        if (progsForDir.length === 0) return;

        /* Сортируем программы по минимальному dir-order их видимых проектов */
        progsForDir.sort(function(a, b) {
          function minOrd(prog) {
            var projs = Array.from(prog.querySelectorAll('li.project')).filter(function(pr) {
              return pr.style.display !== 'none';
            });
            if (!projs.length) return 99999;
            return Math.min.apply(null, projs.map(function(pr) { return _ord(pr.dataset.projectId || ''); }));
          }
          return minOrd(a) - minOrd(b);
        });

        /* CSS order: блок направления i занимает диапазон i*1000 … i*1000+999 */
        var base = i * 1000;
        progsForDir.forEach(function(p, pi) { p.style.order = String(base + 1 + pi); });

        /* Для каждой программы: сортируем и нумеруем видимые проекты */
        var seq = 1;
        progsForDir.forEach(function(prog) {
          var visProjs = Array.from(prog.querySelectorAll('li.project')).filter(function(pr) {
            return pr.style.display !== 'none';
          });
          /* Сортируем проекты внутри программы по dir-order */
          visProjs.sort(function(a, b) {
            return _ord(a.dataset.projectId || '') - _ord(b.dataset.projectId || '');
          });
          /* Выставляем CSS order на li.project (flex-children в project-list) */
          visProjs.forEach(function(pr) {
            var o = _ord(pr.dataset.projectId || '');
            pr.style.order = String(o >= 99999 ? 99999 : o);
          });
          /* Сквозная нумерация + отметка направления для DnD */
          visProjs.forEach(function(pr) {
            pr.setAttribute('data-dir-grp', dir);
            var idxEl = pr.querySelector('.project-index');
            if (!idxEl) { seq++; return; }
            if (!idxEl.hasAttribute('data-orig-idx')) {
              idxEl.setAttribute('data-orig-idx', idxEl.textContent);
            }
            idxEl.textContent = String(seq++);
          });
        });

        /* Счётчик проектов для разделителя */
        var projCount = progsForDir.reduce(function(n, prog) {
          return n + Array.from(prog.querySelectorAll('li.project')).filter(function(pr) {
            return pr.style.display !== 'none';
          }).length;
        }, 0);

        /* Строим разделитель-заголовок направления */
        var color = CHANGE_COLORS[CHANGE_NUM[dir]] || '#5A554C';
        var label = DIR_LABELS[dir];
        var sep = document.createElement('li');
        sep.className = 'direction-separator';
        sep.setAttribute('data-direction', dir);
        sep.style.order = String(base);
        sep.innerHTML =
          '<span class="dir-dot" style="background:' + color + '"></span>' +
          '<span class="dir-label">' + escHtml(label) + '</span>' +
          '<span class="dir-count">' + projCount + '</span>';
        progList.appendChild(sep);
      });
    });
  }

  window.migrateProjectMonths    = migrateProjectMonths;
  window.assignProjectIds        = assignProjectIds;
  window.getProjectMonth         = getProjectMonth;
  window.setProjectMonth         = setProjectMonth;
  window.getDirOrder             = getDirOrder;
  window.setDirOrder             = setDirOrder;
  window.updateMonthStats        = updateMonthStats;
  window.renderTimeline          = renderTimeline;
  window.renderDirectionGroups   = renderDirectionGroups;

  /* ================================================================
     DIRECTION DnD — перетаскивание проектов внутри направления
  ================================================================ */
  (function () {
    var _dragProj   = null;
    var _dragDir    = null;
    var _dragSec    = null;
    var _dropTarget = null;
    var _dropBefore = true;

    function clearDrop() {
      if (_dropTarget) {
        _dropTarget.classList.remove('po-dir-drop-before', 'po-dir-drop-after');
        _dropTarget = null;
      }
    }

    /* Собирает видимые проекты направления в секции в текущем визуальном порядке */
    function getProjsInOrder(dirKey, secEl) {
      var progList = secEl.querySelector('.program-list');
      if (!progList) return [];
      var progs = Array.from(progList.querySelectorAll('.program[data-change="' + dirKey + '"]'))
        .filter(function(p) { return p.style.display !== 'none'; })
        .sort(function(a, b) { return (parseInt(a.style.order || '0', 10)) - (parseInt(b.style.order || '0', 10)); });
      var result = [];
      progs.forEach(function(prog) {
        Array.from(prog.querySelectorAll('li.project'))
          .filter(function(pr) { return pr.style.display !== 'none'; })
          .sort(function(a, b) { return (parseInt(a.style.order || '0', 10)) - (parseInt(b.style.order || '0', 10)); })
          .forEach(function(pr) { result.push(pr); });
      });
      return result;
    }

    if (!document._dirDndDelegated) {
      document._dirDndDelegated = true;

      document.addEventListener('dragstart', function(e) {
        var _dm = document.body.getAttribute('data-mode');
        var _dbm = document.body.getAttribute('data-base-mode');
        if (_dm !== 'projects' && !(_dm === 'edit' && _dbm === 'projects')) return;
        var proj = e.target.closest('li.project[data-project-id][data-dir-grp]');
        if (!proj) return;
        _dragProj = proj;
        _dragDir  = proj.getAttribute('data-dir-grp');
        _dragSec  = proj.closest('section.month');
        setTimeout(function() { if (_dragProj) _dragProj.classList.add('po-dir-dragging'); }, 0);
      });

      document.addEventListener('dragover', function(e) {
        if (!_dragProj) return;
        var proj = e.target.closest('li.project[data-dir-grp]');
        if (!proj || proj === _dragProj) { clearDrop(); return; }
        if (proj.getAttribute('data-dir-grp') !== _dragDir) return;
        if (proj.closest('section.month') !== _dragSec) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var rect = proj.getBoundingClientRect();
        _dropBefore = e.clientY < rect.top + rect.height / 2;
        if (_dropTarget !== proj) { clearDrop(); _dropTarget = proj; }
        proj.classList.toggle('po-dir-drop-before', _dropBefore);
        proj.classList.toggle('po-dir-drop-after', !_dropBefore);
      });

      document.addEventListener('drop', function(e) {
        var tgt = _dropTarget;
        clearDrop();
        if (!_dragProj || !tgt) return;
        if (tgt.getAttribute('data-dir-grp') !== _dragDir) return;
        e.preventDefault();

        var all = getProjsInOrder(_dragDir, _dragSec);
        var di = all.indexOf(_dragProj);
        if (di !== -1) all.splice(di, 1);
        var ti = all.indexOf(tgt);
        if (ti === -1) return;
        all.splice(_dropBefore ? ti : ti + 1, 0, _dragProj);

        all.forEach(function(pr, idx) {
          var pid = pr.dataset.projectId || '';
          if (pid) setDirOrder(pid, idx + 1);
        });

        if (_dragProj) _dragProj.classList.remove('po-dir-dragging');
        _dragProj = null; _dragDir = null; _dragSec = null;

        renderDirectionGroups();
      });

      document.addEventListener('dragend', function() {
        clearDrop();
        if (_dragProj) { _dragProj.classList.remove('po-dir-dragging'); _dragProj = null; }
        _dragDir = null; _dragSec = null;
      });
    }
  }());
})();