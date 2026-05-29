// js/modules/search.js — поиск и прогресс согласования
// Извлечено из plan_timeline.js строки 4-276 (IIFE "Search + misc")
// Зависимости: escHtml (html.js), normalizeText (локально)

(function() {
  // Approval progress bar
  function updateApprovalProgress() {
    let total = 0, approved = 0, review = 0, rework = 0, not_approved = 0;
    document.querySelectorAll('.program[data-program-id]:not([data-pm-clone])').forEach(prog => {
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
  document.addEventListener('click', e => {
    if (e.target.closest('.status-option')) setTimeout(updateApprovalProgress, 80);
  });

  // Collapse / Expand all
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

  // Search
  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function normalizeText(s) { return (s || '').toLowerCase().replace(/ё/g, 'е'); }

  function highlightEl(el, q) {
    if (!el) return;
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
  var searchNavUp = null, searchNavDown = null, searchNavCount = null;

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
    var proj = mark.closest('.project');
    if (proj) {
      var projBody = proj.querySelector('.project-body');
      if (projBody && projBody.hasAttribute('hidden')) {
        projBody.removeAttribute('hidden');
        proj.classList.add('is-open');
      }
    }
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
    document.querySelectorAll('[data-orig-text]').forEach(function(el) {
      if (el.contentEditable === 'true') {
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
        proj.querySelectorAll('.po-task-text').forEach(function(taskEl) {
          if (normalizeText(taskEl.textContent).includes(q)) {
            highlightEl(taskEl, q);
            projMatches = true;
          }
        });
        var projId = pidMonoEl ? pidMonoEl.textContent.trim() : '';
        if (projId && allTasks[projId]) {
          allTasks[projId].forEach(function(task) {
            if (normalizeText(task.text || '').includes(q)) projMatches = true;
          });
        }
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
      if (e.key === 'Escape') { dismissSearch(); return; }
      if (searchMatches.length === 0) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        goToMatch(e.shiftKey ? searchCurIdx - 1 : searchCurIdx + 1);
      }
    });
  }

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
    requestAnimationFrame(function() { window.scrollTo({ top: sy, behavior: 'instant' }); });
  }
  var navToggle = document.getElementById('nav-search-toggle');
  var navClose  = document.getElementById('nav-search-close');
  if (navToggle) navToggle.addEventListener('click', openNavSearch);
  if (navClose)  navClose.addEventListener('click', dismissSearch);
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      openNavSearch();
    }
  });
})();
