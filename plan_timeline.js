// === Filters + UI ===
(function() {
  // =====================================================================
  // Data mirrored from Python
  // =====================================================================
  const PEOPLE = {"AA": {"initials": "АА", "last": "Арамович", "full": "Арман Арамович", "role": "Учредитель"}, "VV": {"initials": "ВВ", "last": "Вазгенович", "full": "Вардан Вазгенович", "role": "Учредитель"}, "OS": {"initials": "ОС", "last": "Сергеевич", "full": "Олег Сергеевич", "role": "Учредитель"}, "OA": {"initials": "ОА", "last": "Александрович", "full": "Олег Александрович", "role": "Учредитель"}, "EM": {"initials": "ЕМ", "last": "Мездрикова", "full": "Екатерина Мездрикова", "role": "Финансовый директор"}, "TP": {"initials": "ТП", "last": "Платухина", "full": "Тамара Платухина", "role": "Главный бухгалтер"}, "GB": {"initials": "ГБ", "last": "Боде", "full": "Галина Боде", "role": "Руководитель HR"}, "KM": {"initials": "КМ", "last": "Москаленко", "full": "Кристина Москаленко", "role": "Старший тренер, методолог"}, "AG": {"initials": "АГ", "last": "Гулевич", "full": "Александр Гулевич", "role": "Руководитель IT"}, "NA": {"initials": "НА", "last": "Астафьева", "full": "Надежда Астафьева", "role": "РОП сети"}, "DR": {"initials": "ДР", "last": "Рон", "full": "Даниэль Рон", "role": "Руководитель департамента продаж"}, "HA": {"initials": "ХА", "last": "Харламов", "full": "Харламов Артем", "role": "Руководитель"}, "KR": {"initials": "КР", "last": "Резуненко", "full": "Константин Резуненко", "role": "Руководитель"}, "KE": {"initials": "КЕ", "last": "Краюшкина", "full": "Краюшкина Елизавета", "role": "Проектный офис / методолог"}, "AK": {"initials": "АК", "last": "Краскевич", "full": "Алексей Краскевич", "role": "Руководитель"}, "DB": {"initials": "ДБ", "last": "Бикбаева", "full": "Динара Бикбаева", "role": "Руководитель"}, "BO": {"initials": "БО", "last": "Белый", "full": "Белый Олег Александрович", "role": "Методолог"}, "YD": {"initials": "ЯД", "last": "Яшин", "full": "Яшин Денис", "role": "Руководитель"}, "CK": {"initials": "ЧК", "last": "Чащин", "full": "Чащин Кирилл", "role": "Руководитель / контур медицинского качества, стандартов, документации, рекламаций и лабораторного контроля"}};
  const UNITS = {"unit_training": {"initials": "ФО", "last": "Функция обучения", "full": "Функция обучения", "role": "Подразделение"}, "unit_po": {"initials": "ПО", "last": "Проектный офис", "full": "Проектный офис", "role": "Подразделение"}};
  const ROLES = {"anchor": {"short": "Я", "label": "Якорь-учредитель", "hint": "инициирует изменение и удерживает его"}, "owner": {"short": "В", "label": "Владелец внедрения", "hint": "контролирует использование на земле"}, "methodologist": {"short": "М", "label": "Методолог", "hint": "отвечает за корректность бизнес-процесса"}};
  const DEFAULT_ASSIGNMENTS = {"U-CHG-P-0.1": {"anchor": ["AA"], "owner": ["HA"], "methodologist": ["BO"]}, "U-HRM-P-0.2": {"anchor": ["AA"], "owner": ["KR"], "methodologist": ["unit_training", "KE"]}, "U-CLN-P-1.1": {"anchor": ["OA"], "owner": ["EM"], "methodologist": ["OS"]}, "U-UKM-P-1.2": {"anchor": ["OA"], "owner": ["EM"], "methodologist": ["KE"]}, "U-FIN-P-1.3": {"anchor": ["OS"], "owner": ["OA"], "methodologist": ["KE"]}, "U-SKL-P-1.4": {"anchor": ["AA", "VV"], "owner": ["KR"], "methodologist": ["AK"]}, "U-LAB-P-1.5": {"anchor": ["OA"], "owner": ["EM"], "methodologist": ["OS"]}, "U-LEG-P-1.6": {"anchor": ["OA"], "owner": ["EM"], "methodologist": ["TP"]}, "U-DAT-P-2.1": {"anchor": ["OS"], "owner": ["AG"], "methodologist": ["KE"]}, "U-DAT-P-2.2": {"anchor": ["OS"], "owner": ["AA"], "methodologist": ["KE"]}, "U-DAT-P-2.3": {"anchor": ["AA"], "owner": ["VV"], "methodologist": ["OA"]}, "U-ALL-P-2.4": {"anchor": ["AA"], "owner": ["KE"], "methodologist": ["OS"]}, "U-CHG-P-2.5": {"anchor": ["OS"], "owner": ["OA"], "methodologist": ["KE"]}, "U-PAT-P-3.1": {"anchor": ["AA"], "owner": ["DR"], "methodologist": ["KE", "OS"]}, "U-SLS-P-3.2": {"anchor": ["AA"], "owner": ["NA", "AK"], "methodologist": ["DR"]}, "U-PAT-P-3.3": {"anchor": ["OS"], "owner": ["DB"], "methodologist": ["AK"]}, "U-CCT-P-3.4": {"anchor": ["DR"], "owner": ["DB"], "methodologist": ["KE", "YD"]}, "T-CCT-P-3.4.10": {"anchor": ["DR"], "owner": ["DB"], "methodologist": ["KE"]}, "U-PAT-P-3.5": {"anchor": ["OS"], "owner": ["DB", "DR"], "methodologist": ["AK"]}, "U-MKT-P-3.6": {"anchor": ["DR"], "owner": ["NA"], "methodologist": ["unit_po"]}, "U-HRM-P-4.1": {"anchor": ["VV"], "owner": ["OA"], "methodologist": ["KE", "OS", "AA"]}, "U-HRM-P-4.2": {"anchor": ["OS"], "owner": ["OA"], "methodologist": ["KE"]}, "U-HRM-P-4.3": {"anchor": ["AA"], "owner": ["GB"], "methodologist": ["VV"]}, "U-HRM-P-4.4": {"anchor": ["VV", "AA"], "owner": ["KM", "GB"], "methodologist": ["KE", "OA"]}, "U-CHG-P-4.5": {"anchor": ["OS"], "owner": ["AK"], "methodologist": ["KE"]}, "U-HRM-P-4.6": {"anchor": ["AA", "VV"], "owner": ["GB"], "methodologist": ["OA", "OS"]}, "U-HRM-P-4.7": {"anchor": ["OA"], "owner": ["KM", "GB"], "methodologist": ["AA"]}, "T-HRM-P-4.8": {"anchor": ["OA"], "owner": ["GB"], "methodologist": ["KE"]}, "U-MKT-P-5.1": {"anchor": ["OS"], "owner": ["NA"], "methodologist": ["DR"]}, "U-INF-P-5.2": {"anchor": ["OA", "AA"], "owner": ["VV"], "methodologist": ["OS"]}, "U-LAB-P-5.3": {"anchor": ["OA"], "owner": ["HA", "VV"], "methodologist": ["CK"]}, "U-INF-P-5.4": {"anchor": ["OA", "AA"], "owner": ["VV"], "methodologist": ["OS"]}, "U-CTR-P-5.5": {"anchor": ["OA"], "owner": ["EM"], "methodologist": ["OS"]}, "U-EMP-P-5.6": {"anchor": ["OA"], "owner": ["GB", "AG"], "methodologist": ["KE", "AK"]}, "U-CHT-P-5.7": {"anchor": ["OA"], "owner": ["GB"], "methodologist": ["KE"]}, "U-SPC-P-5.8": {"anchor": ["AA"], "owner": ["HA"], "methodologist": ["CK"]}, "T-MKT-P-5.9": {"anchor": ["OS", "AA"], "owner": ["NA", "HA"], "methodologist": ["DR"]}, "T-MED-P-5.10": {"anchor": ["AA"], "owner": ["CK"], "methodologist": ["KE"]}};
  const ASSIGNEES = Object.assign({}, PEOPLE, UNITS);
  window.ASSIGNEES = ASSIGNEES;
  window.UNITS = UNITS;
  window.PEOPLE = PEOPLE;
  window.ROLES = ROLES;
  const ROLE_KEYS = ['anchor', 'owner', 'methodologist'];
  const STORAGE_KEY = 'plan-timeline-assignments-v2';

  // =====================================================================
  // Persistence
  // =====================================================================
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
    } catch (e) {
      console.warn('Could not save overrides', e);
      showToast('Не удалось сохранить — проверьте, разрешено ли localStorage');
    }
  }

  let overrides = loadOverrides();

  function effectiveAssignments(programId) {
    if (overrides[programId]) {
      // Normalize: each role must be an array
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

  // =====================================================================
  // Rendering helpers
  // =====================================================================
  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
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

    // Update data attributes for filtering
    ROLE_KEYS.forEach(rk => {
      progEl.setAttribute(`data-assignees-${rk}`, (asn[rk] || []).join(' '));
    });
    const all = [];
    ROLE_KEYS.forEach(rk => (asn[rk] || []).forEach(c => { if (!all.includes(c)) all.push(c); }));
    progEl.setAttribute('data-assignees-all', all.join(' '));

    // Update compact head display
    const headSlot = progEl.querySelector('[data-roles-slot]');
    if (headSlot) {
      headSlot.innerHTML = ROLE_KEYS.map(rk => compactRoleLineHTML(rk, asn[rk] || [])).join('');
    }

    // Update editor body rows
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

  // Initial hydration: apply saved overrides to DOM
  document.querySelectorAll('.program[data-program-id]').forEach(prog => {
    if (overrides[prog.getAttribute('data-program-id')]) refreshProgramDisplay(prog);
  });

  // =====================================================================
  // Expand / collapse for programs and projects
  // =====================================================================
  document.addEventListener('click', function(e) {
    // Skip clicks inside editor / menu
    if (e.target.closest('.assignments-editor')) return;
    if (e.target.closest('.assignee-menu')) return;

    const progHead = e.target.closest('.program-head');
    if (progHead) {
      // In edit mode, clicks on editable content should focus for typing, not toggle
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

  // =====================================================================
  // Assignee editing (add/remove per role)
  // =====================================================================
  let currentOpenMenu = null;
  function closeMenus() {
    if (currentOpenMenu) {
      currentOpenMenu.hidden = true;
      currentOpenMenu = null;
    }
  }

  document.addEventListener('click', function(e) {
    // Add-assignee button
    const addBtn = e.target.closest('[data-action="add-assignee"]');
    if (addBtn) {
      e.stopPropagation();
      const row = addBtn.closest('.role-editor-row');
      const menu = row.querySelector('.assignee-menu');
      if (currentOpenMenu && currentOpenMenu !== menu) closeMenus();
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      currentOpenMenu = isOpen ? null : menu;
      return;
    }

    // Pick from menu
    const opt = e.target.closest('.assignee-option');
    if (opt) {
      e.stopPropagation();
      const row = opt.closest('.role-editor-row');
      const editor = row.closest('.assignments-editor');
      const progId = editor.getAttribute('data-program-id');
      const roleKey = row.getAttribute('data-role-key');
      const newCode = opt.getAttribute('data-assignee-value') || null;

      const current = effectiveAssignments(progId);
      if (newCode === null || newCode === '') {
        current[roleKey] = [];
      } else if (!current[roleKey].includes(newCode)) {
        current[roleKey] = current[roleKey].concat([newCode]);
      }
      overrides[progId] = current;
      saveOverrides(overrides);

      const prog = document.querySelector(`.program[data-program-id="${progId}"]`);
      if (prog) refreshProgramDisplay(prog);
      closeMenus();
      updateFilterCounts();
      applyFilters();

      const name = newCode ? (ASSIGNEES[newCode] && ASSIGNEES[newCode].full) || newCode : 'не назначен';
      showToast(`Обновлено: ${ROLES[roleKey].label} → ${name}`);
      return;
    }

    // Remove-assignee button
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

      const prog = document.querySelector(`.program[data-program-id="${progId}"]`);
      if (prog) refreshProgramDisplay(prog);
      updateFilterCounts();
      applyFilters();

      const name = (ASSIGNEES[code] && ASSIGNEES[code].full) || code;
      showToast(`Убрано из роли "${ROLES[roleKey].label}": ${name}`);
      return;
    }

    // Click outside menu closes it
    if (currentOpenMenu && !e.target.closest('.assignee-menu')) {
      closeMenus();
    }
  });

  // =====================================================================
  // Toast
  // =====================================================================
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // =====================================================================
  // Filter counts
  // =====================================================================
  function updateFilterCounts() {
    const roleCounts = {};
    let noneCount = 0;
    document.querySelectorAll('.program[data-program-id]').forEach(prog => {
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
        if (a) btn.setAttribute('title', `${a.full} · ${a.role} · Якорь: ${r.anchor} · Владелец: ${r.owner} · Методолог: ${r.methodologist} · Итого: ${total}`);
      }
    });
  }
  updateFilterCounts();

  // =====================================================================
  // Filter bar collapse
  // =====================================================================
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
  // Close filter when clicking outside
  document.addEventListener('click', function(e) {
    if (filterBar.getAttribute('data-collapsed') === 'true') return;
    if (filterBar.contains(e.target)) return;
    setCollapsed(true);
  });

  // =====================================================================
  // Filtering
  // =====================================================================
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

    // Summary
    const parts = formatSummary();
    if (parts.length) {
      summaryEl.textContent = parts.join(' · ');
      summaryEl.classList.add('has-active');
    } else {
      summaryEl.textContent = 'все элементы';
      summaryEl.classList.remove('has-active');
    }

    // Chip highlights
    document.querySelectorAll('[data-change-filter]').forEach(el => {
      el.classList.toggle('filter-on', state.change && el.getAttribute('data-change-filter') === state.change);
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
    // Role selector — "any" is default-on
    document.querySelectorAll('[data-role-filter]').forEach(el => {
      el.classList.toggle('filter-on', el.getAttribute('data-role-filter') === state.role);
    });

    const programs = document.querySelectorAll('.program');
    programs.forEach(prog => {
      // Normalize BO → OA (same person)
      const normalizeKey = k => k === 'BO' ? 'OA' : k;
      const attrAll = (prog.getAttribute('data-assignees-all') || '').split(' ').filter(Boolean).map(normalizeKey);
      // Determine which assignees count for person filter depending on role
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
        // Projects inherit from program for person filter
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

    // Dim month-nav links for months hidden by filter
    (function() {
      var navLinks = document.querySelectorAll('#month-nav-list .month-nav-link');
      var months = document.querySelectorAll('section.month');
      months.forEach(function(sec, i) {
        if (navLinks[i]) navLinks[i].classList.toggle('nav-dimmed', sec.style.display === 'none');
      });
    })();
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
  });
})();

// === Mode switcher ===
(function() {
  // -------- Mode switcher --------
  const body = document.body;
  const banner = document.getElementById('mode-banner');
  const MODE_LABELS = {
    brief:    'Сейчас режим «Кратко» · открыты только изменения и программы',
    detailed: 'Сейчас режим «Подробно» · видна вся методология и описания',
    projects: 'Сейчас режим «Проекты» · плоский список проектов по месяцам',
    edit:     'Сейчас режим «Редактирование» · доступны панели редактирования и экспорт/импорт'
  };
  var _prevBaseMode = null;
  try { _prevBaseMode = localStorage.getItem('plan-timeline-base-mode') || null; } catch(e) {}

  function setMode(mode) {
    var _sy = window.scrollY;
    var currentMode = body.getAttribute('data-mode');

    if (mode === 'edit') {
      var baseMode = (currentMode === 'projects' || currentMode === 'detailed')
        ? currentMode
        : (_prevBaseMode || 'detailed');
      if (currentMode !== 'projects' && currentMode !== 'detailed') return;
      _prevBaseMode = baseMode;
      try { localStorage.setItem('plan-timeline-base-mode', baseMode); } catch(e) {}
      body.setAttribute('data-base-mode', baseMode);
      body.setAttribute('data-mode', 'edit');
      document.querySelectorAll('.mode-btn').forEach(b => {
        var m = b.getAttribute('data-mode');
        b.classList.toggle('active', m === 'edit');
        b.classList.toggle('base-mode-active', m === baseMode);
      });
      if (banner) banner.textContent = MODE_LABELS.edit || '';
      try { localStorage.setItem('plan-timeline-mode', 'edit'); } catch(e) {}
      requestAnimationFrame(function() { window.scrollTo(0, _sy); });
      return;
    }

    body.removeAttribute('data-base-mode');
    body.setAttribute('data-mode', mode);
    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
      b.classList.remove('base-mode-active');
    });
    if (banner) banner.textContent = MODE_LABELS[mode] || '';
    try { localStorage.setItem('plan-timeline-mode', mode); } catch (e) {}
    requestAnimationFrame(function() { window.scrollTo(0, _sy); });
  }

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      var clickedMode = btn.getAttribute('data-mode');
      var currentMode = body.getAttribute('data-mode');
      if (clickedMode === 'edit' && currentMode === 'edit') {
        setMode(_prevBaseMode || 'detailed');
      } else {
        setMode(clickedMode);
      }
    });
  });

  // Restore mode or default to brief; edit mode is not persisted across page loads
  let initialMode = 'brief';
  try {
    const saved = localStorage.getItem('plan-timeline-mode');
    if (saved && MODE_LABELS[saved]) initialMode = saved;
  } catch (e) {}
  if (initialMode === 'edit') initialMode = _prevBaseMode || 'detailed';
  setMode(initialMode);

  // -------- Changes section toggle --------
  (function () {
    var toggleBtn = document.getElementById('changes-toggle-btn');
    var cards = document.getElementById('change-cards');
    if (!toggleBtn || !cards) return;
    var LS_CHANGES = 'po-changes-open';
    var isOpen = false;
    try { isOpen = localStorage.getItem(LS_CHANGES) === '1'; } catch (e) {}
    function applyState() {
      if (isOpen) {
        cards.removeAttribute('hidden');
        toggleBtn.textContent = '▴ свернуть';
      } else {
        cards.setAttribute('hidden', '');
        toggleBtn.textContent = '▾ развернуть';
      }
      try { localStorage.setItem(LS_CHANGES, isOpen ? '1' : '0'); } catch (e) {}
    }
    applyState();
    toggleBtn.addEventListener('click', function () { isOpen = !isOpen; applyState(); });
  }());

  // -------- Quick views --------
  function buildQuickViewMarkers() {
    // qv-no-tasks: program where every project has 0 tasks (badge "—")
    document.querySelectorAll('.program').forEach(prog => {
      const projects = prog.querySelectorAll('.project');
      let anyTasks = false;
      projects.forEach(p => {
        const badge = p.querySelector('.task-badge');
        if (badge && !badge.classList.contains('task-badge-empty')) anyTasks = true;
      });
      if (!anyTasks && projects.length > 0) prog.classList.add('qv-no-tasks');
      // qv-needs: certainty "требует уточнения" present (none by default in template, but reserved)
      const needsClar = prog.querySelector('.certainty-needs-clar');
      if (needsClar) prog.classList.add('qv-needs');
    });
    // qv-far: months outside the next 90 days window (dynamic from today)
    const MONTH_NAMES_RU = {
      'Январь': 0, 'Февраль': 1, 'Март': 2, 'Апрель': 3,
      'Май': 4, 'Июнь': 5, 'Июль': 6, 'Август': 7,
      'Сентябрь': 8, 'Октябрь': 9, 'Ноябрь': 10, 'Декабрь': 11
    };
    const qvToday = new Date(); qvToday.setHours(0, 0, 0, 0);
    const qvCutoff = new Date(qvToday.getTime() + 90 * 24 * 60 * 60 * 1000);
    document.querySelectorAll('.month').forEach(mo => {
      const lbl = mo.querySelector('.month-label');
      const yr  = mo.querySelector('.month-year');
      if (!lbl || !yr) return;
      const monthIdx = MONTH_NAMES_RU[lbl.textContent.trim()];
      const year = parseInt(yr.textContent.trim(), 10);
      if (monthIdx === undefined || isNaN(year)) return;
      const monthStart = new Date(year, monthIdx, 1);
      const monthEnd   = new Date(year, monthIdx + 1, 0);
      if (monthStart > qvCutoff || monthEnd < qvToday) mo.classList.add('qv-far');
    });
  }
  buildQuickViewMarkers();

  // qv-mine: marks programs where the current "me" is among assignees. UI for picking "me" lives in localStorage.
  function applyMineMarker() {
    let me = null;
    try { me = localStorage.getItem('plan-timeline-me'); } catch (e) {}
    document.querySelectorAll('.program').forEach(prog => prog.classList.remove('qv-mine'));
    if (!me) return;
    document.querySelectorAll('.program').forEach(prog => {
      const all = (prog.getAttribute('data-assignees-all') || '').split(' ');
      if (all.indexOf(me) >= 0) prog.classList.add('qv-mine');
    });
  }
  applyMineMarker();

  function openMinePicker(anchorBtn, onSelect) {
    const existing = document.getElementById('mine-picker-popup');
    if (existing) { existing.remove(); return; }
    const popup = document.createElement('div');
    popup.id = 'mine-picker-popup';
    popup.style.cssText = [
      'position:absolute','z-index:500',
      'background:#FDFBF6','border:1px solid #DDD5C5','border-radius:8px',
      'min-width:210px','max-height:320px','overflow-y:auto',
      'box-shadow:0 8px 24px rgba(0,0,0,0.13)','padding:4px 0'
    ].join(';');
    const rect = anchorBtn.getBoundingClientRect();
    popup.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
    popup.style.left = (rect.left  + window.scrollX) + 'px';
    Object.entries(ASSIGNEES).forEach(([code, a]) => {
      const btn2 = document.createElement('button');
      btn2.type = 'button';
      btn2.style.cssText = [
        'display:flex','align-items:center','gap:8px','width:100%',
        'background:transparent','border:none','padding:6px 12px',
        'font-family:inherit','font-size:13px','color:var(--ink)',
        'cursor:pointer','text-align:left'
      ].join(';');
      btn2.onmouseenter = () => btn2.style.background = '#F0EDE6';
      btn2.onmouseleave = () => btn2.style.background = 'transparent';
      const av = document.createElement('span');
      av.className = 'person-cf-code' + (UNITS && UNITS[code] ? ' person-cf-code-unit' : '');
      av.style.cssText = 'flex-shrink:0;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:600';
      av.textContent = a.initials || code;
      const nm = document.createElement('span');
      nm.textContent = (a.last || code) + (a.first ? ' ' + a.first : '');
      btn2.appendChild(av); btn2.appendChild(nm);
      btn2.addEventListener('click', ev => {
        ev.stopPropagation();
        popup.remove();
        document.removeEventListener('click', outsideClose, true);
        onSelect(code);
      });
      popup.appendChild(btn2);
    });
    document.body.appendChild(popup);
    function outsideClose(ev) {
      if (!popup.contains(ev.target) && ev.target !== anchorBtn) {
        popup.remove();
        document.removeEventListener('click', outsideClose, true);
      }
    }
    setTimeout(() => {
      document.addEventListener('click', outsideClose, true);
      document.addEventListener('keydown', function escClose(ev) {
        if (ev.key === 'Escape') { popup.remove(); document.removeEventListener('keydown', escClose); }
      });
    }, 0);
  }

  document.querySelectorAll('.quick-view-btn[data-quickview]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const v = btn.getAttribute('data-quickview');
      const current = body.getAttribute('data-quickview');
      if (current === v) {
        body.removeAttribute('data-quickview');
        btn.classList.remove('active');
      } else {
        // Special-case: "only mine" — pick "me" via popup if not set
        if (v === 'mine') {
          let me = null;
          try { me = localStorage.getItem('plan-timeline-me'); } catch (e) {}
          if (!me) {
            openMinePicker(btn, function (code) {
              try { localStorage.setItem('plan-timeline-me', code); } catch (e) {}
              applyMineMarker();
              body.setAttribute('data-quickview', 'mine');
              document.querySelectorAll('.quick-view-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
            });
            return;
          }
        }
        body.setAttribute('data-quickview', v);
        document.querySelectorAll('.quick-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });
  const qvReset = document.getElementById('qv-reset');
  if (qvReset) {
    qvReset.addEventListener('click', e => {
      e.preventDefault();
      body.removeAttribute('data-quickview');
      document.querySelectorAll('.quick-view-btn').forEach(b => b.classList.remove('active'));
    });
  }
})();

// === Statuses ===
(function() {
  const STORAGE_KEY = 'plan-timeline-statuses-v1';
  function loadStatuses() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveStatuses(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
  }
  let statuses = loadStatuses();

  function applyStatusToChip(chip, value, label, cssClass) {
    // Remove old status-* / certainty-* / approval-* variant classes but keep the base status-chip class
    Array.from(chip.classList).forEach(c => {
      if (c !== 'status-chip' && /^(status-|certainty-|approval-)[a-z\-]+$/.test(c)) chip.classList.remove(c);
    });
    chip.classList.add(cssClass);
    chip.textContent = label;
    chip.setAttribute('data-current', cssClass);
  }

  function hydrate() {
    Object.keys(statuses).forEach(key => {
      // key like "U-CLN-P-1.1:status"
      const [pid, field] = key.split(':');
      const prog = document.querySelector(`.program[data-program-id="${pid}"]`);
      if (!prog) return;
      const editor = prog.querySelector(`.status-editor[data-field="${field}"]`);
      if (!editor) return;
      const chip = editor.querySelector('.status-chip');
      const v = statuses[key];
      if (chip && v && v.css) applyStatusToChip(chip, v.value, v.label, v.css);
    });
  }
  hydrate();

  let openMenu = null;
  function closeMenu() {
    if (openMenu) { openMenu.hidden = true; openMenu = null; }
  }

  document.addEventListener('click', function(e) {
    // Only allow status editing in edit mode
    const inEditMode = document.body.getAttribute('data-mode') === 'edit';

    const openBtn = e.target.closest('[data-action="open-status-menu"]');
    if (openBtn) {
      if (!inEditMode) {
        // In view modes — just ignore click on the chip
        return;
      }
      e.stopPropagation();
      const editor = openBtn.closest('.status-editor');
      const menu = editor.querySelector('.status-menu');
      if (openMenu === menu) {
        closeMenu();
        return;
      }
      closeMenu();
      menu.hidden = false;
      openMenu = menu;
      return;
    }

    const opt = e.target.closest('.status-option');
    if (opt) {
      e.stopPropagation();
      const editor = opt.closest('.status-editor');
      const field = editor.getAttribute('data-field');
      const prog = opt.closest('.program');
      const pid = prog ? prog.getAttribute('data-program-id') : null;
      const value = opt.getAttribute('data-value');
      const label = opt.getAttribute('data-label');
      const css = opt.getAttribute('data-css');
      if (!pid) { closeMenu(); return; }
      const chip = editor.querySelector('.status-chip');
      applyStatusToChip(chip, value, label, css);
      statuses[`${pid}:${field}`] = { value, label, css };
      saveStatuses(statuses);
      closeMenu();
      return;
    }

    // Click outside — close menu
    if (openMenu && !e.target.closest('.status-menu')) {
      closeMenu();
    }
  });
})();

// === Assignments ===
(function() {
  // ===== Storage keys =====
  const KEY_ASSIGN  = 'plan-timeline-assignments-v2';
  const KEY_STATUS  = 'plan-timeline-statuses-v1';
  const KEY_MODE    = 'plan-timeline-mode';
  const KEY_ME      = 'plan-timeline-me';
  const KEY_UNIFIED = 'plan-timeline-state-v3';

  function safeRead(k)  { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeWrite(k,v){ try { localStorage.setItem(k,v); } catch (e) {} }

  function gatherState() {
    const a = safeRead(KEY_ASSIGN);
    const s = safeRead(KEY_STATUS);
    return {
      version: 3,
      saved_at: new Date().toISOString(),
      mode: safeRead(KEY_MODE) || 'brief',
      me:   safeRead(KEY_ME)   || null,
      assignments: a ? JSON.parse(a) : {},
      statuses:    s ? JSON.parse(s) : {},
    };
  }
  function applyState(obj) {
    if (!obj) return;
    if (obj.assignments) safeWrite(KEY_ASSIGN, JSON.stringify(obj.assignments));
    if (obj.statuses)    safeWrite(KEY_STATUS, JSON.stringify(obj.statuses));
    if (obj.mode)        safeWrite(KEY_MODE, obj.mode);
    if (obj.me)          safeWrite(KEY_ME, obj.me);
  }
  function showStoreStatus(msg) {
    const el = document.getElementById('unified-store-status');
    if (el) {
      el.textContent = msg;
      setTimeout(() => { el.textContent = ''; }, 3500);
    }
  }

  // ===== Flag rendering on program heads =====
  function renderFlags() {
    const statuses = (function(){ const r = safeRead(KEY_STATUS); return r ? JSON.parse(r) : {}; })();
    document.querySelectorAll('.program[data-program-id]').forEach(prog => {
      const pid = prog.getAttribute('data-program-id');
      const slot = prog.querySelector('[data-flags-slot]');
      if (!slot) return;
      const flags = [];

      // Read the live state for this program from chips on screen (more accurate than localStorage alone)
      const certaintyChip = prog.querySelector('.status-editor[data-field="certainty"] .status-chip');
      const approvalChip  = prog.querySelector('.status-editor[data-field="approval"] .status-chip');
      const ownerCount = (prog.getAttribute('data-assignees-owner') || '').trim().split(/\s+/).filter(Boolean).length;

      if (certaintyChip && certaintyChip.classList.contains('certainty-needs-clar')) {
        flags.push(['flag-needs-clar', 'требует уточнения']);
      }
      if (approvalChip && approvalChip.classList.contains('approval-needs-rework')) {
        flags.push(['flag-needs-rework', 'требует пересборки']);
      }
      if (ownerCount === 0) {
        flags.push(['flag-no-owner', 'нет владельца']);
      }
      if (prog.dataset.needsDecomp) {
        flags.push(['flag-needs-decomp', 'нужна декомпозиция']);
      }

      slot.innerHTML = flags.map(([cls, label]) =>
        `<span class="program-flag ${cls}">${label}</span>`
      ).join('');
    });
  }
  renderFlags();

  // Re-render flags whenever a status is changed or anyone clicks anywhere (cheap, ~37 nodes)
  document.addEventListener('click', function(e) {
    // Defer to next tick to let other handlers update DOM first
    if (e.target.closest('.status-option') || e.target.closest('[data-action="remove-assignee"]') || e.target.closest('.assignee-option')) {
      setTimeout(renderFlags, 50);
    }
  });

})();

// === Search + misc ===
(function() {
  // ===== Approval progress =====
  function updateApprovalProgress() {
    let total = 0, approved = 0, review = 0, rework = 0, not_approved = 0;
    document.querySelectorAll('.program[data-program-id]').forEach(prog => {
      total++;
      const chip = prog.querySelector('.status-editor[data-field="approval"] .status-chip');
      if (!chip) { not_approved++; return; }
      if (chip.classList.contains('approval-approved')) approved++;
      else if (chip.classList.contains('approval-in-review')) review++;
      else if (chip.classList.contains('approval-needs-rework')) rework++;
      else not_approved++;
    });
    const approvedPct = total ? (approved / total) * 100 : 0;
    const reviewEnd = total ? ((approved + review) / total) * 100 : 0;
    const fill = document.getElementById('approval-bar-fill');
    if (fill) {
      fill.style.setProperty('--approved-pct', approvedPct + '%');
      fill.style.setProperty('--in-review-end', reviewEnd + '%');
      fill.style.width = (approvedPct + (total ? (review/total*100) : 0)) + '%';
    }
    const counts = document.getElementById('approval-counts');
    if (counts) {
      counts.innerHTML = (
        `<span class="ac-segment"><span class="ac-dot ac-dot-approved"></span><span class="ac-num">${approved}</span> согласовано</span>` +
        `<span class="ac-segment"><span class="ac-dot ac-dot-review"></span><span class="ac-num">${review}</span> на согласовании</span>` +
        `<span class="ac-segment"><span class="ac-dot ac-dot-rework"></span><span class="ac-num">${rework}</span> требуют пересборки</span>` +
        `<span class="ac-segment"><span class="ac-dot ac-dot-not"></span><span class="ac-num">${not_approved}</span> не согласовано</span>` +
        `<span style="opacity:0.7">из <span class="ac-num">${total}</span></span>`
      );
    }
  }
  updateApprovalProgress();
  // Re-run on any status pick
  document.addEventListener('click', e => {
    if (e.target.closest('.status-option')) setTimeout(updateApprovalProgress, 80);
  });

  // ===== Collapse / Expand all =====
  function setAllPrograms(open) {
    document.querySelectorAll('.program').forEach(prog => {
      const body = prog.querySelector('.program-body');
      const head = prog.querySelector('.program-head');
      if (!body || !head) return;
      prog.classList.toggle('is-open', open);
      body.hidden = !open;
      head.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.project').forEach(proj => {
      // Always collapse projects on bulk action — too noisy otherwise
      const body = proj.querySelector('.project-body');
      const head = proj.querySelector('.project-head');
      if (body && head) {
        proj.classList.remove('is-open');
        body.hidden = true;
        head.setAttribute('aria-expanded', 'false');
      }
    });
  }
  const btnCollapse = document.getElementById('btn-collapse-all');
  const btnExpand   = document.getElementById('btn-expand-all');
  if (btnCollapse) btnCollapse.addEventListener('click', () => setAllPrograms(false));
  if (btnExpand)   btnExpand.addEventListener('click',   () => setAllPrograms(true));

  // ===== Search =====
  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function normalizeText(s) { return (s || '').toLowerCase().replace(/ё/g, 'е'); }
  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function highlightEl(el, q) {
    if (!el) return;
    // Don't highlight contentEditable fields — inserting <mark> into them would destroy user edits
    if (el.contentEditable === 'true') return;
    var origText = el.dataset.origText !== undefined ? el.dataset.origText : el.textContent;
    el.dataset.origText = origText;
    if (!q) { el.textContent = origText; return; }
    var norm = normalizeText(origText);
    var idx = norm.indexOf(q);
    if (idx < 0) { el.textContent = origText; return; }
    var html = '', last = 0;
    while (idx >= 0) {
      html += escHtml(origText.slice(last, idx)) + '<mark class="search-hl">' + escHtml(origText.slice(idx, idx + q.length)) + '</mark>';
      last = idx + q.length;
      idx = norm.indexOf(q, last);
    }
    html += escHtml(origText.slice(last));
    el.innerHTML = html;
  }

  const searchEl = document.getElementById('filter-search');
  let searchTimer = null;
  let searchMatches = [];
  let searchCurIdx = -1;

  function updateSearchNav() {
    if (!searchNavCount || !searchNavUp || !searchNavDown) return;
    if (searchMatches.length === 0) {
      searchNavCount.textContent = '';
      searchNavUp.style.display = 'none';
      searchNavDown.style.display = 'none';
    } else {
      searchNavCount.textContent = (searchCurIdx + 1) + '/' + searchMatches.length;
      searchNavUp.style.display = '';
      searchNavDown.style.display = '';
    }
  }

  function goToMatch(idx) {
    searchMatches.forEach(function(m) { m.classList.remove('search-hl-active'); });
    if (searchMatches.length === 0) return;
    idx = ((idx % searchMatches.length) + searchMatches.length) % searchMatches.length;
    searchCurIdx = idx;
    var mark = searchMatches[idx];
    mark.classList.add('search-hl-active');
    // Раскрыть родительский проект, если закрыт
    var proj = mark.closest('.project');
    if (proj) {
      var projBody = proj.querySelector('.project-body');
      if (projBody && projBody.hasAttribute('hidden')) {
        projBody.removeAttribute('hidden');
        proj.classList.add('is-open');
      }
    }
    // Раскрыть родительскую программу, если закрыта
    var prog = mark.closest('.program');
    if (prog) {
      var progBody = prog.querySelector('.program-body');
      if (progBody && progBody.hasAttribute('hidden')) {
        progBody.removeAttribute('hidden');
        prog.classList.add('is-open');
      }
    }
    mark.scrollIntoView({behavior: 'smooth', block: 'center'});
    updateSearchNav();
  }

  function runSearch() {
    const q = normalizeText(searchEl ? searchEl.value.trim() : '');
    // Очищаем предыдущие подсветки
    document.querySelectorAll('[data-orig-text]').forEach(function(el) {
      if (el.contentEditable === 'true') {
        // Element became editable after being highlighted — trigger blur to save edits,
        // then strip mark wrappers without overwriting the user's current content
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        el.querySelectorAll('mark.search-hl').forEach(function(m) {
          m.replaceWith(document.createTextNode(m.textContent));
        });
      } else {
        el.textContent = el.dataset.origText;
      }
      delete el.dataset.origText;
    });
    searchMatches = [];
    searchCurIdx = -1;
    if (!q) {
      document.body.classList.remove('has-search-active');
      document.querySelectorAll('.program').forEach(p => p.classList.remove('search-match'));
      document.querySelectorAll('.project').forEach(p => p.classList.remove('search-match'));
      updateSearchNav();
      return;
    }
    // Загружаем задачи из localStorage для поиска
    var allTasks = {};
    try { allTasks = JSON.parse(localStorage.getItem('po-tasks') || '{}'); } catch(e) {}

    document.body.classList.add('has-search-active');
    document.querySelectorAll('.program').forEach(prog => {
      const nameEl = prog.querySelector('.program-name');
      const nameText = normalizeText(nameEl ? nameEl.textContent : '');
      const id = normalizeText(prog.getAttribute('data-program-id') || '');
      let progMatches = nameText.includes(q) || id.includes(q);
      if (nameText.includes(q)) highlightEl(nameEl, q);
      let anyProjMatch = false;
      prog.querySelectorAll('.project').forEach(proj => {
        const pnEl = proj.querySelector('.project-name');
        const pn = normalizeText(pnEl ? pnEl.textContent : '');
        const pidMonoEl = proj.querySelector('.project-id-mono');
        const pid = normalizeText(pidMonoEl ? pidMonoEl.textContent : '');
        let projMatches = pn.includes(q) || pid.includes(q);
        if (pn.includes(q)) highlightEl(pnEl, q);

        // Поиск по уже отрисованным задачам
        proj.querySelectorAll('.po-task-text').forEach(function(taskEl) {
          if (normalizeText(taskEl.textContent).includes(q)) {
            highlightEl(taskEl, q);
            projMatches = true;
          }
        });

        // Поиск по задачам из localStorage (ещё не отрисованным)
        var projId = pidMonoEl ? pidMonoEl.textContent.trim() : '';
        if (projId && allTasks[projId]) {
          allTasks[projId].forEach(function(task) {
            if (normalizeText(task.text || '').includes(q)) projMatches = true;
          });
        }

        // Поиск по полям описания и комментарию (только проверка, без разрушения HTML)
        proj.querySelectorAll('.field-value, .po-proj-comment').forEach(function(fieldEl) {
          if (normalizeText(fieldEl.textContent).includes(q)) projMatches = true;
        });

        proj.classList.toggle('search-match', projMatches);
        if (projMatches) anyProjMatch = true;
      });
      prog.classList.toggle('search-match', progMatches || anyProjMatch);
    });
    searchMatches = Array.from(document.querySelectorAll('mark.search-hl'));
    if (searchMatches.length > 0) goToMatch(0);
    else updateSearchNav();
  }

  // Inject nav buttons into the search row
  var searchNavUp = null, searchNavDown = null, searchNavCount = null;
  if (searchEl) {
    searchNavUp = document.createElement('button');
    searchNavUp.type = 'button'; searchNavUp.className = 'search-nav-btn'; searchNavUp.textContent = '▲';
    searchNavUp.title = 'Предыдущий результат'; searchNavUp.style.display = 'none';
    searchNavDown = document.createElement('button');
    searchNavDown.type = 'button'; searchNavDown.className = 'search-nav-btn'; searchNavDown.textContent = '▼';
    searchNavDown.title = 'Следующий результат'; searchNavDown.style.display = 'none';
    searchNavCount = document.createElement('span');
    searchNavCount.className = 'search-nav-count';
    searchEl.insertAdjacentElement('afterend', searchNavCount);
    searchNavCount.insertAdjacentElement('afterend', searchNavDown);
    searchNavDown.insertAdjacentElement('afterend', searchNavUp);
    searchNavUp.addEventListener('click', function() { goToMatch(searchCurIdx - 1); });
    searchNavDown.addEventListener('click', function() { goToMatch(searchCurIdx + 1); });
    searchEl.addEventListener('input', () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(runSearch, 120);
    });
    searchEl.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        dismissSearch();
        return;
      }
      if (searchMatches.length === 0) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        goToMatch(e.shiftKey ? searchCurIdx - 1 : searchCurIdx + 1);
      }
    });
  }

  // ---- Nav search toggle ----
  function openNavSearch() {
    document.body.classList.add('nav-search-open');
    if (searchEl) { searchEl.focus(); searchEl.select(); }
  }
  function closeNavSearch() {
    document.body.classList.remove('nav-search-open');
  }
  function dismissSearch() {
    var sy = window.scrollY;
    if (searchEl) { searchEl.value = ''; searchEl.dispatchEvent(new Event('input')); }
    closeNavSearch();
    // Restore scroll position after DOM re-layout (hidden programs become visible again)
    requestAnimationFrame(function() { window.scrollTo({ top: sy, behavior: 'instant' }); });
  }
  var navToggle = document.getElementById('nav-search-toggle');
  var navClose  = document.getElementById('nav-search-close');
  if (navToggle) navToggle.addEventListener('click', openNavSearch);
  if (navClose)  navClose.addEventListener('click', dismissSearch);
  // Ctrl+F / Cmd+F shortcut
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      openNavSearch();
    }
  });
})();

