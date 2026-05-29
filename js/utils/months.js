// js/utils/months.js — утилиты для работы с месяцами
// Извлечено из plan_timeline.js: строки 1-22 (глобальные функции)
// Должен загружаться ДО plan_timeline.js (MONTHS нужен сразу)

var MONTHS = window.PLAN_CONFIG.MONTHS;

function monthKeyFromDomSection(section) {
  var domId = section.id;
  var found = MONTHS.find(function (m) { return m.domId === domId; });
  return found ? found.key : 'unscheduled';
}
function monthLabelFromKey(key) {
  var found = MONTHS.find(function (m) { return m.key === key; });
  return found ? found.label : 'Без месяца';
}
function monthSortIndex(key) {
  var idx = MONTHS.findIndex(function (m) { return m.key === key; });
  return idx === -1 ? MONTHS.length : idx;
}
function isValidMonthKey(key) {
  return MONTHS.some(function (m) { return m.key === key; });
}
function getProgramInstances(programId) {
  return Array.from(document.querySelectorAll('.program[data-program-id="' + CSS.escape(programId) + '"]'));
}
