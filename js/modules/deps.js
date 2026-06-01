// js/modules/deps.js — карта зависимостей, навигация по месяцам, SVG-граф
// Извлечено из plan_timeline.js: "Deps map" (4-189), "PROG_TO_CHANGE" (191-221),
//   "Deps renderer" (223-342)
// Зависимости: getProgramInstances (months.js), window.PLAN_CONFIG

// --- Deps map + month sidebar + disputed counters ---
(function() {
  const DEPS = window.PLAN_CONFIG.DEPS;
  window.PLAN_DEPS = DEPS;

  function buildMonthNav() {
    const list = document.getElementById('month-nav-list');
    if (!list) return;
    const sections = document.querySelectorAll('section.month');
    sections.forEach(sec => {
      const label = sec.querySelector('.month-label');
      const year  = sec.querySelector('.month-year');
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

  function updateDisputedCounters() {
    let needsClar = 0, needsRework = 0, noOwner = 0;
    const flagMap = { 'needs-clar': [], 'needs-rework': [], 'no-owner': [] };
    document.querySelectorAll('.program[data-program-id]:not([data-pm-clone])').forEach(prog => {
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
    el.querySelectorAll('.disputed-item').forEach(item => {
      item.addEventListener('click', () => {
        const flag = item.getAttribute('data-flag');
        const map = JSON.parse(el.dataset.flagMap);
        const ids = map[flag] || [];
        const wasActive = item.classList.contains('active');
        el.querySelectorAll('.disputed-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.program.dispute-match').forEach(p => p.classList.remove('dispute-match'));
        document.body.classList.remove('has-dispute-filter');
        if (wasActive) return;
        item.classList.add('active');
        document.body.classList.add('has-dispute-filter');
        ids.forEach(pid => {
          getProgramInstances(pid).forEach(prog => prog.classList.add('dispute-match'));
        });
      });
    });
  }
  updateDisputedCounters();
  document.addEventListener('click', e => {
    if (e.target.closest('.status-option') ||
        e.target.closest('[data-action="remove-assignee"]') ||
        e.target.closest('.assignee-option')) {
      setTimeout(updateDisputedCounters, 100);
    }
  });

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
    const programs = Array.from(document.querySelectorAll('.program[data-program-id]:not([data-pm-clone])'));
    const rows = [];
    programs.forEach(prog => {
      const pid = prog.getAttribute('data-program-id');
      const name = (prog.querySelector('.program-name') || {}).textContent || '';
      const upstream = DEPS[pid] || [];
      const downstream = reverse[pid] || [];
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
    btn.addEventListener('click', () => { renderDepsMap(); overlay.hidden = false; });
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => { overlay.hidden = true; });
  }
  if (overlay) {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.hidden = true; });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && !overlay.hidden) overlay.hidden = true;
  });
})();

// --- Пометка change-cards и пустых плейсхолдеров ---
(function() {
  document.querySelectorAll('.change-card').forEach(card => {
    const desc = card.querySelector('.change-card-desc .field-value');
    const text = desc ? desc.textContent.trim() : '';
    if (text.length > 40) card.classList.add('has-detailed-desc');
    else card.classList.remove('has-detailed-desc');
  });

  function markEmpties() {
    document.querySelectorAll('.card-summary-cell').forEach(cell => {
      const val = cell.querySelector('.card-summary-value');
      const isPlaceholder = val && val.classList.contains('placeholder');
      cell.classList.toggle('is-empty', !!isPlaceholder);
    });
    document.querySelectorAll('.field-brief').forEach(f => {
      const child = f.querySelector('.card-summary-value.placeholder');
      if (child && !f.querySelector('.card-summary-grid')) {
        const allValues = f.querySelectorAll('.card-summary-value');
        if (allValues.length === 1 && allValues[0].classList.contains('placeholder')) {
          f.classList.add('is-empty');
        }
      }
    });
  }
  markEmpties();
})();

// --- SVG-граф зависимостей ---
(function() {
  const DEPS = window.PLAN_DEPS;
  const PROG_TO_CHANGE = window.PLAN_CONFIG.PROG_TO_CHANGE;
  const CHANGE_COLORS  = window.PLAN_CONFIG.CHANGE_COLORS;

  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => {
    const wasHidden = [];
    document.querySelectorAll('.program-body[hidden]').forEach(b => { wasHidden.push(b); b.hidden = false; });
    window.print();
    setTimeout(() => wasHidden.forEach(b => b.hidden = true), 500);
  });

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
        svgParts.push('<line x1="' + dx + '" y1="20" x2="' + dx + '" y2="' + (height-10) + '" stroke="' + cssVar('--line-soft') + '" stroke-width="1" stroke-dasharray="2 3"/>');
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
      '<span class="graph-legend-item"><span class="graph-legend-line" style="background:' + cssVar('--status-green-ink') + '"></span>подтверждено</span>' +
      '<span class="graph-legend-item"><span class="graph-legend-line" style="background:repeating-linear-gradient(90deg,' + cssVar('--status-amber-ink') + ',' + cssVar('--status-amber-ink') + ' 3px,transparent 3px,transparent 6px)"></span>вероятно</span>' +
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
