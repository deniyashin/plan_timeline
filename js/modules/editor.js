// js/modules/editor.js — редактор текста: richtext toolbar, initTextEditing, setTextEditable
// Извлечено из plan_timeline.js строки 235-397
// Зависимости: lsGet/lsSet (storage.js), sanitize/escHtml (html.js), window.flash

(function() {
  var LS_TEXTS = 'po-texts';
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
    { cmd: 'hilite',               label: '■', title: 'Выделение', color: '' },
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
      if (c.cmd === 'hilite') btn.dataset.color = cssVar('--highlight-bg');
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

  window.initTextEditing  = initTextEditing;
  window.setTextEditable  = setTextEditable;
  window.saveTextField    = saveTextField;  // нужен proj-status.js (blur в комментарии)
  window.hideRtBar        = hideRtBar;      // нужен tasks.js (MutationObserver)
  window.textEls          = textEls;        // нужен publish.js (applyData)
})();