// === Deps map ===
(function() {
  const DEPS = {"U-DAT-P-2.1": [["U-ALL-P-2.4", "нужна до внедрения", "confirmed"]], "U-DAT-P-2.2": [["U-DAT-P-2.1", "база для запуска", "confirmed"], ["U-ALL-P-2.4", "нужна до внедрения", "confirmed"]], "U-DAT-P-2.3": [["U-DAT-P-2.1", "база для запуска", "confirmed"], ["U-DAT-P-2.2", "нужна до внедрения", "confirmed"]], "U-CHG-P-2.5": [["U-DAT-P-2.1", "база для запуска", "confirmed"], ["U-DAT-P-2.3", "нужна до внедрения", "confirmed"]], "U-PAT-P-3.1": [["U-ALL-P-2.4", "нужна до внедрения", "confirmed"], ["U-DAT-P-2.1", "влияет на качество реализации", "confirmed"]], "U-SLS-P-3.2": [["U-PAT-P-3.1", "база для запуска", "confirmed"], ["U-DAT-P-2.2", "влияет на качество реализации", "likely"]], "U-PAT-P-3.3": [["U-PAT-P-3.1", "база для запуска", "confirmed"], ["U-DAT-P-2.1", "нужна до внедрения", "confirmed"], ["U-PAT-P-3.5", "влияет на качество реализации", "likely"]], "U-CCT-P-3.4": [["U-PAT-P-3.1", "база для запуска", "confirmed"], ["U-DAT-P-2.1", "нужна до внедрения", "confirmed"], ["U-DAT-P-2.2", "влияет на качество реализации", "confirmed"]], "U-PAT-P-3.5": [["U-PAT-P-3.1", "база для запуска", "confirmed"], ["U-PAT-P-3.3", "нужна до внедрения", "likely"]], "U-MKT-P-3.6": [["U-PAT-P-3.1", "нужна до внедрения", "confirmed"], ["U-CCT-P-3.4", "влияет на качество реализации", "likely"]], "U-HRM-P-4.1": [["U-ALL-P-2.4", "база для запуска", "confirmed"]], "U-HRM-P-4.2": [["U-HRM-P-4.1", "база для запуска", "confirmed"]], "U-HRM-P-4.3": [["U-HRM-P-4.2", "нужна до внедрения", "confirmed"], ["U-FIN-P-1.3", "влияет на качество реализации", "likely"]], "U-HRM-P-4.4": [["U-HRM-P-4.1", "нужна до внедрения", "confirmed"], ["U-HRM-P-4.2", "нужна до внедрения", "confirmed"]], "U-CHG-P-4.5": [["U-CHG-P-0.1", "база для запуска", "confirmed"], ["U-DAT-P-2.1", "нужна до внедрения", "confirmed"], ["U-DAT-P-2.3", "влияет на качество реализации", "confirmed"]], "U-HRM-P-4.7": [["U-HRM-P-4.1", "нужна до внедрения", "confirmed"]], "T-HRM-P-4.8": [["U-HRM-P-4.1", "нужна до внедрения", "confirmed"], ["U-HRM-P-4.7", "влияет на качество реализации", "likely"]], "U-HRM-P-4.6": [["U-HRM-P-4.1", "влияет на качество реализации", "likely"]], "U-MKT-P-5.1": [["U-MKT-P-3.6", "синхронный запуск желателен", "likely"], ["T-MKT-P-5.9", "синхронный запуск желателен", "likely"]], "U-INF-P-5.2": [["U-CLN-P-1.1", "нужна до внедрения", "confirmed"], ["U-UKM-P-1.2", "нужна до внедрения", "confirmed"], ["U-LEG-P-1.6", "нужна до внедрения", "confirmed"], ["U-INF-P-5.4", "база для запуска", "confirmed"]], "U-LAB-P-5.3": [["U-LAB-P-1.5", "нужна до внедрения", "confirmed"]], "U-EMP-P-5.6": [["T-HRM-P-4.8", "синхронный запуск желателен", "likely"]], "U-CHT-P-5.7": [["U-EMP-P-5.6", "база для запуска", "confirmed"]], "U-SPC-P-5.8": [["U-PAT-P-3.1", "нужна до внедрения", "confirmed"], ["U-CCT-P-3.4", "влияет на качество реализации", "confirmed"], ["U-DAT-P-2.1", "нужна до внедрения", "likely"]], "T-MKT-P-5.9": [["U-MKT-P-5.1", "общая методологическая опора", "likely"]], "T-MED-P-5.10": [["U-ALL-P-2.4", "база для запуска", "confirmed"], ["U-DAT-P-2.1", "нужна до внедрения", "likely"], ["U-HRM-P-4.2", "влияет на качество реализации", "likely"], ["U-HRM-P-4.4", "нужна до внедрения", "likely"], ["U-LAB-P-5.3", "синхронный запуск желателен", "likely"], ["U-SPC-P-5.8", "синхронный запуск желателен", "likely"], ["U-SLS-P-3.2", "влияет на качество реализации", "hypothesis"]], "T-CCT-P-3.4.10": [["U-CCT-P-3.4", "общая методологическая опора", "confirmed"]]};
  window.PLAN_DEPS = DEPS;

  // ====================== Month sidebar ======================
  function buildMonthNav() {
    const list = document.getElementById('month-nav-list');
    if (!list) return;
    const sections = document.querySelectorAll('section.month');
    sections.forEach(sec => {
      const label = sec.querySelector('.month-label');
      const year  = sec.querySelector('.month-year');
      const stats = sec.querySelector('.month-stats');
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'month-nav-link';
      a.href = '#' + sec.id;
      if (sec.classList.contains('month-empty')) a.classList.add('is-empty');
      const MNUMS = {'апрель':'04','май':'05','июнь':'06','июль':'07','август':'08','сентябрь':'09','октябрь':'10','ноябрь':'11','декабрь':'12','январь':'01','февраль':'02','март':'03'};
      const monthNum = MNUMS[(label ? label.textContent : '').trim().toLowerCase()] || '--';
      a.innerHTML = `<span class="month-nav-label">${monthNum}</span>`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        sec.scrollIntoView({behavior: 'smooth', block: 'start'});
      });
      li.appendChild(a);
      list.appendChild(li);
    });

    // Highlight current month on scroll
    const links = list.querySelectorAll('.month-nav-link');
    const linkBySec = new Map();
    sections.forEach((sec, i) => linkBySec.set(sec, links[i]));
    function updateCurrent() {
      let nearest = null, nearestDist = Infinity;
      sections.forEach(sec => {
        const r = sec.getBoundingClientRect();
        if (r.top <= 200 && r.top > -r.height + 200) {
          const dist = Math.abs(r.top);
          if (dist < nearestDist) { nearestDist = dist; nearest = sec; }
        }
      });
      links.forEach(l => l.classList.remove('is-current'));
      if (nearest && linkBySec.has(nearest)) linkBySec.get(nearest).classList.add('is-current');
    }
    window.addEventListener('scroll', updateCurrent, { passive: true });
    updateCurrent();
  }
  buildMonthNav();

  // ====================== Disputed counters ======================
  function updateDisputedCounters() {
    let needsClar = 0, needsRework = 0, noOwner = 0;
    const flagMap = { 'needs-clar': [], 'needs-rework': [], 'no-owner': [] };
    document.querySelectorAll('.program[data-program-id]').forEach(prog => {
      const cChip = prog.querySelector('.status-editor[data-field="certainty"] .status-chip');
      const aChip = prog.querySelector('.status-editor[data-field="approval"] .status-chip');
      const ownerStr = prog.getAttribute('data-assignees-owner') || '';
      const ownerCount = ownerStr.trim().split(/\s+/).filter(Boolean).length;
      const pid = prog.getAttribute('data-program-id');
      if (cChip && cChip.classList.contains('certainty-needs-clar')) { needsClar++; flagMap['needs-clar'].push(pid); }
      if (aChip && aChip.classList.contains('approval-needs-rework')) { needsRework++; flagMap['needs-rework'].push(pid); }
      if (ownerCount === 0) { noOwner++; flagMap['no-owner'].push(pid); }
    });
    const el = document.getElementById('disputed-counters');
    if (!el) return;
    const items = [];
    if (needsClar > 0)
      items.push(`<div class="disputed-item" data-flag="needs-clar"><span class="disputed-dot disputed-dot-clar"></span><span class="disputed-num">${needsClar}</span><span class="disputed-label">требуют уточнения</span></div>`);
    if (needsRework > 0)
      items.push(`<div class="disputed-item" data-flag="needs-rework"><span class="disputed-dot disputed-dot-rework"></span><span class="disputed-num">${needsRework}</span><span class="disputed-label">требуют пересборки</span></div>`);
    if (noOwner > 0)
      items.push(`<div class="disputed-item" data-flag="no-owner"><span class="disputed-dot disputed-dot-owner"></span><span class="disputed-num">${noOwner}</span><span class="disputed-label">без владельца</span></div>`);
    if (items.length === 0) {
      el.innerHTML = '<span class="disputed-empty">Нет открытых сигналов внимания.</span>';
    } else {
      el.innerHTML = items.join('');
    }
    el.dataset.flagMap = JSON.stringify(flagMap);

    // Click handlers
    el.querySelectorAll('.disputed-item').forEach(item => {
      item.addEventListener('click', () => {
        const flag = item.getAttribute('data-flag');
        const map = JSON.parse(el.dataset.flagMap);
        const ids = map[flag] || [];
        const wasActive = item.classList.contains('active');
        // Reset
        el.querySelectorAll('.disputed-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.program.dispute-match').forEach(p => p.classList.remove('dispute-match'));
        document.body.classList.remove('has-dispute-filter');
        if (wasActive) return;
        item.classList.add('active');
        document.body.classList.add('has-dispute-filter');
        ids.forEach(pid => {
          const prog = document.querySelector(`.program[data-program-id="${pid}"]`);
          if (prog) prog.classList.add('dispute-match');
        });
      });
    });
  }
  updateDisputedCounters();
  // Re-run on status changes
  document.addEventListener('click', e => {
    if (e.target.closest('.status-option') ||
        e.target.closest('[data-action="remove-assignee"]') ||
        e.target.closest('.assignee-option')) {
      setTimeout(updateDisputedCounters, 100);
    }
  });

  // ====================== Dependencies map modal ======================
  function buildReverseDeps() {
    const reverse = {};
    Object.keys(DEPS).forEach(pid => {
      DEPS[pid].forEach(d => {
        const [depId, type, conf] = d;
        if (!reverse[depId]) reverse[depId] = [];
        reverse[depId].push([pid, type, conf]);
      });
    });
    return reverse;
  }

  function renderDepsMap() {
    const body = document.getElementById('deps-map-body');
    if (!body) return;
    const reverse = buildReverseDeps();
    // List all programs in calendar order
    const programs = Array.from(document.querySelectorAll('.program[data-program-id]'));
    const rows = [];
    programs.forEach(prog => {
      const pid = prog.getAttribute('data-program-id');
      const name = (prog.querySelector('.program-name') || {}).textContent || '';
      const upstream = DEPS[pid] || [];
      const downstream = reverse[pid] || [];

      // ID chips for upstream
      const upHtml = upstream.length
        ? `<div class="deps-map-ids">${upstream.map(([id, t, c]) => `<span class="deps-map-ref deps-map-ref-${c}" title="${t}">${id}</span>`).join('')}</div>`
        : '<span class="deps-map-empty">— нет</span>';
      const downHtml = downstream.length
        ? `<div class="deps-map-ids">${downstream.map(([id, t, c]) => `<span class="deps-map-ref deps-map-ref-${c}" title="${t}">${id}</span>`).join('')}</div>`
        : '<span class="deps-map-empty">— нет</span>';

      rows.push(`
        <div class="deps-map-row" data-pid="${pid}">
          <div class="deps-map-row-prog">
            <span class="deps-map-pid">${pid}</span>
            <span class="deps-map-pname">${name}</span>
          </div>
          <div class="deps-map-cell">
            <span class="deps-map-cell-label">← Зависит от (${upstream.length})</span>
            ${upHtml}
          </div>
          <div class="deps-map-cell">
            <span class="deps-map-cell-label">→ От неё зависят (${downstream.length})</span>
            ${downHtml}
          </div>
        </div>
      `);
    });
    body.innerHTML = rows.join('');
  }

  const btn = document.getElementById('btn-deps-map');
  const overlay = document.getElementById('deps-map-overlay');
  const closeBtn = document.getElementById('deps-map-close');
  if (btn && overlay) {
    btn.addEventListener('click', () => {
      renderDepsMap();
      overlay.hidden = false;
    });
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => { overlay.hidden = true; });
  }
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.hidden = true;
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && !overlay.hidden) overlay.hidden = true;
  });
})();

