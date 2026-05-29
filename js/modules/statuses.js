// js/modules/statuses.js — статусы программ (certainty, approval, status)
// Извлечено из plan_timeline.js строки 732-823

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
    Array.from(chip.classList).forEach(c => {
      if (c !== 'status-chip' && /^(status-|certainty-|approval-)[a-z\-]+$/.test(c)) chip.classList.remove(c);
    });
    chip.classList.add(cssClass);
    chip.textContent = label;
    chip.setAttribute('data-current', cssClass);
  }

  function hydrate() {
    Object.keys(statuses).forEach(key => {
      const parts = key.split(':');
      const field = parts.pop();
      const pid = parts.join(':');
      getProgramInstances(pid).forEach(prog => {
        const editor = prog.querySelector(`.status-editor[data-field="${field}"]`);
        if (!editor) return;
        const chip = editor.querySelector('.status-chip');
        const v = statuses[key];
        if (chip && v && v.css) applyStatusToChip(chip, v.value, v.label, v.css);
      });
    });
  }
  hydrate();

  let openMenu = null;
  function closeMenu() {
    if (openMenu) { openMenu.hidden = true; openMenu = null; }
  }

  document.addEventListener('click', function(e) {
    const inEditMode = document.body.getAttribute('data-mode') === 'edit';

    const openBtn = e.target.closest('[data-action="open-status-menu"]');
    if (openBtn) {
      if (!inEditMode) return;
      e.stopPropagation();
      const editor = openBtn.closest('.status-editor');
      const menu = editor.querySelector('.status-menu');
      if (openMenu === menu) { closeMenu(); return; }
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

    if (openMenu && !e.target.closest('.status-menu')) closeMenu();
  });
})();
