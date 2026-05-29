/**
 * js/app.js — точка входа приложения.
 *
 * Переход на ES modules происходит инкрементально по мере извлечения модулей.
 * По мере выполнения задач 3–13 функции переезжают сюда из plan_timeline.js.
 *
 * Текущее состояние:
 *   - Данные: window.PLAN_CONFIG из config/static-config.js
 *   - Логика: plan_timeline.js (monolith, legacy)
 *
 * Целевое состояние (после задач 3–13):
 *   import { lsGet, lsSet } from './utils/storage.js';
 *   import { MONTHS } from './utils/months.js';
 *   import { initTasks } from './modules/tasks.js';
 *   ... и т.д.
 */
