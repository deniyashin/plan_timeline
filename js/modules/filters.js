// js/modules/filters.js — назначения и фильтрация программ
// Извлечено из plan_timeline.js строки 1-492 (IIFE "Filters + UI")
// Зависимости: window.PLAN_CONFIG, escHtml (html.js), getProgramInstances (months.js)

(function() {
  const PEOPLE             = window.PLAN_CONFIG.PEOPLE;
  const UNITS              = window.PLAN_CONFIG.UNITS;
  const ROLES              = window.PLAN_CONFIG.ROLES;
  const DEFAULT_ASSIGNMENTS = window.PLAN_CONFIG.DEFAULT_ASSIGNMENTS;
  const ASSIGNEES = Object.assign({}, PEOPLE, UNITS);
  window.ASSIGNEES = ASSIGNEES;
  window.UNITS = UNITS;
  window.PEOPLE = PEOPLE;
  window.ROLES = ROLES;
  const ROLE_KEYS = ['anchor', 'owner', 'methodologist'];
  const STORAGE_KEY = 'plan-timeline-assignments-v2';

  function loadOverrides() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (e) {
      console.warn('Could not load overrides', e);
      return {};
    }
  }
  function saveOverrides(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      if (typeof window.flash === 'function') window.flash();
    } catch (e) {
      window.showToast('Не удалось сохранить ...', 'error');
    }
  }

  let overrides = loadOverrides();

  function effectiveAssignments(programId) {
    if (overrides[programId]) {
      const asn = overrides[programId];
      return {
        anchor: Array.isArray(asn.anchor) ? asn.anchor : [],
        owner: Array.isArray(asn.owner) ? asn.owner : [],
        methodologist: Array.isArray(asn.methodologist) ? asn.methodologist : [],
      };
    }
    const def = DEFAULT_ASSIGNMENTS[programId];
    if (!def) return {anchor: [], owner: [], methodologist: []};
    return {
      anchor: (def.anchor || []).slice(),
      owner: (def.owner || []).slice(),
      methodologist: (def.methodologist || []).slice(),
    };
  }

  function assigneeChipHTML(code, editable, roleKey) {
    const a = ASSIGNEES[code];
    if (!a) {
      return '<span class="assignee-chip assignee-chip-empty">'
           + '<span class="assignee-init">—</span>'
           + '<span class="assignee-last">не назначен</span></span>';
    }
    const isUnit = UNITS.hasOwnProperty(code);
    const unitCls = isUnit ? ' assignee-chip-unit' : '';
    const editCls = editable ? ' editable' : '';
    const removeBtn = editable ? `<button type="button" class="assignee-remove" data-action="remove-assignee" data-role-key="${escHtml(roleKey)}" data-assignee-code="${escHtml(code)}" aria-label="Убрать">×</button>` : '';
    return `<span class="assignee-chip${editCls}${unitCls}" data-assignee-code="${escHtml(code)}" title="${escHtml(a.full)} · ${escHtml(a.role)}">`
         + `<span class="assignee-init">${escHtml(a.initials)}</span>`
         + `<span class="assignee-last">${escHtml(a.last)}</span>`
         + removeBtn
         + `</span>`;
  }

  function compactRoleLineHTML(roleKey, codes) {
    const info = ROLES[roleKey];
    let chipsHtml;
    if (codes.length) {
      chipsHtml = codes.map(c => assigneeChipHTML(c, false, roleKey).replace('assignee-chip', 'assignee-chip assignee-chip-sm')).join('');
    } else {
      chipsHtml = '<span class="assignee-chip assignee-chip-sm assignee-chip-empty"><span class="assignee-init">—</span></span>';
    }
    return `<span class="role-line role-line-compact" data-role="${escHtml(roleKey)}" title="${escHtml(info.label)} · ${escHtml(info.hint)}"><span class="role-mark" aria-hidden="true">${escHtml(info.short)}</span>${chipsHtml}</span>`;
  }

  function refreshProgramDisplay(progEl) {
    const id = progEl.getAttribute('data-program-id');
    const asn = effectiveAssignments(id);
    ROLE_KEYS.forEach(rk => {
      progEl.setAttribute(`data-assignees-${rk}`, (asn[rk] || []).join(' '));
    });
    const all = [];
    ROLE_KEYS.forEach(rk => (asn[rk] || []).forEach(c => { if (!all.includes(c)) all.push(c); }));
    progEl.setAttribute('data-assignees-all', all.join(' '));
    const headSlot = progEl.querySelector('[data-roles-slot]');
    if (headSlot) {
      headSlot.innerHTML = ROLE_KEYS.map(rk => compactRoleLineHTML(rk, asn[rk] || [])).join('');
    }
    ROLE_KEYS.forEach(rk => {
      const row = progEl.querySelector(`.role-editor-row[data-role-key="${rk}"]`);
      if (!row) return;
      const current = row.querySelector('.role-assignees-current');
      const codes = asn[rk] || [];
      if (codes.length) {
        current.innerHTML = codes.map(c => assigneeChipHTML(c, true, rk)).join('');
      } else {
        current.innerHTML = '<span class="assignee-chip assignee-chip-empty"><span class="assignee-init">—</span><span class="assignee-last">не назначен</span></span>';
      }
    });
  }

  document.querySelectorAll('.program[data-program-id]').forEach(prog => {
    if (overrides[prog.getAttribute('data-program-id')]) refreshProgramDisplay(prog);
  });

  document.addEventListener('click', function(e) {
    if (e.target.closest('.assignments-editor')) return;
    const progHead = e.target.closest('.program-head');
    if (progHead) {
      if (document.body.getAttribute('data-mode') === 'edit' && e.target.closest('.po-editable')) return;
      const prog = progHead.parentElement;
      const body = prog.querySelector('.program-body');
      const open = prog.classList.toggle('is-open');
      body.hidden = !open;
      progHead.setAttribute('aria-expanded', open);
      return;
    }
    const projHead = e.target.closest('.project-head');
    if (projHead) {
      if (document.body.getAttribute('data-mode') === 'edit' && e.target.closest('.po-editable')) return;
      const proj = projHead.parentElement;
      const body = proj.querySelector('.project-body');
      const open = proj.classList.toggle('is-open');
      body.hidden = !open;
      projHead.setAttribute('aria-expanded', open);
      return;
    }
  });

  document.addEventListener('click', function(e) {
    const addBtn = e.target.closest('[data-action="add-assignee"]');
    if (addBtn) {
      e.stopPropagation();
      const row = addBtn.closest('.role-editor-row');
      const roleKey = row.getAttribute('data-role-key');
      const editor = row.closest('.assignments-editor');
      const progId = editor.getAttribute('data-program-id');
      const current = effectiveAssignments(progId);
      const assigned = current[roleKey] || [];

      const items = [{ value: '', label: 'Не назначен', clear: true }];
      Object.entries(ASSIGNEES).forEach(function (pair) {
        var code = pair[0], a = pair[1];
        if (!assigned.includes(code)) {
          items.push({
            value: code,
            label: a.full || a.last || code,
            avatar: { initials: a.initials || code, isUnit: UNITS.hasOwnProperty(code) }
          });
        }
      });

      window.createDropdown(addBtn, items, function (val) {
        const cur = effectiveAssignments(progId);
        if (!val || val === '') {
          cur[roleKey] = [];
        } else if (!cur[roleKey].includes(val)) {
          cur[roleKey] = cur[roleKey].concat([val]);
        }
        overrides[progId] = cur;
        saveOverrides(overrides);
        getProgramInstances(progId).forEach(prog => refreshProgramDisplay(prog));
        updateFilterCounts();
        applyFilters();
        const name = val ? (ASSIGNEES[val] && ASSIGNEES[val].full) || val : 'не назначен';
        window.showToast(`Обновлено: ${ROLES[roleKey].label} → ${name}`, 'info');
      });
      return;
    }
    const removeBtn = e.target.closest('[data-action="remove-assignee"]');
    if (removeBtn) {
      e.stopPropagation();
      const editor = removeBtn.closest('.assignments-editor');
      const progId = editor.getAttribute('data-program-id');
      const roleKey = removeBtn.getAttribute('data-role-key');
      const code = removeBtn.getAttribute('data-assignee-code');
      const current = effectiveAssignments(progId);
      current[roleKey] = (current[roleKey] || []).filter(c => c !== code);
      overrides[progId] = current;
      saveOverrides(overrides);
      getProgramInstances(progId).forEach(prog => refreshProgramDisplay(prog));
      updateFilterCounts();
      applyFilters();
      const name = (ASSIGNEES[code] && ASSIGNEES[code].full) || code;
      window.showToast(`Убрано из роли "${ROLES[roleKey].label}": ${name}`, 'info');
      return;
    }
  });

  function updateDirectionCounts() {
    var counts = {};
    /* Считаем все мастер-проекты (игнорируем display:none, который projects-mode
       выставляет для управления видимостью по месяцам — это не фильтрация). */
    document.querySelectorAll('.program:not([data-pm-clone]) li.project[data-project-id]').forEach(function(proj) {
      var prog = proj.closest('.program');
      if (!prog) return;
      var change = prog.getAttribute('data-change') || 'out';
      counts[change] = (counts[change] || 0) + 1;
    });
    document.querySelectorAll('[data-change-filter]').forEach(function(btn) {
      var key = btn.getAttribute('data-change-filter');
      var n = counts[key] || 0;
      var el = btn.querySelector('.cf-count');
      if (!el) {
        el = document.createElement('span');
        el.className = 'cf-count';
        el.setAttribute('aria-hidden', 'true');
        btn.appendChild(el);
      }
      el.textContent = n > 0 ? String(n) : '';
    });
  }

  function updateFilterCounts() {
    const roleCounts = {};
    let noneCount = 0;
    document.querySelectorAll('.program[data-program-id]:not([data-pm-clone])').forEach(prog => {
      const all = (prog.getAttribute('data-assignees-all') || '').split(' ').filter(Boolean);
      if (all.length === 0) noneCount++;
      const inc = (attr, role) => {
        (prog.getAttribute(attr) || '').split(' ').filter(Boolean).forEach(id => {
          if (!roleCounts[id]) roleCounts[id] = { anchor: 0, owner: 0, methodologist: 0 };
          roleCounts[id][role]++;
        });
      };
      inc('data-assignees-anchor', 'anchor');
      inc('data-assignees-owner', 'owner');
      inc('data-assignees-methodologist', 'methodologist');
    });
    document.querySelectorAll('[data-person-filter]').forEach(btn => {
      const v = btn.getAttribute('data-person-filter');
      if (v === '__none__') {
        btn.setAttribute('title', `Программы без назначений · ${noneCount}`);
      } else {
        const a = ASSIGNEES[v];
        const r = roleCounts[v] || { anchor: 0, owner: 0, methodologist: 0 };
        const total = r.anchor + r.owner + r.methodologist;
        if (a) btn.setAttribute('title', `${a.full} · ${a.role} · Инициатор: ${r.anchor} · Владелец: ${r.owner} · Методолог: ${r.methodologist} · Итого: ${total}`);
      }
    });
  }
  updateFilterCounts();
  updateDirectionCounts();

  const filterBar = document.querySelector('.filter-bar');
  const filterToggle = document.getElementById('filter-toggle');
  function setCollapsed(collapsed) {
    filterBar.setAttribute('data-collapsed', String(collapsed));
    filterToggle.setAttribute('aria-expanded', String(!collapsed));
  }
  filterToggle.addEventListener('click', () => {
    const collapsed = filterBar.getAttribute('data-collapsed') === 'true';
    setCollapsed(!collapsed);
  });
  document.addEventListener('click', function(e) {
    if (filterBar.getAttribute('data-collapsed') === 'true') return;
    if (filterBar.contains(e.target)) return;
    setCollapsed(true);
  });

  const state = { change: null, contour: null, source: null, role: 'any', persons: [] };
  const body = document.body;
  const summaryEl = document.getElementById('filter-summary');

  function formatSummary() {
    const parts = [];
    if (state.source) parts.push(`тип: ${state.source === 'U' ? 'Учредители' : 'Топ-менеджмент'}`);
    if (state.change) {
      const ch = document.querySelector(`.filter-chip[data-change-filter="${state.change}"]`);
      const codeEl = ch ? ch.querySelector('.cf-code') : null;
      const label = codeEl ? codeEl.textContent : state.change;
      parts.push(`изменение ${label}`);
    }
    if (state.persons.length > 0) {
      const personLabels = state.persons.map(p => p === '__none__' ? 'не назначен' : (ASSIGNEES[p] && ASSIGNEES[p].last) || p).join(', ');
      const rolePrefix = state.role !== 'any' ? ROLES[state.role].label.toLowerCase() + ': ' : '';
      parts.push(`${rolePrefix}${personLabels}`);
    }
    if (state.contour) parts.push(`контур: ${state.contour}`);
    return parts;
  }

  function applyFilters() {
    const hasFilter = !!(state.change || state.contour || state.source || state.persons.length);
    body.classList.toggle('has-filter', hasFilter);
    const parts = formatSummary();
    if (parts.length) {
      summaryEl.textContent = parts.join(' · ');
      summaryEl.classList.add('has-active');
    } else {
      summaryEl.textContent = 'все элементы';
      summaryEl.classList.remove('has-active');
    }
    document.querySelectorAll('[data-change-filter]').forEach(el => {
      const on = !!(state.change && el.getAttribute('data-change-filter') === state.change);
      el.classList.toggle('filter-on', on);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-contour-filter]').forEach(el => {
      el.classList.toggle('filter-on', state.contour && el.getAttribute('data-contour-filter') === state.contour);
    });
    document.querySelectorAll('[data-source-filter]').forEach(el => {
      el.classList.toggle('filter-on', state.source && el.getAttribute('data-source-filter') === state.source);
    });
    document.querySelectorAll('[data-person-filter]').forEach(el => {
      el.classList.toggle('filter-on', state.persons.includes(el.getAttribute('data-person-filter')));
    });
    document.querySelectorAll('[data-role-filter]').forEach(el => {
      const on = el.getAttribute('data-role-filter') === state.role;
      el.classList.toggle('filter-on', on);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const programs = document.querySelectorAll('.program');
    programs.forEach(prog => {
      const normalizeKey = k => k === 'BO' ? 'OA' : k;
      const attrAll = (prog.getAttribute('data-assignees-all') || '').split(' ').filter(Boolean).map(normalizeKey);
      let personAssignees;
      if (state.role === 'any') personAssignees = attrAll;
      else personAssignees = (prog.getAttribute(`data-assignees-${state.role}`) || '').split(' ').filter(Boolean).map(normalizeKey);
      const changeMatch  = !state.change   || prog.getAttribute('data-change')   === state.change;
      const contourMatch = !state.contour  || prog.getAttribute('data-contour')  === state.contour;
      const sourceMatch  = !state.source   || prog.getAttribute('data-source')   === state.source;
      let personMatch = true;
      if (state.persons.length > 0) {
        personMatch = state.persons.some(p => p === '__none__' ? personAssignees.length === 0 : personAssignees.indexOf(p) >= 0);
      }
      const selfMatches = changeMatch && contourMatch && sourceMatch && personMatch;
      const projs = prog.querySelectorAll('.project');
      let anyProjMatch = false;
      projs.forEach(proj => {
        const cm  = !state.change  || proj.getAttribute('data-change')  === state.change;
        const ctm = !state.contour || proj.getAttribute('data-contour') === state.contour;
        const sm  = !state.source  || proj.getAttribute('data-source')  === state.source;
        const pm = personMatch;
        const match = cm && ctm && sm && pm;
        proj.classList.toggle('match-filter', match);
        if (match) anyProjMatch = true;
      });
      const shown = selfMatches || anyProjMatch;
      prog.classList.toggle('match-filter', shown);
    });
    document.querySelectorAll('.month').forEach(mo => {
      const visible = mo.querySelectorAll('.program.match-filter').length;
      const isEmpty = mo.classList.contains('month-empty');
      if (hasFilter) {
        mo.style.display = (visible === 0 && !isEmpty) || (isEmpty) ? 'none' : '';
      } else {
        mo.style.display = '';
      }
    });
    document.querySelectorAll('section.month').forEach(function (section) {
      section.querySelectorAll('li.program').forEach(function (prog) {
        if (prog.style.display === 'none') return;
        var projItems = Array.from(prog.querySelectorAll('li.project'));
        if (projItems.length === 0) return; /* нет проектов — программу не скрываем */
        var hasVisible = projItems.some(function (li) {
          return li.style.display !== 'none';
        });
        if (!hasVisible) prog.style.display = 'none';
      });
      if (hasFilter) {
        var hasProg = Array.from(section.querySelectorAll('li.program')).some(function (prog) {
          return prog.style.display !== 'none' && prog.classList.contains('match-filter');
        });
        if (!hasProg && !section.classList.contains('month-empty')) section.style.display = 'none';
      }
    });
    (function() {
      var navLinks = document.querySelectorAll('#month-nav-list .month-nav-link');
      var months = document.querySelectorAll('section.month');
      months.forEach(function(sec, i) {
        if (navLinks[i]) navLinks[i].classList.toggle('nav-dimmed', sec.style.display === 'none');
      });
    })();
    updateDirectionCounts();
    if (window.renderDirectionGroups) window.renderDirectionGroups();
  }

  document.querySelectorAll('[data-change-filter]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const v = el.getAttribute('data-change-filter');
      state.change = (state.change === v) ? null : v;
      applyFilters();
    });
  });
  document.querySelectorAll('[data-contour-filter]').forEach(el => {
    el.addEventListener('click', () => {
      const v = el.getAttribute('data-contour-filter');
      state.contour = (state.contour === v) ? null : v;
      applyFilters();
    });
  });
  document.querySelectorAll('[data-source-filter]').forEach(el => {
    el.addEventListener('click', () => {
      const v = el.getAttribute('data-source-filter');
      state.source = (state.source === v) ? null : v;
      applyFilters();
    });
  });
  document.querySelectorAll('[data-person-filter]').forEach(el => {
    el.addEventListener('click', () => {
      const v = el.getAttribute('data-person-filter');
      const idx = state.persons.indexOf(v);
      if (idx >= 0) state.persons.splice(idx, 1);
      else state.persons.push(v);
      applyFilters();
    });
  });
  document.querySelectorAll('[data-role-filter]').forEach(el => {
    el.addEventListener('click', () => {
      const v = el.getAttribute('data-role-filter');
      state.role = v;
      applyFilters();
    });
  });
  document.getElementById('filter-reset').addEventListener('click', () => {
    state.change = null; state.contour = null; state.source = null; state.persons = []; state.role = 'any';
    applyFilters();
    if (typeof window.resetPersonPickerUI === 'function') window.resetPersonPickerUI();
  });

  document.addEventListener('po-timeline-rendered', function () {
    applyFilters();
    updateDirectionCounts();
  });

  function applyRemoteAssignments(newOverrides) {
    if (!newOverrides || typeof newOverrides !== 'object') return;
    overrides = newOverrides;
    saveOverrides(overrides);
    document.querySelectorAll('.program[data-program-id]').forEach(prog => refreshProgramDisplay(prog));
    updateFilterCounts();
    applyFilters();
  }

  // Публикуем state и applyFilters глобально — нужны в plan_timeline.js (person picker)
  window.filterState             = state;
  window.applyFilters            = applyFilters;
  window.refreshProgramDisplay   = refreshProgramDisplay;
  window.updateFilterCounts      = updateFilterCounts;
  window.applyRemoteAssignments  = applyRemoteAssignments;
})();
