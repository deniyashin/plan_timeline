// js/modules/program-flags.js — флаги программ + сохранение/загрузка общего состояния
// Извлечено из plan_timeline.js строки 734-815 (IIFE "Assignments")

(function() {
  const KEY_ASSIGN  = 'plan-timeline-assignments-v2';
  const KEY_STATUS  = 'plan-timeline-statuses-v1';
  const KEY_MODE    = 'plan-timeline-mode';
  const KEY_ME      = 'plan-timeline-me';

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
  window.gatherState     = gatherState;
  window.applyState      = applyState;
  window.showStoreStatus = showStoreStatus;

  function renderFlags() {
    const statuses = (function(){ const r = safeRead(KEY_STATUS); return r ? JSON.parse(r) : {}; })();
    document.querySelectorAll('.program[data-program-id]').forEach(prog => {
      const pid = prog.getAttribute('data-program-id');
      const slot = prog.querySelector('[data-flags-slot]');
      if (!slot) return;
      const flags = [];
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

  document.addEventListener('click', function(e) {
    if (e.target.closest('.status-option') || e.target.closest('[data-action="remove-assignee"]') || e.target.closest('.assignee-option')) {
      setTimeout(renderFlags, 50);
    }
  });
})();