// === PROG_TO_CHANGE / deps ===
(function() {
  // ----- Mark change-cards that actually have detailed description -----
  document.querySelectorAll('.change-card').forEach(card => {
    const desc = card.querySelector('.change-card-desc .field-value');
    const text = desc ? desc.textContent.trim() : '';
    if (text.length > 40) card.classList.add('has-detailed-desc');
    else card.classList.remove('has-detailed-desc');
  });

  // ----- Mark empty placeholders so they can be hidden via class instead of :has() -----
  function markEmpties() {
    document.querySelectorAll('.card-summary-cell').forEach(cell => {
      const val = cell.querySelector('.card-summary-value');
      const isPlaceholder = val && val.classList.contains('placeholder');
      cell.classList.toggle('is-empty', !!isPlaceholder);
    });
    document.querySelectorAll('.field-brief').forEach(f => {
      // Only treat as empty if it contains ONE direct .placeholder and nothing else meaningful
      const child = f.querySelector('.card-summary-value.placeholder');
      if (child && !f.querySelector('.card-summary-grid')) {
        // single placeholder field
        const allValues = f.querySelectorAll('.card-summary-value');
        if (allValues.length === 1 && allValues[0].classList.contains('placeholder')) {
          f.classList.add('is-empty');
        }
      }
    });
  }
  markEmpties();
})();

