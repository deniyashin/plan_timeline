// js/modules/dropdown.js — единый компонент выпадающего списка
// Зависимости: нет. Экспортирует window.createDropdown, window.positionDropdownBelow
(function () {

  // Умное позиционирование: для fixed — без scrollY, для absolute — с scrollY
  function positionBelow(popup, anchor) {
    var r = anchor.getBoundingClientRect();
    var fixed = popup.style.position === 'fixed';
    popup.style.top  = (r.bottom + (fixed ? 0 : window.scrollY) + 6) + 'px';
    popup.style.left = (r.left  + (fixed ? 0 : window.scrollX)) + 'px';
  }

  function bindOutsideClose(popup) {
    function handler(e) {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', handler, true);
      }
    }
    document.addEventListener('click', handler, true);
    return handler;
  }

  /**
   * createDropdown(anchor, items, onSelect, opts)
   *
   * anchor   — HTMLElement, кнопка-триггер
   * items    — Array<{ value, label, clear?, divider?, avatar?: { initials, isUnit } }>
   * onSelect — function(value)
   * opts     — { currentValue?, minWidth?, position?: 'fixed'|'absolute' }
   *
   * Если дропдаун уже открыт — закрывает его (toggle).
   */
  window.createDropdown = function (anchor, items, onSelect, opts) {
    opts = opts || {};
    var existing = document.getElementById('po-dropdown-active');
    if (existing) { existing.remove(); return; }

    var popup = document.createElement('div');
    popup.id = 'po-dropdown-active';
    popup.className = 'po-dropdown';
    popup.style.position = opts.position || 'fixed';
    if (opts.minWidth) popup.style.minWidth = opts.minWidth;

    items.forEach(function (item) {
      if (item.divider) {
        var hr = document.createElement('div');
        hr.className = 'po-dropdown-divider';
        popup.appendChild(hr);
        return;
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'po-dropdown-option';
      if (item.value === opts.currentValue) btn.classList.add('is-current');
      if (item.clear) btn.classList.add('po-dropdown-clear');

      if (item.avatar) {
        var av = document.createElement('span');
        av.className = 'po-dropdown-avatar' + (item.avatar.isUnit ? ' is-unit' : '');
        av.textContent = item.avatar.initials;
        btn.appendChild(av);
      }
      var lbl = document.createElement('span');
      lbl.textContent = item.label;
      btn.appendChild(lbl);

      btn.addEventListener('click', function () { popup.remove(); onSelect(item.value); });
      popup.appendChild(btn);
    });

    document.body.appendChild(popup);
    positionBelow(popup, anchor);

    var closeHandler = bindOutsideClose(popup);
    popup.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('click', closeHandler, true);
      }
    });

    return popup;
  };

  // Общая утилита позиционирования — используется также в календаре задач
  window.positionDropdownBelow = positionBelow;

}());
