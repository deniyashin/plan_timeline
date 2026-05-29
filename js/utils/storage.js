// js/utils/storage.js — localStorage helpers
// Извлечено из plan_timeline.js: главный IIFE, строки ~1702-1705
// lsSet вызывает window.flash (устанавливается в plan_timeline.js после определения flash)

function lsGet(k) {
  try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) { return {}; }
}
function lsSet(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    if (typeof window.flash === 'function') window.flash();
  } catch (e) {}
}
function lsRaw(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function lsRawSet(k, v) {
  try { localStorage.setItem(k, v); } catch (e) {}
}