// === Deps renderer (inline script) ===
(function() {
  const DEPS = window.PLAN_DEPS;
  const PROG_TO_CHANGE = {"U-CHG-P-0.1": "0", "U-HRM-P-0.2": "0", "U-CLN-P-1.1": "1", "U-UKM-P-1.2": "1", "U-FIN-P-1.3": "1", "U-SKL-P-1.4": "1", "U-LAB-P-1.5": "1", "U-LEG-P-1.6": "1", "U-DAT-P-2.1": "2", "U-DAT-P-2.2": "2", "U-DAT-P-2.3": "2", "U-ALL-P-2.4": "2", "U-CHG-P-2.5": "2", "U-PAT-P-3.1": "3", "U-SLS-P-3.2": "3", "U-PAT-P-3.3": "3", "U-CCT-P-3.4": "3", "T-CCT-P-3.4.10": "3", "U-PAT-P-3.5": "3", "U-MKT-P-3.6": "3", "U-HRM-P-4.1": "4", "U-HRM-P-4.2": "4", "U-HRM-P-4.3": "4", "U-HRM-P-4.4": "4", "U-CHG-P-4.5": "4", "U-HRM-P-4.6": "4", "U-HRM-P-4.7": "4", "T-HRM-P-4.8": "4", "U-MKT-P-5.1": "5", "U-INF-P-5.2": "5", "U-LAB-P-5.3": "5", "U-INF-P-5.4": "5", "U-CTR-P-5.5": "5", "U-EMP-P-5.6": "5", "U-CHT-P-5.7": "5", "U-SPC-P-5.8": "5", "T-MKT-P-5.9": "5", "T-MED-P-5.10": "5"};
  const CHANGE_COLORS = {"0": "#5A554C", "1": "#8B2635", "2": "#1E6E7A", "3": "#B8750A", "4": "#2F5233", "5": "#2E3A8A"};

  // Print button
  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => {
    const wasHidden = [];
    document.querySelectorAll('.program-body[hidden]').forEach(b => { wasHidden.push(b); b.hidden = false; });
    window.print();
    setTimeout(() => wasHidden.forEach(b => b.hidden = true), 500);
  });

  // Tabs inside deps-map modal
  const tabsRoot = document.querySelector('.deps-map-tabs');
  const body = document.getElementById('deps-map-body');
  const graph = document.getElementById('deps-map-graph');
  if (tabsRoot && body && graph) {
    tabsRoot.querySelectorAll('.deps-map-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsRoot.querySelectorAll('.deps-map-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        if (tab === 'table') { body.hidden = false; graph.hidden = true; }
        else { body.hidden = true; graph.hidden = false; renderGraph(); }
      });
    });
  }

  let graphRendered = false;
  function renderGraph() {
    if (graphRendered) return;
    graphRendered = true;
    const groups = {'0': [], '1': [], '2': [], '3': [], '4': [], '5': []};
    Object.keys(PROG_TO_CHANGE).forEach(pid => groups[PROG_TO_CHANGE[pid]].push(pid));
    Object.keys(groups).forEach(g => groups[g].sort());
    const colCount = 6, colWidth = 175, rowHeight = 30, padLeft = 30, padTop = 60;
    let maxRows = 0;
    Object.keys(groups).forEach(g => { if (groups[g].length > maxRows) maxRows = groups[g].length; });
    const width = padLeft + colCount * colWidth + 30;
    const height = padTop + maxRows * rowHeight + 30;
    const positions = {};
    const order = ['0', '1', '2', '3', '4', '5'];
    order.forEach((g, colIdx) => {
      groups[g].forEach((pid, rowIdx) => {
        positions[pid] = {
          x: padLeft + colIdx * colWidth + 8,
          y: padTop + rowIdx * rowHeight + 12,
          w: colWidth - 18, h: 22, group: g,
        };
      });
    });
    let svgParts = [];
    svgParts.push('<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">');
    const headers = ['Вне', 'I-1', 'I-2', 'I-3', 'I-4', 'I-5'];
    order.forEach((g, i) => {
      const x = padLeft + i * colWidth + (colWidth - 18) / 2 + 9;
      svgParts.push('<text x="' + x + '" y="32" text-anchor="middle" font-family="Geist Mono, monospace" font-size="11" font-weight="600" fill="' + CHANGE_COLORS[g] + '">' + headers[i] + '</text>');
      if (i > 0) {
        const dx = padLeft + i * colWidth;
        svgParts.push('<line x1="' + dx + '" y1="20" x2="' + dx + '" y2="' + (height-10) + '" stroke="#E8E1D2" stroke-width="1" stroke-dasharray="2 3"/>');
      }
    });
    Object.keys(DEPS).forEach(targetPid => {
      const target = positions[targetPid];
      if (!target) return;
      DEPS[targetPid].forEach(arr => {
        const srcPid = arr[0], conf = arr[1];
        const src = positions[srcPid];
        if (!src) return;
        const x1 = src.x + src.w, y1 = src.y + src.h / 2;
        const x2 = target.x,       y2 = target.y + target.h / 2;
        const dx = Math.abs(x2 - x1);
        const cx1 = x1 + dx * 0.35;
        const cx2 = x2 - dx * 0.35;
        svgParts.push('<path class="graph-edge graph-edge-' + conf + '" d="M' + x1 + ' ' + y1 + ' C ' + cx1 + ' ' + y1 + ', ' + cx2 + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" data-src="' + srcPid + '" data-tgt="' + targetPid + '"/>');
      });
    });
    Object.keys(positions).forEach(pid => {
      const p = positions[pid];
      const color = CHANGE_COLORS[p.group];
      svgParts.push(
        '<g class="graph-node" data-pid="' + pid + '" transform="translate(' + p.x + ' ' + p.y + ')">' +
          '<rect class="graph-node-rect" width="' + p.w + '" height="' + p.h + '" rx="3" fill="white" stroke="' + color + '"/>' +
          '<text class="graph-node-label" x="6" y="14">' + pid + '</text>' +
        '</g>'
      );
    });
    svgParts.push('</svg>');
    const legendHtml = '<div class="graph-legend">' +
      '<span class="graph-legend-item"><span class="graph-legend-line" style="background:#2F5233"></span>подтверждено</span>' +
      '<span class="graph-legend-item"><span class="graph-legend-line" style="background:repeating-linear-gradient(90deg,#8E5C0E,#8E5C0E 3px,transparent 3px,transparent 6px)"></span>вероятно</span>' +
      '<span class="graph-legend-item" style="opacity:0.7">Колонки = изменения. Стрелка идёт от того, что должно быть готово, к тому, что от него зависит.</span>' +
    '</div>';
    graph.innerHTML = legendHtml + svgParts.join('');
    graph.querySelectorAll('.graph-node').forEach(node => {
      const pid = node.getAttribute('data-pid');
      node.addEventListener('mouseenter', () => {
        const related = new Set([pid]);
        graph.querySelectorAll('.graph-edge').forEach(edge => {
          const src = edge.getAttribute('data-src');
          const tgt = edge.getAttribute('data-tgt');
          if (src === pid || tgt === pid) {
            edge.classList.add('highlighted');
            related.add(src); related.add(tgt);
          }
        });
        graph.querySelectorAll('.graph-node').forEach(n => {
          if (!related.has(n.getAttribute('data-pid'))) n.classList.add('dimmed');
        });
      });
      node.addEventListener('mouseleave', () => {
        graph.querySelectorAll('.graph-edge').forEach(e => e.classList.remove('highlighted'));
        graph.querySelectorAll('.graph-node').forEach(n => n.classList.remove('dimmed'));
      });
    });
  }
})();

