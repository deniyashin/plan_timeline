// js/modules/misc.js — закрытие меню, навигация по dep-ссылкам, picker человека
// Извлечено из plan_timeline.js строки 4-148 (IIFE "Status menu close / misc")
//   и строки 2122-2137 (IIFE "Person picker + status menu close")
// Зависимости: window.filterState, window.applyFilters (из filters.js),
//   window.ASSIGNEES, window.UNITS (из filters.js)

(function() {
  function closeAllStatusMenus() {
    document.querySelectorAll('.status-menu:not([hidden])').forEach(m => m.hidden = true);
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllStatusMenus();
  });
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(closeAllStatusMenus, 10));
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="toggle-deps"]');
    if (!btn) return;
    e.stopPropagation();
    const block = btn.closest('.deps-block');
    if (block) block.classList.add('deps-expanded');
  });

  function expandAndScroll(target, isProject) {
    if (!target) return;
    if (isProject) {
      const prog = target.closest('.program');
      if (prog) {
        const ph = prog.querySelector('.program-head');
        const pb = prog.querySelector('.program-body');
        if (ph && pb && ph.getAttribute('aria-expanded') !== 'true') {
          ph.setAttribute('aria-expanded', 'true'); pb.removeAttribute('hidden');
          prog.classList.add('is-open');
        }
      }
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
    const chip = e.target.closest('.dep-id');
    if (chip) {
      const pid = chip.textContent.trim();
      const target = document.querySelector(`.program[data-program-id="${pid}"]`);
      if (!target) return;
      e.stopPropagation();
      expandAndScroll(target, false);
      return;
    }
    const projDep = e.target.closest('.project-dep-item');
    if (projDep) {
      const pid = projDep.textContent.trim();
      let target = null;
      document.querySelectorAll('.project-id-mono').forEach(span => {
        if (span.textContent.trim() === pid) target = span.closest('.project');
      });
      if (!target) return;
      e.stopPropagation();
      expandAndScroll(target, true);
    }
  });

  // Person picker popup
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
      const ps = window.filterState.persons;
      if (ps.length > 0) {
        if (ps.length === 1 && ps[0] !== '__none__') {
          const a = window.ASSIGNEES[ps[0]];
          avatar.textContent = a ? a.initials : ps[0];
          avatar.className   = 'person-cf-code' + (window.UNITS && window.UNITS[ps[0]] ? ' person-cf-code-unit' : '');
          label.textContent  = a ? a.last : ps[0];
        } else {
          avatar.textContent = String(ps.length);
          avatar.className   = 'person-cf-code';
          label.textContent  = ps.length + ' чел.';
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
      setTimeout(() => { updateTrigger(); }, 0);
    });
    clearBtn.addEventListener('click', e => {
      e.stopPropagation();
      window.filterState.persons = [];
      window.applyFilters();
      updateTrigger();
      closePicker();
    });
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) closePicker();
    }, true);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePicker();
    });

    window.resetPersonPickerUI = function () { updateTrigger(); };
  })();

  window.refreshPeopleViews = function () {
    var newPeople = window.PLAN_CONFIG.PEOPLE;
    // Мутируем window.ASSIGNEES на месте — закрытия filters.js видят тот же объект
    var assignees = window.ASSIGNEES;
    if (assignees) {
      Object.keys(assignees).forEach(function (k) { delete assignees[k]; });
      Object.assign(assignees, newPeople, window.PLAN_CONFIG.UNITS || {});
    }
    // Перерисовать назначения в шапках всех программ
    if (typeof window.refreshProgramDisplay === 'function') {
      document.querySelectorAll('.program[data-program-id]').forEach(function (prog) {
        window.refreshProgramDisplay(prog);
      });
    }
    // Обновить счётчики в попапе фильтра по человеку
    if (typeof window.updateFilterCounts === 'function') window.updateFilterCounts();
    // Сбросить визуал кнопки person picker
    if (typeof window.resetPersonPickerUI === 'function') window.resetPersonPickerUI();
  };
})();

// Close person picker + status menus on filter collapse, mode switch, quick view
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
