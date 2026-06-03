// js/modules/people-editor.js — редактор справочника сотрудников (PEOPLE)
// Зависимости: window.PLAN_CONFIG, escHtml (html.js), window.showToast (plan_timeline.js)

(function () {
  var LS_KEY = 'po-people-overrides';

  var overlay = document.getElementById('pe-modal-overlay');
  var tbody   = document.getElementById('pe-tbody');
  if (!overlay || !tbody) return;

  var btnOpen  = document.getElementById('po-btn-people');
  var btnClose = document.getElementById('pe-modal-close');
  var btnSave  = document.getElementById('pe-btn-save');
  var btnAdd   = document.getElementById('pe-btn-add');
  var btnReset = document.getElementById('pe-btn-reset');
  var noteEl   = document.getElementById('pe-override-note');

  function isOverridden() {
    try { return !!localStorage.getItem(LS_KEY); } catch (e) { return false; }
  }

  function renderTable() {
    var people = window.PLAN_CONFIG.PEOPLE;
    tbody.innerHTML = '';
    Object.keys(people).forEach(function (code) {
      addRow(code, people[code]);
    });
    if (noteEl) {
      noteEl.textContent = isOverridden()
        ? '* Применены локальные изменения справочника'
        : '';
    }
  }

  function addRow(code, p) {
    p = p || {};
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><input class="pe-input pe-code" value="' + escHtml(code || '') + '" placeholder="Код" maxlength="8"' + (code ? ' readonly style="background:#f0f0f0;cursor:not-allowed" title="Код сотрудника нельзя изменять"' : ' title="Уникальный код (латиница/цифры)"') + '></td>' +
      '<td><input class="pe-input pe-initials" value="' + escHtml(p.initials || '') + '" placeholder="АА" maxlength="6" title="Инициалы для аватара"></td>' +
      '<td><input class="pe-input pe-last" value="' + escHtml(p.last || '') + '" placeholder="Фамилия" maxlength="40"></td>' +
      '<td><input class="pe-input pe-full" value="' + escHtml(p.full || '') + '" placeholder="Имя Фамилия" maxlength="80" style="width:180px"></td>' +
      '<td><input class="pe-input pe-role" value="' + escHtml(p.role || '') + '" placeholder="Должность" maxlength="100" style="width:220px"></td>' +
      '<td><button type="button" class="pe-del-btn" title="Удалить сотрудника">✕</button></td>';
    tr.querySelector('.pe-del-btn').addEventListener('click', function () { tr.remove(); });
    tbody.appendChild(tr);
  }

  function collectPeople() {
    var result = {};
    var hasDup = false;
    Array.from(tbody.querySelectorAll('tr')).forEach(function (tr) {
      var code = tr.querySelector('.pe-code').value.trim().toUpperCase();
      if (!code) return;
      if (result[code]) { hasDup = true; }
      result[code] = {
        initials: tr.querySelector('.pe-initials').value.trim(),
        last:     tr.querySelector('.pe-last').value.trim(),
        full:     tr.querySelector('.pe-full').value.trim(),
        role:     tr.querySelector('.pe-role').value.trim()
      };
    });
    return { people: result, hasDup: hasDup };
  }

  /* ---- open / close ---- */
  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      renderTable();
      overlay.classList.add('open');
    });
  }
  function closeModal() { overlay.classList.remove('open'); }
  if (btnClose) btnClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

  /* ---- add row ---- */
  if (btnAdd) {
    btnAdd.addEventListener('click', function () { addRow('', {}); });
  }

  /* ---- save ---- */
  if (btnSave) {
    btnSave.addEventListener('click', function () {
      var collected = collectPeople();
      if (collected.hasDup) {
        window.showToast && window.showToast('Дублирующиеся коды сотрудников — исправьте перед сохранением', 'error');
        return;
      }
      if (Object.keys(collected.people).length === 0) {
        window.showToast && window.showToast('Справочник не может быть пустым', 'error');
        return;
      }
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(collected.people));
        window.showToast && window.showToast('Справочник сохранён — перезагружаю страницу…', 'info');
        setTimeout(function () { location.reload(); }, 900);
      } catch (e) {
        window.showToast && window.showToast('Не удалось сохранить справочник', 'error');
      }
    });
  }

  /* ---- reset to defaults ---- */
  if (btnReset) {
    btnReset.addEventListener('click', function () {
      if (!confirm('Сбросить справочник к исходным данным? Все ваши изменения будут удалены.')) return;
      try {
        localStorage.removeItem(LS_KEY);
        window.showToast && window.showToast('Справочник сброшен — перезагружаю страницу…', 'info');
        setTimeout(function () { location.reload(); }, 900);
      } catch (e) {}
    });
  }
})();