// === Status menu close / misc ===
(function() {
  // ---- Robust status-menu close: Esc, mode switch, click outside (existing handler already does outside) ----
  function closeAllStatusMenus() {
    document.querySelectorAll('.status-menu:not([hidden])').forEach(m => m.hidden = true);
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllStatusMenus();
  });
  // Close menus when user switches mode
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(closeAllStatusMenus, 10));
  });

  // ---- Deps "+ ещё N" toggle ----
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="toggle-deps"]');
    if (!btn) return;
    e.stopPropagation();
    const block = btn.closest('.deps-block');
    if (block) block.classList.add('deps-expanded');
  });

  // ---- Clickable dep-id / project-dep-item: scroll to referenced program or project ----
  function expandAndScroll(target, isProject) {
    if (!target) return;
    if (isProject) {
      // expand parent program first
      const prog = target.closest('.program');
      if (prog) {
        const ph = prog.querySelector('.program-head');
        const pb = prog.querySelector('.program-body');
        if (ph && pb && ph.getAttribute('aria-expanded') !== 'true') {
          ph.setAttribute('aria-expanded', 'true'); pb.removeAttribute('hidden');
          prog.classList.add('is-open');
        }
      }
      // expand project itself
      const ph2 = target.querySelector('.project-head');
      const pb2 = target.querySelector('.project-body');
      if (ph2 && pb2 && ph2.getAttribute('aria-expanded') !== 'true') {
        ph2.setAttribute('aria-expanded', 'true'); pb2.removeAttribute('hidden');
        target.classList.add('is-open');
      }
    } else {
      const btn = target.querySelector('.program-head');
      const body = target.querySelector('.program-body');
      if (btn && body && btn.getAttribute('aria-expanded') !== 'true') {
        btn.setAttribute('aria-expanded', 'true'); body.removeAttribute('hidden');
        target.classList.add('is-open');
      }
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('dep-highlight');
    setTimeout(() => target.classList.remove('dep-highlight'), 1500);
  }

  document.addEventListener('click', e => {
    // Program-level dep chip (.dep-id span)
    const chip = e.target.closest('.dep-id');
    if (chip) {
      const pid = chip.textContent.trim();
      const target = document.querySelector(`.program[data-program-id="${pid}"]`);
      if (!target) return;
      e.stopPropagation();
      expandAndScroll(target, false);
      return;
    }
    // Project-level dep item (.project-dep-item li)
    const projDep = e.target.closest('.project-dep-item');
    if (projDep) {
      const pid = projDep.textContent.trim();
      // Find project by project-id-mono span text
      let target = null;
      document.querySelectorAll('.project-id-mono').forEach(span => {
        if (span.textContent.trim() === pid) target = span.closest('.project');
      });
      if (!target) return;
      e.stopPropagation();
      expandAndScroll(target, true);
    }
  });

  // ---- Person picker popup ----
  (function () {
    const wrap    = document.getElementById('person-picker-wrap');
    const trigger = document.getElementById('person-picker-btn');
    const popup   = document.getElementById('person-picker-popup');
    const avatar  = document.getElementById('person-picker-avatar');
    const label   = document.getElementById('person-picker-label');
    const clearBtn= document.getElementById('person-picker-clear');
    if (!wrap) return;

    function openPicker()  { popup.hidden = false; wrap.classList.add('open'); }
    function closePicker() { popup.hidden = true;  wrap.classList.remove('open'); }

    function updateTrigger() {
      const ps = state.persons;
      if (ps.length > 0) {
        if (ps.length === 1 && ps[0] !== '__none__') {
          const a = ASSIGNEES[ps[0]];
          avatar.textContent = a ? a.initials : ps[0];
          avatar.className   = 'person-cf-code' + (UNITS && UNITS[ps[0]] ? ' person-cf-code-unit' : '');
          label.textContent  = a ? a.last : ps[0];
        } else {
          avatar.textContent = String(ps.length);
          avatar.className   = 'person-cf-code';
          label.textContent  = ps.length + ' чел.';
        }
        trigger.classList.add('filter-on');
      } else {
        avatar.textContent = '?'; avatar.className = 'person-cf-code person-cf-code-empty';
        label.textContent  = 'Человек';
        trigger.classList.remove('filter-on');
      }
    }

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      popup.hidden ? openPicker() : closePicker();
    });

    popup.addEventListener('click', e => {
      const item = e.target.closest('[data-person-filter]');
      if (!item) return;
      // state.persons is updated by the [data-person-filter] handler
      setTimeout(() => { updateTrigger(); }, 0);
    });

    clearBtn.addEventListener('click', e => {
      e.stopPropagation();
      state.persons = [];
      applyFilters();
      updateTrigger();
      closePicker();
    });

    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) closePicker();
    }, true);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePicker();
    });
  })();
})();

