// js/modules/modes.js — переключение режимов (brief/detailed/projects/edit)
// Извлечено из plan_timeline.js строки 494-730 (IIFE "Mode switcher")
// Зависимости: window.ASSIGNEES, window.UNITS (устанавливаются в filters.js)

(function() {
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

  let initialMode = 'brief';
  try {
    const saved = localStorage.getItem('plan-timeline-mode');
    if (saved && MODE_LABELS[saved]) initialMode = saved;
  } catch (e) {}
  if (initialMode === 'edit') initialMode = _prevBaseMode || 'detailed';
  setMode(initialMode);

  // Changes section toggle
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

  // Quick view markers
  function buildQuickViewMarkers() {
    document.querySelectorAll('.program').forEach(prog => {
      const projects = prog.querySelectorAll('.project');
      let anyTasks = false;
      projects.forEach(p => {
        const badge = p.querySelector('.task-badge');
        if (badge && !badge.classList.contains('task-badge-empty')) anyTasks = true;
      });
      if (!anyTasks && projects.length > 0) prog.classList.add('qv-no-tasks');
      const needsClar = prog.querySelector('.certainty-needs-clar');
      if (needsClar) prog.classList.add('qv-needs');
    });
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
    const ASSIGNEES = window.ASSIGNEES;
    const UNITS = window.UNITS;
    const personItems = Object.entries(ASSIGNEES).map(function (pair) {
      var code = pair[0], a = pair[1];
      return {
        value: code,
        label: a.full || a.last || code,
        avatar: { initials: a.initials || code, isUnit: UNITS && UNITS.hasOwnProperty(code) }
      };
    });
    window.createDropdown(anchorBtn, personItems, function (code) {
      onSelect(code);
    }, { minWidth: '210px', position: 'absolute' });
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
