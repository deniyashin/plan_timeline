// js/modules/tasks.js — задачи: renderTasks, initTasks, updateProjProgress
// Извлечено из plan_timeline.js строки 653-1144
// Зависимости: lsGet/lsSet (storage.js), window.PLAN_CONFIG, window.flash,
//   window.injectProjStatuses (proj-status.js), window.ASSIGNEES (filters.js)

(function() {
  var LS_TASKS  = 'po-tasks';
  var LS_PSTAT  = 'po-proj-statuses';
  /* ================================================================
     TASKS (4-state + taskId + assignee + due date)
  ================================================================ */
  var TASK_ST = window.PLAN_CONFIG.TASK_ST;

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
        av.style.background = window.UNITS && window.UNITS[code] ? cssVar('--avatar-unit-bg') : cssVar('--active');
        av.style.color      = window.UNITS && window.UNITS[code] ? cssVar('--avatar-unit-ink') : cssVar('--avatar-person-ink');
        nm.textContent = a.last; nm.className = 'po-task-asgn-nm';
      } else {
        av.textContent = '+'; av.style.background = cssVar('--avatar-person-bg'); av.style.color = cssVar('--avatar-person-ink');
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
        'background:'+cssVar('--surface')+';border:1px solid '+cssVar('--line')+';border-radius:8px;'+
        'min-width:195px;max-height:260px;overflow-y:auto;'+
        'box-shadow:0 6px 20px rgba(0,0,0,0.13);padding:4px 0;';

      /* clear option */
      var clr = document.createElement('button'); clr.type = 'button';
      clr.style.cssText = 'display:flex;align-items:center;gap:7px;width:100%;background:transparent;border:none;'+
        'border-bottom:1px solid '+cssVar('--line-soft')+';padding:6px 10px 8px;font-family:inherit;font-size:12px;color:'+cssVar('--danger')+';cursor:pointer;';
      clr.innerHTML = '<span style="width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:'+cssVar('--avatar-person-bg')+';color:'+cssVar('--avatar-person-ink')+';font-size:9px;">—</span> Не назначен';
      clr.onmouseenter = function () { clr.style.background = cssVar('--task-blocked-bg'); };
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
          'padding:5px 10px;font-family:inherit;font-size:12px;color:'+cssVar('--ink')+';cursor:pointer;text-align:left;'+
          'background:'+(isSel ? cssVar('--active') : 'transparent')+';'+(isSel ? 'font-weight:600;' : '');
        opt.onmouseenter = function () { opt.style.background = cssVar('--hover'); };
        opt.onmouseleave = function () { opt.style.background = isSel ? cssVar('--active') : 'transparent'; };
        var optAv = document.createElement('span');
        optAv.style.cssText = 'width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;'+
          'justify-content:center;font-size:7px;font-weight:700;flex-shrink:0;'+
          'background:'+(isUnit ? cssVar('--avatar-unit-bg') : cssVar('--active'))+';color:'+(isUnit ? cssVar('--avatar-unit-ink') : cssVar('--avatar-person-ink'))+';';
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
      cal.style.cssText = 'position:fixed;z-index:700;'+
        'background:'+cssVar('--surface')+';border:1px solid '+cssVar('--line')+';border-radius:10px;'+
        'box-shadow:0 8px 24px rgba(0,0,0,0.14);padding:12px;min-width:224px;user-select:none;';

      function drawCal() {
        cal.innerHTML = '';
        /* header */
        var head = document.createElement('div');
        head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';
        function navBtn(ch) {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = ch;
          b.style.cssText = 'background:transparent;border:none;cursor:pointer;font-size:17px;padding:1px 7px;color:'+cssVar('--avatar-person-ink')+';border-radius:4px;line-height:1;';
          b.onmouseenter = function () { b.style.background = cssVar('--hover'); };
          b.onmouseleave = function () { b.style.background = 'transparent'; };
          return b;
        }
        var prev = navBtn('‹'); var next = navBtn('›');
        prev.addEventListener('click', function (ev) { ev.stopPropagation(); vM--; if (vM<0){vM=11;vY--;} drawCal(); });
        next.addEventListener('click', function (ev) { ev.stopPropagation(); vM++; if (vM>11){vM=0;vY++;} drawCal(); });
        var lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:12px;font-weight:600;color:'+cssVar('--ink')+';';
        lbl.textContent = MONTHS_FULL[vM] + ' ' + vY;
        head.appendChild(prev); head.appendChild(lbl); head.appendChild(next);
        cal.appendChild(head);

        /* day-of-week row */
        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:1px;';
        ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(function (d) {
          var h = document.createElement('div');
          h.style.cssText = 'font-size:9px;font-weight:600;color:'+cssVar('--ink-soft')+';text-align:center;padding-bottom:4px;';
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
              'background:'+(isSel?cssVar('--ink'):'transparent')+';'+
              'color:'+(isSel?cssVar('--surface'):isToday?cssVar('--danger'):cssVar('--ink'))+';'+
              'font-weight:'+(isToday||isSel?'700':'400')+';';
            if (!isSel) {
              cell.onmouseenter = function(){cell.style.background=cssVar('--hover');};
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
          'border-top:1px solid '+cssVar('--line-soft')+';padding:6px 0 0;font-family:inherit;font-size:11px;color:'+cssVar('--danger')+';cursor:pointer;text-align:center;';
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
      window.positionDropdownBelow(cal, btn);
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
        var statusItems = TASK_ST.map(function (s) {
          return { value: s.v, label: s.title };
        });
        window.createDropdown(cb, statusItems, function (val) {
          var a = getTasks(pid);
          if (a[i]) { a[i].status = val; a[i].updatedAt = new Date().toISOString(); }
          setTasks(pid, a);
          renderTasks(pid, body, proj);
          var pr = proj.closest('.program');
          if (pr) updateProgProgress(pr);
        }, { currentValue: t.status || 'not_started' });
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

  function syncMonthRowVisibility(on) {
    document.querySelectorAll('.po-proj-month-row').forEach(function (row) {
      /* Never show in clones */
      if (row.closest('.program[data-pm-clone]')) { row.style.display = 'none'; return; }
      row.style.display = on ? 'flex' : 'none';
    });
  }

  /* mode observer */
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      if (m.attributeName !== 'data-mode') return;
      var on = document.body.getAttribute('data-mode') === 'edit';
      setTextEditable(on);
      document.querySelectorAll('.project-body').forEach(syncTaskEdit);
      syncMonthRowVisibility(on);
      if (!on) hideRtBar();
    });
  }).observe(document.body, { attributes: true });

  window.getTasks           = getTasks;
  window.setTasks           = setTasks;
  window.renderTasks        = renderTasks;
  window.doAddTask          = doAddTask;
  window.initTasks          = initTasks;
  window.updateProjProgress = updateProjProgress;
  window.updateProgProgress = updateProgProgress;
  window.syncTaskEdit       = syncTaskEdit;
})();