// === Main app (edit, DnD, tasks, backend) ===
(function () {
  var LS_TEXTS  = 'po-texts';
  var LS_TASKS  = 'po-tasks';
  var LS_PSTAT  = 'po-proj-statuses';
  var LS_MIG    = 'po-migrated-v1';
  var WEBHOOK   = 'https://noslosnodeyim.beget.app/webhook/plan_timeline';

  /* helpers */
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) { return {}; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); flash(); } catch (e) {} }
  function lsRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsRawSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

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

  /* modals */
  function openModal(id)  { var el = document.getElementById(id); if (el) el.classList.add('open'); }
  function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('open'); }

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
      'plan-timeline-assignments-v2', 'plan-timeline-statuses-v1',
      'po-doc-edited', 'po-published-at'
    ];
    RESET_KEYS.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    location.reload();
  });

  /* ================================================================
     SANITIZE HTML (allow only safe formatting)
  ================================================================ */
  function sanitize(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    tmp.querySelectorAll('script,style,link,iframe,object,embed,meta').forEach(function (el) { el.remove(); });
    tmp.querySelectorAll('*').forEach(function (el) {
      var keep = ['B','STRONG','I','EM','U','UL','OL','LI','BR','SPAN','P','DIV'];
      if (keep.indexOf(el.tagName) === -1) {
        var frag = document.createDocumentFragment();
        while (el.firstChild) frag.appendChild(el.firstChild);
        el.parentNode.replaceChild(frag, el);
        return;
      }
      /* strip dangerous attrs */
      Array.from(el.attributes).forEach(function (a) {
        if (a.name !== 'style') el.removeAttribute(a.name);
      });
      /* allow only background-color style */
      if (el.hasAttribute('style')) {
        var bg = el.style.backgroundColor;
        el.removeAttribute('style');
        if (bg) el.style.backgroundColor = bg;
      }
    });
    return tmp.innerHTML;
  }

  /* ================================================================
     RICH TEXT FLOATING TOOLBAR
  ================================================================ */
  var rtBar = null;
  var rtCmds = [
    { cmd: 'bold',                 label: 'B',  title: 'Жирный', style: 'font-weight:700' },
    { cmd: 'italic',               label: 'I',  title: 'Курсив', style: 'font-style:italic' },
    { cmd: 'underline',            label: 'U',  title: 'Подчёркнутый', style: 'text-decoration:underline' },
    null, /* separator */
    { cmd: 'insertUnorderedList',  label: '≡', title: 'Маркированный список' },
    { cmd: 'insertOrderedList',    label: '☰', title: 'Нумерованный список' },
    null,
    { cmd: 'hilite',               label: '■', title: 'Выделение', color: '#FFF3B0' },
    { cmd: 'removeFormat',         label: '×', title: 'Сбросить форматирование' }
  ];

  function ensureRtBar() {
    if (rtBar) return rtBar;
    rtBar = document.createElement('div');
    rtBar.id = 'po-rt-bar';
    rtCmds.forEach(function (c) {
      if (!c) {
        var sep = document.createElement('span');
        sep.className = 'po-rt-sep';
        rtBar.appendChild(sep);
        return;
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'po-rt-btn';
      btn.title = c.title;
      btn.innerHTML = c.label;
      btn.dataset.cmd = c.cmd;
      if (c.color) btn.dataset.color = c.color;
      if (c.style) btn.style.cssText = c.style;
      rtBar.appendChild(btn);
    });
    document.body.appendChild(rtBar);
    rtBar.addEventListener('mousedown', function (e) {
      e.preventDefault(); /* keep selection */
      var btn = e.target.closest('.po-rt-btn');
      if (!btn) return;
      var cmd = btn.dataset.cmd;
      if (cmd === 'hilite') {
        document.execCommand('hiliteColor', false, btn.dataset.color);
      } else {
        document.execCommand(cmd, false, null);
      }
      /* save to localStorage after formatting */
      var sel = window.getSelection();
      if (sel && sel.anchorNode) {
        var el = (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode).closest('.po-editable');
        if (el) saveTextField(el);
      }
      updateRtBar();
    });
    return rtBar;
  }

  function updateRtBar() {
    if (!rtBar) return;
    rtBar.querySelectorAll('.po-rt-btn[data-cmd]').forEach(function (btn) {
      var cmd = btn.dataset.cmd;
      if (['bold','italic','underline'].indexOf(cmd) >= 0) {
        try { btn.classList.toggle('active', document.queryCommandState(cmd)); } catch (e) {}
      }
    });
  }

  function showRtBar(rect) {
    var bar = ensureRtBar();
    bar.style.top = '-999px'; bar.style.left = '-999px';
    bar.style.display = 'flex';
    var bw = bar.offsetWidth, bh = bar.offsetHeight;
    var x = rect.left + rect.width / 2 - bw / 2;
    var y = rect.top - bh - 10;
    if (y < 4) y = rect.bottom + 10;
    bar.style.left = Math.max(4, Math.min(window.innerWidth - bw - 4, x)) + 'px';
    bar.style.top  = Math.max(4, y) + 'px';
    updateRtBar();
  }

  function hideRtBar() {
    if (rtBar) rtBar.style.display = 'none';
  }

  document.addEventListener('selectionchange', function () {
    if (document.body.getAttribute('data-mode') !== 'edit') { hideRtBar(); return; }
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { hideRtBar(); return; }
    var node = sel.anchorNode;
    var el = (node && node.nodeType === 3 ? node.parentElement : node);
    if (!el || !el.closest('.po-editable')) { hideRtBar(); return; }
    try {
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) showRtBar(rect);
    } catch (e) {}
  });

  /* ================================================================
     TEXT EDITING — data-ek key system (saves innerHTML for rich text)
  ================================================================ */
  var textEls = [];

  function saveTextField(el) {
    var k = el.dataset.ek;
    if (!k) return;
    var d = lsGet(LS_TEXTS);
    d[k] = sanitize(el.innerHTML);
    try { localStorage.setItem(LS_TEXTS, JSON.stringify(d)); flash(); } catch (e) {}
  }

  function assignEditKeys() {
    document.querySelectorAll('.program[data-program-id]').forEach(function (prog) {
      var pid = prog.getAttribute('data-program-id');
      var csvIdx = 0, fvIdx = 0;
      var pnameEl = prog.querySelector('.program-head .program-name');
      if (pnameEl && !pnameEl.dataset.ek) pnameEl.dataset.ek = 'prog:' + pid + ':name';
      prog.querySelectorAll('.card-summary-value').forEach(function (el) {
        if (el.querySelector('.status-editor')) return;
        if (!el.dataset.ek) el.dataset.ek = 'prog:' + pid + ':csv:' + (csvIdx++);
      });
      prog.querySelectorAll('.program-meta .field-value, .program-body .field-value').forEach(function (el) {
        if (!el.dataset.ek) el.dataset.ek = 'prog:' + pid + ':fv:' + (fvIdx++);
      });
    });
    document.querySelectorAll('.project').forEach(function (proj) {
      var pidEl = proj.querySelector('.project-id-mono');
      if (!pidEl) return;
      var pid = pidEl.textContent.trim();
      var fvIdx = 0;
      proj.querySelectorAll('.project-body .field-value').forEach(function (el) {
        if (!el.dataset.ek) el.dataset.ek = 'proj:' + pid + ':fv:' + (fvIdx++);
      });
      var nameEl = proj.querySelector('.project-name');
      if (nameEl && !nameEl.dataset.ek) nameEl.dataset.ek = 'proj:' + pid + ':name';
    });
  }

  function initTextEditing() {
    assignEditKeys();
    var saved = lsGet(LS_TEXTS);
    document.querySelectorAll('[data-ek]').forEach(function (el) {
      if (el.querySelector('.status-editor, button, input, select')) return;
      el.classList.add('po-editable');
      el.contentEditable = 'false';
      el.spellcheck = false;
      var k = el.dataset.ek;
      if (k && saved[k] !== undefined) el.innerHTML = sanitize(saved[k]);
      el.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });
      el.addEventListener('blur', function () { saveTextField(el); });
      textEls.push(el);
    });
  }

  function setTextEditable(on) {
    textEls.forEach(function (el) { el.contentEditable = on ? 'true' : 'false'; });
  }

  /* ================================================================
     PROJECT STATUS CHIPS
  ================================================================ */
  var PROJ_STATUS_DEF = [
    { field: 'status', label: 'Статус', options: [
      { value: 'not-started', label: 'Не начат',      color: '#6B655C' },
      { value: 'in-progress', label: 'В работе',      color: '#1E6E7A' },
      { value: 'on-hold',     label: 'На паузе',      color: '#8E5C0E' },
      { value: 'done',        label: 'Завершён', color: '#2F5233' },
      { value: 'cancelled',   label: 'Отменён',       color: '#8B2635' }
    ]},
    { field: 'approval', label: 'Согласование', options: [
      { value: 'not-approved', label: 'Не согласован',    color: '#6B655C' },
      { value: 'in-review',    label: 'На согласовании', color: '#8E5C0E' },
      { value: 'approved',     label: 'Согласован',     color: '#2F5233' },
      { value: 'rejected',     label: 'Отклонён',                 color: '#8B2635' }
    ]}
  ];

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

  /* ================================================================
     TASKS (4-state + taskId + assignee + due date)
  ================================================================ */
  var TASK_ST = [
    { v: 'not_started', icon: '○', title: 'Не начата'      },
    { v: 'in_progress', icon: '◑', title: 'В работе'       },
    { v: 'review',      icon: '◎', title: 'На проверке'    },
    { v: 'blocked',     icon: '⧓', title: 'Заблокирована'  },
    { v: 'done',        icon: '●', title: 'Готово'          },
    { v: 'cancelled',   icon: '✕', title: 'Отменена'        },
    { v: 'draft',       icon: '◌', title: 'Черновик'        }
  ];

  function getTasks(pid) { return lsGet(LS_TASKS)[pid] || []; }
  function setTasks(pid, arr) { var d = lsGet(LS_TASKS); d[pid] = arr; lsSet(LS_TASKS, d); }

  function updateProjProgress(proj, pid) {
    var tasks = getTasks(pid);
    var total = tasks.length;
    var done  = tasks.filter(function (t) { return t.status === 'done'; }).length;
    var badge = proj.querySelector('.task-badge');
    if (badge) {
      if (total === 0) { badge.textContent = '—'; badge.classList.add('task-badge-empty'); }
      else { badge.textContent = done + '/' + total; badge.classList.remove('task-badge-empty'); }
    }
    var fill = proj.querySelector('.po-proj-prog-fill');
    var lbl  = proj.querySelector('.po-proj-prog-lbl');
    if (fill) fill.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    if (lbl)  lbl.textContent  = total ? done + '/' + total : '';
  }

  function updateProgProgress(prog) {
    var saved = lsGet(LS_PSTAT);
    var total = 0, done = 0;
    prog.querySelectorAll('.project').forEach(function (proj) {
      var m = proj.querySelector('.project-id-mono');
      if (!m) return;
      var pid = m.textContent.trim();
      var ps = saved[pid] || {};
      var st = ps.status || 'not-started';
      if (st === 'cancelled') return;
      total++;
      if (st === 'done') done++;
    });
    var pct = total ? Math.round(done / total * 100) : 0;
    var fill = prog.querySelector('.po-prog-fill');
    var lbl  = prog.querySelector('.po-prog-lbl');
    if (fill) fill.style.width = pct + '%';
    if (lbl)  lbl.textContent  = total ? done + '/' + total + ' проектов' : 'нет проектов';
  }

  function syncTaskEdit(body) {
    var on = document.body.getAttribute('data-mode') === 'edit';
    body.querySelectorAll('.po-task-text').forEach(function (el) {
      el.contentEditable = on ? 'true' : 'false';
    });
  }

  var MONTHS_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  var MONTHS_FULL  = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

  function fmtUpdated(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var now = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    var time = hh + ':' + mm;
    var sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    if (sameDay) return 'сегодня ' + time;
    var yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    var isYesterday = d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate();
    if (isYesterday) return 'вчера ' + time;
    return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + time;
  }

  function makeAssigneeBtn(t, i, pid, updSpan) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'po-task-asgn-btn';

    var av = document.createElement('span'); av.className = 'po-task-asgn-av';
    var nm = document.createElement('span'); nm.className = 'po-task-asgn-nm';
    btn.appendChild(av); btn.appendChild(nm);

    function refresh(code) {
      var a = code && window.ASSIGNEES && window.ASSIGNEES[code];
      if (a) {
        av.textContent = a.initials;
        av.style.background = window.UNITS && window.UNITS[code] ? '#D4EDE2' : '#E8E2D8';
        av.style.color      = window.UNITS && window.UNITS[code] ? '#1B6B4A' : '#6B6560';
        nm.textContent = a.last; nm.className = 'po-task-asgn-nm';
      } else {
        av.textContent = '+'; av.style.background = '#ECEAE7'; av.style.color = '#B0A898';
        nm.textContent = 'Исполнитель'; nm.className = 'po-task-asgn-nm ph';
      }
    }
    refresh(t.assignee || '');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (document.body.getAttribute('data-mode') !== 'edit') return;
      document.querySelectorAll('.po-task-asgn-drop').forEach(function (d) { d.remove(); });

      var drop = document.createElement('div');
      drop.className = 'po-task-asgn-drop';
      var rect = btn.getBoundingClientRect();
      drop.style.cssText = 'position:fixed;top:'+(rect.bottom+4)+'px;left:'+rect.left+'px;z-index:700;'+
        'background:#FDFBF6;border:1px solid #DDD5C5;border-radius:8px;'+
        'min-width:195px;max-height:260px;overflow-y:auto;'+
        'box-shadow:0 6px 20px rgba(0,0,0,0.13);padding:4px 0;';

      /* clear option */
      var clr = document.createElement('button'); clr.type = 'button';
      clr.style.cssText = 'display:flex;align-items:center;gap:7px;width:100%;background:transparent;border:none;'+
        'border-bottom:1px solid #EDE8DF;padding:6px 10px 8px;font-family:inherit;font-size:12px;color:#8B2635;cursor:pointer;';
      clr.innerHTML = '<span style="width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#ECEAE7;color:#B0A898;font-size:9px;">—</span> Не назначен';
      clr.onmouseenter = function () { clr.style.background = '#FEF0F0'; };
      clr.onmouseleave = function () { clr.style.background = 'transparent'; };
      clr.addEventListener('click', function (ev) {
        ev.stopPropagation(); drop.remove();
        var ts = new Date().toISOString();
        var a = getTasks(pid); if (a[i]) { a[i].assignee = ''; a[i].updatedAt = ts; setTasks(pid, a); }
        t.assignee = ''; t.updatedAt = ts; refresh('');
        if (updSpan) updSpan.textContent = fmtUpdated(ts);
      });
      drop.appendChild(clr);

      Object.keys(window.ASSIGNEES || {}).forEach(function (code) {
        var a = window.ASSIGNEES[code];
        var opt = document.createElement('button'); opt.type = 'button';
        var isSel = code === (t.assignee || '');
        var isUnit = window.UNITS && window.UNITS[code];
        opt.style.cssText = 'display:flex;align-items:center;gap:7px;width:100%;border:none;'+
          'padding:5px 10px;font-family:inherit;font-size:12px;color:#1F1D1A;cursor:pointer;text-align:left;'+
          'background:'+(isSel ? '#E8E2D8' : 'transparent')+';'+(isSel ? 'font-weight:600;' : '');
        opt.onmouseenter = function () { opt.style.background = '#F0EDE6'; };
        opt.onmouseleave = function () { opt.style.background = isSel ? '#E8E2D8' : 'transparent'; };
        var optAv = document.createElement('span');
        optAv.style.cssText = 'width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;'+
          'justify-content:center;font-size:7px;font-weight:700;flex-shrink:0;'+
          'background:'+(isUnit ? '#D4EDE2' : '#E8E2D8')+';color:'+(isUnit ? '#1B6B4A' : '#6B6560')+';';
        optAv.textContent = a.initials;
        var optNm = document.createElement('span');
        optNm.textContent = a.last;
        opt.appendChild(optAv); opt.appendChild(optNm);
        opt.addEventListener('click', function (ev) {
          ev.stopPropagation(); drop.remove();
          var ts = new Date().toISOString();
          var arr = getTasks(pid); if (arr[i]) { arr[i].assignee = code; arr[i].updatedAt = ts; setTasks(pid, arr); }
          t.assignee = code; t.updatedAt = ts; refresh(code);
          if (updSpan) updSpan.textContent = fmtUpdated(ts);
        });
        drop.appendChild(opt);
      });

      document.body.appendChild(drop);
      function closeA(ev) {
        if (!drop.contains(ev.target) && ev.target !== btn) { drop.remove(); document.removeEventListener('click', closeA, true); }
      }
      setTimeout(function () { document.addEventListener('click', closeA, true); }, 0);
    });

    return btn;
  }

  function makeDueBtn(t, i, pid, updSpan) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'po-task-due-btn';

    function fmtDate(val) {
      if (!val) return null;
      var m = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return m ? parseInt(m[3], 10) + ' ' + MONTHS_SHORT[parseInt(m[2], 10) - 1] + ' ' + m[1] : val;
    }
    function refreshBtn(val) {
      var label = fmtDate(val);
      btn.textContent = label || 'Срок';
      btn.classList.toggle('ph', !label);
    }
    refreshBtn(t.dueDate || '');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (document.body.getAttribute('data-mode') !== 'edit') return;
      document.querySelectorAll('.po-task-cal').forEach(function (d) { d.remove(); });

      var now = new Date();
      var sel = t.dueDate ? new Date(t.dueDate + 'T00:00:00') : null;
      var vY = sel ? sel.getFullYear() : now.getFullYear();
      var vM = sel ? sel.getMonth()    : now.getMonth();

      var cal = document.createElement('div');
      cal.className = 'po-task-cal';
      var rect = btn.getBoundingClientRect();
      cal.style.cssText = 'position:fixed;top:'+(rect.bottom+4)+'px;left:'+rect.left+'px;z-index:700;'+
        'background:#FDFBF6;border:1px solid #DDD5C5;border-radius:10px;'+
        'box-shadow:0 8px 24px rgba(0,0,0,0.14);padding:12px;min-width:224px;user-select:none;';

      function drawCal() {
        cal.innerHTML = '';
        /* header */
        var head = document.createElement('div');
        head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';
        function navBtn(ch) {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = ch;
          b.style.cssText = 'background:transparent;border:none;cursor:pointer;font-size:17px;padding:1px 7px;color:#6B6560;border-radius:4px;line-height:1;';
          b.onmouseenter = function () { b.style.background = '#F0EDE6'; };
          b.onmouseleave = function () { b.style.background = 'transparent'; };
          return b;
        }
        var prev = navBtn('‹'); var next = navBtn('›');
        prev.addEventListener('click', function (ev) { ev.stopPropagation(); vM--; if (vM<0){vM=11;vY--;} drawCal(); });
        next.addEventListener('click', function (ev) { ev.stopPropagation(); vM++; if (vM>11){vM=0;vY++;} drawCal(); });
        var lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:12px;font-weight:600;color:#1F1D1A;';
        lbl.textContent = MONTHS_FULL[vM] + ' ' + vY;
        head.appendChild(prev); head.appendChild(lbl); head.appendChild(next);
        cal.appendChild(head);

        /* day-of-week row */
        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:1px;';
        ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(function (d) {
          var h = document.createElement('div');
          h.style.cssText = 'font-size:9px;font-weight:600;color:#8F897E;text-align:center;padding-bottom:4px;';
          h.textContent = d; grid.appendChild(h);
        });

        /* blank cells */
        var firstDay = new Date(vY, vM, 1).getDay();
        var offset = firstDay === 0 ? 6 : firstDay - 1;
        for (var p = 0; p < offset; p++) grid.appendChild(document.createElement('div'));

        var daysInMonth = new Date(vY, vM + 1, 0).getDate();
        for (var d2 = 1; d2 <= daysInMonth; d2++) {
          (function (day) {
            var isoStr = vY + '-' + String(vM+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
            var isToday = day === now.getDate() && vM === now.getMonth() && vY === now.getFullYear();
            var isSel   = isoStr === (t.dueDate || '');
            var cell = document.createElement('button'); cell.type = 'button'; cell.textContent = day;
            cell.style.cssText = 'border:none;border-radius:50%;width:28px;height:28px;font-family:inherit;'+
              'font-size:11px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;'+
              'background:'+(isSel?'#1F1D1A':'transparent')+';'+
              'color:'+(isSel?'#FDFBF6':isToday?'#8B2635':'#1F1D1A')+';'+
              'font-weight:'+(isToday||isSel?'700':'400')+';';
            if (!isSel) {
              cell.onmouseenter = function(){cell.style.background='#F0EDE6';};
              cell.onmouseleave = function(){cell.style.background='transparent';};
            }
            cell.addEventListener('click', function (ev) {
              ev.stopPropagation(); cal.remove(); document.removeEventListener('click', closeC, true);
              var ts = new Date().toISOString();
              var arr = getTasks(pid); if (arr[i]) { arr[i].dueDate = isoStr; arr[i].updatedAt = ts; setTasks(pid, arr); }
              t.dueDate = isoStr; t.updatedAt = ts; refreshBtn(isoStr);
              if (updSpan) updSpan.textContent = fmtUpdated(ts);
            });
            grid.appendChild(cell);
          })(d2);
        }
        cal.appendChild(grid);

        /* clear */
        var clr = document.createElement('button'); clr.type = 'button'; clr.textContent = 'Очистить дату';
        clr.style.cssText = 'display:block;width:100%;margin-top:8px;background:transparent;border:none;'+
          'border-top:1px solid #EDE8DF;padding:6px 0 0;font-family:inherit;font-size:11px;color:#8B2635;cursor:pointer;text-align:center;';
        clr.onmouseenter = function(){clr.style.opacity='0.7';};
        clr.onmouseleave = function(){clr.style.opacity='1';};
        clr.addEventListener('click', function (ev) {
          ev.stopPropagation(); cal.remove(); document.removeEventListener('click', closeC, true);
          var ts = new Date().toISOString();
          var arr = getTasks(pid); if (arr[i]) { arr[i].dueDate = ''; arr[i].updatedAt = ts; setTasks(pid, arr); }
          t.dueDate = ''; t.updatedAt = ts; refreshBtn('');
          if (updSpan) updSpan.textContent = fmtUpdated(ts);
        });
        cal.appendChild(clr);
      }

      drawCal();
      document.body.appendChild(cal);
      function closeC(ev) {
        if (!cal.contains(ev.target) && ev.target !== btn) { cal.remove(); document.removeEventListener('click', closeC, true); }
      }
      setTimeout(function () { document.addEventListener('click', closeC, true); }, 0);
    });

    return btn;
  }

  function renderTasks(pid, body, proj) {
    var tasks = getTasks(pid);
    var sec = body.querySelector('.po-task-section');
    if (!sec) {
      sec = document.createElement('div');
      sec.className = 'po-task-section';
      var hd = document.createElement('div');
      hd.className = 'po-task-section-head';
      hd.textContent = 'Задачи';
      var ul = document.createElement('ul');
      ul.className = 'po-task-list';
      var ab = document.createElement('button');
      ab.type = 'button';
      ab.className = 'po-task-add';
      ab.textContent = '+ Добавить задачу';
      ab.addEventListener('click', function (e) { e.stopPropagation(); doAddTask(pid, body, proj); });
      sec.appendChild(hd); sec.appendChild(ul); sec.appendChild(ab);
      body.appendChild(sec);
    }
    var list = sec.querySelector('.po-task-list');
    list.innerHTML = '';

    var dragSrcIdx = -1;
    tasks.forEach(function (t, i) {
      var st = TASK_ST.find(function (s) { return s.v === t.status; }) || TASK_ST[0];
      var li = document.createElement('li');
      li.className = 'po-task-item';
      li.dataset.st = st.v;
      li.draggable = true;
      li.addEventListener('dragstart', function (e) {
        dragSrcIdx = i;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(function () { li.classList.add('po-dragging'); }, 0);
      });
      li.addEventListener('dragend', function () {
        li.classList.remove('po-dragging');
        list.querySelectorAll('.po-task-item').forEach(function (el) { el.classList.remove('po-drag-over'); });
      });
      li.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.querySelectorAll('.po-task-item').forEach(function (el) { el.classList.remove('po-drag-over'); });
        if (dragSrcIdx !== i) li.classList.add('po-drag-over');
      });
      li.addEventListener('drop', function (e) {
        e.stopPropagation();
        li.classList.remove('po-drag-over');
        if (dragSrcIdx < 0 || dragSrcIdx === i) return;
        var a = getTasks(pid);
        var moved = a.splice(dragSrcIdx, 1)[0];
        a.splice(i, 0, moved);
        dragSrcIdx = -1;
        setTasks(pid, a);
        renderTasks(pid, body, proj);
      });

      var drag = document.createElement('span');
      drag.className = 'po-task-drag';
      drag.textContent = '⠿';
      drag.title = 'Перетащить';

      var cb = document.createElement('button');
      cb.type = 'button'; cb.className = 'po-task-cb';
      cb.textContent = st.title; cb.title = 'Изменить статус';
      cb.addEventListener('click', function (e) {
        e.stopPropagation();
        var existingDrop = document.querySelector('.po-task-st-drop');
        if (existingDrop) {
          var isOurs = existingDrop._ownerCb === cb;
          existingDrop.remove();
          if (isOurs) return;
        }
        var drop = document.createElement('ul');
        drop.className = 'po-task-st-drop';
        drop._ownerCb = cb;
        TASK_ST.forEach(function (s) {
          var opt = document.createElement('li');
          opt.className = 'po-task-st-opt' + (s.v === (t.status || 'not_started') ? ' current' : '');
          opt.dataset.st = s.v;
          opt.textContent = s.title;
          opt.addEventListener('click', function (ev) {
            ev.stopPropagation();
            var a = getTasks(pid);
            if (a[i]) { a[i].status = s.v; a[i].updatedAt = new Date().toISOString(); }
            setTasks(pid, a);
            renderTasks(pid, body, proj);
            var pr = proj.closest('.program');
            if (pr) updateProgProgress(pr);
          });
          drop.appendChild(opt);
        });
        var rect = cb.getBoundingClientRect();
        drop.style.top = (rect.bottom + 4) + 'px';
        drop.style.left = rect.left + 'px';
        document.body.appendChild(drop);
        function closeDrop(ev) {
          if (!drop.contains(ev.target) && ev.target !== cb) { drop.remove(); document.removeEventListener('click', closeDrop, true); }
        }
        setTimeout(function () { document.addEventListener('click', closeDrop, true); }, 0);
      });

      var bd = document.createElement('div');
      bd.className = 'po-task-body';

      /* task ID line */
      var idLine = document.createElement('span');
      idLine.className = 'po-task-id-line';
      idLine.textContent = t.id || t.taskId || '';

      /* task text */
      var txt = document.createElement('span');
      txt.className = 'po-task-text';
      txt.contentEditable = 'false'; txt.spellcheck = false;
      txt.textContent = t.text || '';
      txt.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); doAddTask(pid, body, proj); }
      });
      var updSpan = document.createElement('span');
      updSpan.className = 'po-task-updated';
      updSpan.textContent = fmtUpdated(t.updatedAt || '');

      txt.addEventListener('blur', function () {
        var ts = new Date().toISOString();
        var a = getTasks(pid);
        if (a[i]) { a[i].text = txt.textContent; a[i].updatedAt = ts; setTasks(pid, a); }
        t.updatedAt = ts; updSpan.textContent = fmtUpdated(ts);
      });

      /* meta line: assignee + due + timestamp */
      var meta = document.createElement('div');
      meta.className = 'po-task-meta';

      meta.appendChild(makeAssigneeBtn(t, i, pid, updSpan));
      meta.appendChild(makeDueBtn(t, i, pid, updSpan));
      meta.appendChild(updSpan);
      bd.appendChild(idLine); bd.appendChild(txt); bd.appendChild(meta);

      var del = document.createElement('button');
      del.type = 'button'; del.className = 'po-task-del'; del.textContent = '\xd7';
      del.addEventListener('click', function (e) {
        e.stopPropagation();
        var a = getTasks(pid); a.splice(i, 1); setTasks(pid, a);
        renderTasks(pid, body, proj);
        var pr = proj.closest('.program'); if (pr) updateProgProgress(pr);
      });

      li.appendChild(drag); li.appendChild(cb); li.appendChild(bd); li.appendChild(del);
      list.appendChild(li);
    });

    syncTaskEdit(body);
    updateProjProgress(proj, pid);
  }

  function doAddTask(pid, body, proj) {
    var a = getTasks(pid);
    a.push({ taskId: '', text: '', assignee: '', dueDate: '', status: 'not_started', updatedAt: new Date().toISOString() });
    setTasks(pid, a);
    renderTasks(pid, body, proj);
    var items = body.querySelectorAll('.po-task-text');
    if (items.length) { var last = items[items.length - 1]; last.contentEditable = 'true'; last.focus(); }
  }

  function initTasks() {
    document.querySelectorAll('.project').forEach(function (proj) {
      var pidEl = proj.querySelector('.project-id-mono');
      if (!pidEl) return;
      var pid = pidEl.textContent.trim();
      var body = proj.querySelector('.project-body');
      if (!body) return;
      var badge = proj.querySelector('.task-badge');
      if (badge && !proj.querySelector('.po-proj-prog')) {
        var pg = document.createElement('span');
        pg.className = 'po-proj-prog';
        pg.innerHTML = '<span class="po-proj-prog-bar"><span class="po-proj-prog-fill" style="width:0%"></span></span><span class="po-proj-prog-lbl"></span>';
        badge.parentNode.insertBefore(pg, badge.nextSibling);
      }
      renderTasks(pid, body, proj);
    });
    document.querySelectorAll('.program').forEach(function (prog) {
      var head = prog.querySelector('.program-head');
      if (!head || prog.querySelector('.po-prog-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'po-prog-wrap';
      wrap.innerHTML = '<div class="po-prog-bar"><div class="po-prog-fill" style="width:0%"></div></div><span class="po-prog-lbl">нет задач</span>';
      head.appendChild(wrap);
      updateProgProgress(prog);
    });
  }

  /* mode observer */
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      if (m.attributeName !== 'data-mode') return;
      var on = document.body.getAttribute('data-mode') === 'edit';
      setTextEditable(on);
      document.querySelectorAll('.project-body').forEach(syncTaskEdit);
      if (!on) hideRtBar();
    });
  }).observe(document.body, { attributes: true });

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
      textEls.forEach(function (el) {
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
        PROJ_STATUS_DEF.forEach(function (def) {
          var chip = proj.querySelector('.po-status-chip[data-field="' + def.field + '"]');
          if (!chip) return;
          var opt = def.options.find(function (o) { return o.value === ps[def.field]; });
          if (opt) applyChipStyle(chip, opt);
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
        var prog = document.querySelector('.program[data-program-id="' + pid + '"]');
        if (!prog) return;
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
    }
  }

  function loadRemote() {
    fetch('https://deniyashin.github.io/plan_timeline/data.json?v=' + Date.now(), { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) applyData(d); })
      .catch(function () {});
  }

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

    /* inject move-month button */
    _injectMoveBtn(li);

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
  function _injectMoveBtn(progLi) {
    var head = progLi.querySelector('.program-head');
    if (!head || head.querySelector('.po-prog-move-btn')) return;
    var idMono = head.querySelector('.program-id-mono');
    if (!idMono) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'po-prog-move-btn'; btn.textContent = '↕ месяц';
    btn.addEventListener('click', function (e) { e.stopPropagation(); _openMonthPicker(progLi, btn); });
    idMono.after(btn);
  }

  function _openMonthPicker(progLi, anchorEl) {
    document.querySelectorAll('.po-month-pick-drop').forEach(function (d) { d.remove(); });
    var currentSec = progLi.closest('section.month');
    var drop = document.createElement('div');
    drop.className = 'po-month-pick-drop';
    var rect = anchorEl.getBoundingClientRect();
    drop.style.top  = (rect.bottom + 4) + 'px';
    drop.style.left = rect.left + 'px';

    document.querySelectorAll('section.month').forEach(function (sec) {
      var lbl  = sec.querySelector('.month-label');
      var yr   = sec.querySelector('.month-year');
      var text = (lbl ? lbl.textContent : sec.id) + (yr ? ' ' + yr.textContent : '');
      var isCur = sec === currentSec;
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'po-month-pick-opt' + (isCur ? ' current' : '');
      opt.textContent = text + (isCur ? ' ✓' : '');
      if (!isCur) {
        opt.addEventListener('click', function (ev) {
          ev.stopPropagation(); drop.remove();
          document.removeEventListener('click', closeM, true);
          _moveProgramToMonth(progLi, sec);
        });
      }
      drop.appendChild(opt);
    });

    document.body.appendChild(drop);
    function closeM(ev) {
      if (!drop.contains(ev.target) && ev.target !== anchorEl) {
        drop.remove(); document.removeEventListener('click', closeM, true);
      }
    }
    setTimeout(function () { document.addEventListener('click', closeM, true); }, 0);
  }

  function _moveProgramToMonth(progLi, targetSec) {
    var progId = progLi.getAttribute('data-program-id');
    var targetList = targetSec.querySelector('.program-list');
    if (!targetList) return;

    /* move DOM — insert before the add-prog button if present */
    var addBtn = targetSec.querySelector('.po-add-prog-btn');
    if (addBtn) targetList.after(progLi); /* temp, then fix */
    targetList.appendChild(progLi);

    /* save to po-prog-months */
    var pm = getProgMonths();
    pm[progId] = targetSec.id;
    saveProgMonths(pm);

    /* if it's a new program, update po-new-programs creation month too */
    var np = getNewProgs();
    var moved = false;
    Object.keys(np).forEach(function (mId) {
      np[mId] = (np[mId] || []).filter(function (d) {
        if (d.id === progId) { moved = true; if (!np[targetSec.id]) np[targetSec.id] = []; np[targetSec.id].push(d); return false; }
        return true;
      });
    });
    if (moved) saveNewProgs(np);
  }

  function initAddProgramBtns() {
    document.querySelectorAll('section.month').forEach(function (sec) {
      var progList = sec.querySelector('.program-list');
      if (!progList) return;
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'po-add-prog-btn'; btn.textContent = '+ Добавить программу';
      btn.addEventListener('click', function (e) { e.stopPropagation(); _openPmModal(sec); });
      progList.after(btn);
    });
  }

  function initMoveProgramBtns() {
    document.querySelectorAll('.program[data-program-id]').forEach(_injectMoveBtn);
  }

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
      var el = document.querySelector('.program[data-program-id="' + id + '"]');
      if (el) el.remove();
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

  /* ================================================================
     INIT
  ================================================================ */
  applyDeleted();
  restoreNewPrograms();
  restoreNewProjects();
  migrateHardcodedTasks();   /* must run before initTasks */
  migrateTasksV2();
  initTextEditing();
  injectProjStatuses();
  initTasks();
  restoreProgramMonths();
  recordProjOrigPositions();  /* snapshot before any project-mode moves */
  initAddProgramBtns();
  initMoveProgramBtns();
  initAddProjectBtns();
  hideOldTasksWrap();
  initDeleteButtons();
  /* project month moves only in projects mode — applied on mode switch */
  if (document.body.getAttribute('data-mode') === 'projects') applyProjectsModeOrder();
  initProjectsDnD();
  setTextEditable(document.body.getAttribute('data-mode') === 'edit');
  (function () { var _pa = localStorage.getItem('po-doc-edited') || localStorage.getItem('po-published-at'); if (_pa) updatePubStamp(_pa); }());
  loadRemote();

})();

// === Person picker + status menu close ===
/* Close person picker + status menus on filter collapse, mode switch, quick view */
(function () {
  function closeFloating() {
    var popup = document.getElementById('person-picker-popup');
    var wrap  = document.getElementById('person-picker-wrap');
    if (popup) popup.hidden = true;
    if (wrap)  wrap.classList.remove('open');
    document.querySelectorAll('.status-menu:not([hidden])').forEach(function (m) { m.hidden = true; });
  }
  var ft = document.getElementById('filter-toggle');
  if (ft) ft.addEventListener('click', closeFloating);
  document.querySelectorAll('.mode-btn').forEach(function (b) { b.addEventListener('click', closeFloating); });
  document.querySelectorAll('.quick-view-btn').forEach(function (b) { b.addEventListener('click', closeFloating); });
  document.getElementById('filter-reset') && document.getElementById('filter-reset').addEventListener('click', closeFloating);
})();

