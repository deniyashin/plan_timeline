// js/utils/html.js — HTML-утилиты
// Извлечено из plan_timeline.js: escHtml (IIFE фильтров, строки ~87-91 и ~1001)
//   и sanitize (главный IIFE, строки ~1925-1949)

function escHtml(s) {
  var d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function sanitize(html) {
  var tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  tmp.querySelectorAll('script,style,link,iframe,object,embed,meta').forEach(function (el) { el.remove(); });
  tmp.querySelectorAll('*').forEach(function (el) {
    var keep = ['B','STRONG','I','EM','U','UL','OL','LI','BR','SPAN','P','DIV'];
    if (keep.indexOf(el.tagName) === -1) {
      var frag = document.createDocumentFragment();
      while (el.firstChild) frag.appendChild(el.firstChild);
      el.parentNode.replaceChild(frag, el);
      return;
    }
    Array.from(el.attributes).forEach(function (a) {
      if (a.name !== 'style') el.removeAttribute(a.name);
    });
    if (el.hasAttribute('style')) {
      var bg = el.style.backgroundColor;
      el.removeAttribute('style');
      if (bg) el.style.backgroundColor = bg;
    }
  });
  return tmp.innerHTML;
}
