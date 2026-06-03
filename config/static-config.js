// Статические данные конфигурации — вынесены из plan_timeline.js
// Загружается синхронно через <script> до основного файла.
// При переходе на ES modules заменится на import из js/config.js

window.PLAN_CONFIG = {

  MONTHS: [
    { domId: 'month-0',       key: '2026-04',     label: 'Апрель 2026' },
    { domId: 'month-1',       key: '2026-05',     label: 'Май 2026' },
    { domId: 'month-2',       key: '2026-06',     label: 'Июнь 2026' },
    { domId: 'month-3',       key: '2026-07',     label: 'Июль 2026' },
    { domId: 'month-4',       key: '2026-08',     label: 'Август 2026' },
    { domId: 'month-5',       key: '2026-09',     label: 'Сентябрь 2026' },
    { domId: 'month-6',       key: '2026-10',     label: 'Октябрь 2026' },
    { domId: 'month-7',       key: '2026-11',     label: 'Ноябрь 2026' },
    { domId: 'month-8',       key: '2026-12',     label: 'Декабрь 2026' },
    { domId: 'month-9',       key: '2027-01',     label: 'Январь 2027' },
    { domId: 'month-10',      key: '2027-02',     label: 'Февраль 2027' },
    { domId: 'month-11',      key: '2027-03',     label: 'Март 2027' },
    { domId: 'unscheduled',   key: 'unscheduled', label: 'Без месяца' }
  ],

  PEOPLE: {
    "AA": { "initials": "АА", "last": "Арамович",    "full": "Арман Арамович",                  "role": "Учредитель" },
    "VV": { "initials": "ВВ", "last": "Вазгенович",  "full": "Вардан Вазгенович",               "role": "Учредитель" },
    "OS": { "initials": "ОС", "last": "Сергеевич",   "full": "Олег Сергеевич",                  "role": "Учредитель" },
    "OA": { "initials": "ОА", "last": "Александрович","full": "Олег Александрович",              "role": "Учредитель" },
    "EM": { "initials": "ЕМ", "last": "Мездрикова",  "full": "Екатерина Мездрикова",            "role": "Финансовый директор" },
    "TP": { "initials": "ТП", "last": "Платухина",   "full": "Тамара Платухина",                "role": "Главный бухгалтер" },
    "GB": { "initials": "ГБ", "last": "Боде",        "full": "Галина Боде",                     "role": "Руководитель HR" },
    "KM": { "initials": "КМ", "last": "Москаленко",  "full": "Кристина Москаленко",             "role": "Старший тренер, методолог" },
    "AG": { "initials": "АГ", "last": "Гулевич",     "full": "Александр Гулевич",               "role": "Руководитель IT" },
    "NA": { "initials": "НА", "last": "Астафьева",   "full": "Надежда Астафьева",               "role": "РОП сети" },
    "DR": { "initials": "ДР", "last": "Рон",         "full": "Даниэль Рон",                     "role": "Руководитель департамента продаж" },
    "HA": { "initials": "ХА", "last": "Харламов",    "full": "Харламов Артем",                  "role": "Руководитель" },
    "KR": { "initials": "КР", "last": "Резуненко",   "full": "Константин Резуненко",            "role": "Руководитель" },
    "KE": { "initials": "КЕ", "last": "Краюшкина",   "full": "Краюшкина Елизавета",             "role": "Проектный офис / методолог" },
    "AK": { "initials": "АК", "last": "Краскевич",   "full": "Алексей Краскевич",               "role": "Руководитель" },
    "DB": { "initials": "ДБ", "last": "Бикбаева",    "full": "Динара Бикбаева",                 "role": "Руководитель" },
    "BO": { "initials": "БО", "last": "Белый",       "full": "Белый Олег Александрович",        "role": "Методолог" },
    "YD": { "initials": "ЯД", "last": "Яшин",        "full": "Яшин Денис",                      "role": "Руководитель" },
    "CK": { "initials": "ЧК", "last": "Чащин",       "full": "Чащин Кирилл",                    "role": "Руководитель / контур медицинского качества, стандартов, документации, рекламаций и лабораторного контроля" },
    "IZ": { "initials": "ИБ", "last": "Буйкова",     "full": "Ирина Буйкова",                   "role": "Руководитель" }
  },

  UNITS: {
    "unit_training": { "initials": "ФО", "last": "Функция обучения", "full": "Функция обучения", "role": "Подразделение" },
    "unit_po":       { "initials": "ПО", "last": "Проектный офис",   "full": "Проектный офис",   "role": "Подразделение" }
  },

  ROLES: {
    "anchor":       { "short": "И", "label": "Инициатор (учредитель)", "hint": "инициирует изменение и удерживает его" },
    "owner":        { "short": "В", "label": "Владелец внедрения", "hint": "контролирует использование на земле" },
    "methodologist":{ "short": "М", "label": "Методолог",          "hint": "отвечает за корректность бизнес-процесса" }
  },

  DEFAULT_ASSIGNMENTS: {
    "U-CHG-P-0.1":     { "anchor": ["AA"],       "owner": ["HA"],          "methodologist": ["BO"] },
    "U-HRM-P-0.2":     { "anchor": ["AA"],       "owner": ["KR"],          "methodologist": ["unit_training", "KE"] },
    "U-CLN-P-1.1":     { "anchor": ["OA"],       "owner": ["EM"],          "methodologist": ["OS"] },
    "U-UKM-P-1.2":     { "anchor": ["OA"],       "owner": ["EM"],          "methodologist": ["KE"] },
    "U-FIN-P-1.3":     { "anchor": ["OS"],       "owner": ["OA"],          "methodologist": ["KE"] },
    "U-SKL-P-1.4":     { "anchor": ["AA", "VV"], "owner": ["KR"],          "methodologist": ["AK"] },
    "U-LAB-P-1.5":     { "anchor": ["OA"],       "owner": ["EM"],          "methodologist": ["OS"] },
    "U-LEG-P-1.6":     { "anchor": ["OA"],       "owner": ["EM"],          "methodologist": ["TP"] },
    "U-DAT-P-2.1":     { "anchor": ["OS"],       "owner": ["AG"],          "methodologist": ["KE"] },
    "U-DAT-P-2.2":     { "anchor": ["OS"],       "owner": ["AA"],          "methodologist": ["KE"] },
    "U-DAT-P-2.3":     { "anchor": ["AA"],       "owner": ["VV"],          "methodologist": ["OA"] },
    "U-ALL-P-2.4":     { "anchor": ["AA"],       "owner": ["KE"],          "methodologist": ["OS"] },
    "U-CHG-P-2.5":     { "anchor": ["OS"],       "owner": ["OA"],          "methodologist": ["KE"] },
    "U-PAT-P-3.1":     { "anchor": ["AA"],       "owner": ["DR"],          "methodologist": ["KE", "OS"] },
    "U-SLS-P-3.2":     { "anchor": ["AA"],       "owner": ["NA", "AK"],    "methodologist": ["DR"] },
    "U-PAT-P-3.3":     { "anchor": ["OS"],       "owner": ["DB"],          "methodologist": ["AK"] },
    "U-CCT-P-3.4":     { "anchor": ["DR"],       "owner": ["DB"],          "methodologist": ["KE", "YD"] },
    "T-CCT-P-3.4.10":  { "anchor": ["DR"],       "owner": ["DB"],          "methodologist": ["KE"] },
    "U-PAT-P-3.5":     { "anchor": ["OS"],       "owner": ["DB", "DR"],    "methodologist": ["AK"] },
    "U-MKT-P-3.6":     { "anchor": ["DR"],       "owner": ["NA"],          "methodologist": ["unit_po"] },
    "U-CCT-P-3.7":     { "anchor": ["OS", "VV"], "owner": ["DR"],          "methodologist": ["DR"] },
    "U-HRM-P-4.1":     { "anchor": ["VV", "OS", "AA"], "owner": ["OA", "GB"], "methodologist": ["KE", "OS", "AA", "VV"] },
    "U-HRM-P-4.4":     { "anchor": ["VV", "AA"], "owner": ["KM", "GB"],    "methodologist": ["KE", "OA"] },
    "U-CHG-P-4.5":     { "anchor": ["OS"],       "owner": ["AK"],          "methodologist": ["KE"] },
    "U-HRM-P-4.6":     { "anchor": ["AA", "VV"], "owner": ["GB"],          "methodologist": ["OA", "OS"] },
    "U-HRM-P-4.7":     { "anchor": ["OA"],       "owner": ["KM", "GB"],    "methodologist": ["AA"] },
    "T-HRM-P-4.8":     { "anchor": ["OA"],       "owner": ["GB"],          "methodologist": ["KE"] },
    "U-MKT-P-5.1":     { "anchor": ["OS"],       "owner": ["NA"],          "methodologist": ["DR"] },
    "U-INF-P-5.2":     { "anchor": ["OA", "AA"], "owner": ["VV"],          "methodologist": ["OS"] },
    "U-LAB-P-5.3":     { "anchor": ["OA"],       "owner": ["HA", "VV"],    "methodologist": ["CK"] },
    "U-INF-P-5.4":     { "anchor": ["OA", "AA"], "owner": ["VV"],          "methodologist": ["OS"] },
    "U-CTR-P-5.5":     { "anchor": ["OA"],       "owner": ["EM"],          "methodologist": ["OS"] },
    "U-EMP-P-5.6":     { "anchor": ["OA"],       "owner": ["GB", "AG"],    "methodologist": ["KE", "AK"] },
    "U-CHT-P-5.7":     { "anchor": ["OA"],       "owner": ["GB"],          "methodologist": ["KE"] },
    "U-SPC-P-5.8":     { "anchor": ["AA"],       "owner": ["HA"],          "methodologist": ["CK"] },
    "T-MKT-P-5.9":     { "anchor": ["OS", "AA"], "owner": ["NA", "HA"],    "methodologist": ["DR"] },
    "T-MED-P-5.10":    { "anchor": ["AA"],       "owner": ["CK"],          "methodologist": ["KE"] },
    "U-UKM-P-0.3":     { "anchor": ["OA"],       "owner": ["OS"],          "methodologist": ["AA"] }
  },

  DEPS: {
    "U-DAT-P-2.1":    [["U-ALL-P-2.4",  "нужна до внедрения",               "confirmed"]],
    "U-DAT-P-2.2":    [["U-DAT-P-2.1",  "база для запуска",                 "confirmed"],
                       ["U-ALL-P-2.4",  "нужна до внедрения",               "confirmed"]],
    "U-DAT-P-2.3":    [["U-DAT-P-2.1",  "база для запуска",                 "confirmed"],
                       ["U-DAT-P-2.2",  "нужна до внедрения",               "confirmed"]],
    "U-CHG-P-2.5":    [["U-DAT-P-2.1",  "база для запуска",                 "confirmed"],
                       ["U-DAT-P-2.3",  "нужна до внедрения",               "confirmed"]],
    "U-PAT-P-3.1":    [["U-ALL-P-2.4",  "нужна до внедрения",               "confirmed"],
                       ["U-DAT-P-2.1",  "влияет на качество реализации",    "confirmed"]],
    "U-SLS-P-3.2":    [["U-PAT-P-3.1",  "база для запуска",                 "confirmed"],
                       ["U-DAT-P-2.2",  "влияет на качество реализации",    "likely"]],
    "U-PAT-P-3.3":    [["U-PAT-P-3.1",  "база для запуска",                 "confirmed"],
                       ["U-DAT-P-2.1",  "нужна до внедрения",               "confirmed"],
                       ["U-PAT-P-3.5",  "влияет на качество реализации",    "likely"]],
    "U-CCT-P-3.4":    [["U-PAT-P-3.1",  "база для запуска",                 "confirmed"],
                       ["U-DAT-P-2.1",  "нужна до внедрения",               "confirmed"],
                       ["U-DAT-P-2.2",  "влияет на качество реализации",    "confirmed"]],
    "U-PAT-P-3.5":    [["U-PAT-P-3.1",  "база для запуска",                 "confirmed"],
                       ["U-PAT-P-3.3",  "нужна до внедрения",               "likely"]],
    "U-MKT-P-3.6":    [["U-PAT-P-3.1",  "нужна до внедрения",               "confirmed"],
                       ["U-CCT-P-3.4",  "влияет на качество реализации",    "likely"]],
    "U-HRM-P-4.1":    [["U-ALL-P-2.4",  "база для запуска",                 "confirmed"],
                       ["U-FIN-P-1.3",  "влияет на качество реализации",    "likely"]],
    "U-HRM-P-4.4":    [["U-HRM-P-4.1",  "нужна до внедрения",               "confirmed"]],
    "U-CHG-P-4.5":    [["U-CHG-P-0.1",  "база для запуска",                 "confirmed"],
                       ["U-DAT-P-2.1",  "нужна до внедрения",               "confirmed"],
                       ["U-DAT-P-2.3",  "влияет на качество реализации",    "confirmed"]],
    "U-HRM-P-4.7":    [["U-HRM-P-4.1",  "нужна до внедрения",               "confirmed"]],
    "T-HRM-P-4.8":    [["U-HRM-P-4.1",  "нужна до внедрения",               "confirmed"],
                       ["U-HRM-P-4.7",  "влияет на качество реализации",    "likely"]],
    "U-HRM-P-4.6":    [["U-HRM-P-4.1",  "влияет на качество реализации",    "likely"]],
    "U-MKT-P-5.1":    [["U-MKT-P-3.6",  "синхронный запуск желателен",      "likely"],
                       ["T-MKT-P-5.9",  "синхронный запуск желателен",      "likely"]],
    "U-INF-P-5.2":    [["U-CLN-P-1.1",  "нужна до внедрения",               "confirmed"],
                       ["U-UKM-P-1.2",  "нужна до внедрения",               "confirmed"],
                       ["U-LEG-P-1.6",  "нужна до внедрения",               "confirmed"],
                       ["U-INF-P-5.4",  "база для запуска",                 "confirmed"]],
    "U-LAB-P-5.3":    [["U-LAB-P-1.5",  "нужна до внедрения",               "confirmed"]],
    "U-EMP-P-5.6":    [["T-HRM-P-4.8",  "синхронный запуск желателен",      "likely"]],
    "U-CHT-P-5.7":    [["U-EMP-P-5.6",  "база для запуска",                 "confirmed"]],
    "U-SPC-P-5.8":    [["U-PAT-P-3.1",  "нужна до внедрения",               "confirmed"],
                       ["U-CCT-P-3.4",  "влияет на качество реализации",    "confirmed"],
                       ["U-DAT-P-2.1",  "нужна до внедрения",               "likely"]],
    "T-MKT-P-5.9":    [["U-MKT-P-5.1",  "общая методологическая опора",     "likely"]],
    "T-MED-P-5.10":   [["U-ALL-P-2.4",  "база для запуска",                 "confirmed"],
                       ["U-DAT-P-2.1",  "нужна до внедрения",               "likely"],
                       ["U-HRM-P-4.1",  "влияет на качество реализации",    "likely"],
                       ["U-HRM-P-4.4",  "нужна до внедрения",               "likely"],
                       ["U-LAB-P-5.3",  "синхронный запуск желателен",      "likely"],
                       ["U-SPC-P-5.8",  "синхронный запуск желателен",      "likely"],
                       ["U-SLS-P-3.2",  "влияет на качество реализации",    "hypothesis"]],
    "T-CCT-P-3.4.10": [["U-CCT-P-3.4",  "общая методологическая опора",     "confirmed"]]
  },

  PROG_TO_CHANGE: {
    "U-CHG-P-0.1": "0", "U-HRM-P-0.2": "0", "U-UKM-P-0.3": "0",
    "U-CLN-P-1.1": "1", "U-UKM-P-1.2": "1", "U-FIN-P-1.3": "1",
    "U-SKL-P-1.4": "1", "U-LAB-P-1.5": "1", "U-LEG-P-1.6": "1",
    "U-DAT-P-2.1": "2", "U-DAT-P-2.2": "2", "U-DAT-P-2.3": "2",
    "U-ALL-P-2.4": "2", "U-CHG-P-2.5": "2",
    "U-PAT-P-3.1": "3", "U-SLS-P-3.2": "3", "U-PAT-P-3.3": "3",
    "U-CCT-P-3.4": "3", "T-CCT-P-3.4.10": "3", "U-PAT-P-3.5": "3", "U-MKT-P-3.6": "3", "U-CCT-P-3.7": "3",
    "U-HRM-P-4.1": "4",
    "U-HRM-P-4.4": "4", "U-CHG-P-4.5": "4", "U-HRM-P-4.6": "4",
    "U-HRM-P-4.7": "4", "T-HRM-P-4.8": "4",
    "U-MKT-P-5.1": "5", "U-INF-P-5.2": "5", "U-LAB-P-5.3": "5",
    "U-INF-P-5.4": "5", "U-CTR-P-5.5": "5", "U-EMP-P-5.6": "5",
    "U-CHT-P-5.7": "5", "U-SPC-P-5.8": "5", "T-MKT-P-5.9": "5", "T-MED-P-5.10": "5"
  },

  CHANGE_COLORS: {
    "0": "#5A554C",
    "1": "#8B2635",
    "2": "#1E6E7A",
    "3": "#B8750A",
    "4": "#2F5233",
    "5": "#2E3A8A"
  },

  _PEOPLE_DEFAULTS: null, // reserved for reset

  TASK_ST: [
    { v: 'not_started', icon: '○', title: 'Не начата'      },
    { v: 'in_progress', icon: '◑', title: 'В работе'       },
    { v: 'review',      icon: '◎', title: 'На проверке'    },
    { v: 'blocked',     icon: '⧓', title: 'Заблокирована'  },
    { v: 'done',        icon: '●', title: 'Готово'          },
    { v: 'cancelled',   icon: '✕', title: 'Отменена'        },
    { v: 'draft',       icon: '◌', title: 'Черновик'        }
  ],

  PROJ_STATUS_DEF: [
    { field: 'status', label: 'Статус', options: [
      { value: 'not-started', label: 'Не начат',  color: '#6B655C' },
      { value: 'in-progress', label: 'В работе',  color: '#1E6E7A' },
      { value: 'on-hold',     label: 'На паузе',  color: '#8E5C0E' },
      { value: 'done',        label: 'Завершён',  color: '#2F5233' },
      { value: 'cancelled',   label: 'Отменён',   color: '#8B2635' }
    ]},
    { field: 'approval', label: 'Согласование', options: [
      { value: 'not-approved', label: 'Не согласован',    color: '#6B655C' },
      { value: 'in-review',    label: 'На согласовании',  color: '#8E5C0E' },
      { value: 'approved',     label: 'Согласован',       color: '#2F5233' },
      { value: 'rejected',     label: 'Отклонён',         color: '#8B2635' }
    ]}
  ]

};

// Сохраняем исходный справочник до применения overrides
window.PLAN_CONFIG._PEOPLE_DEFAULTS = Object.assign({}, window.PLAN_CONFIG.PEOPLE);

// Применяем локальные overrides справочника сотрудников (из people-editor)
(function () {
  try {
    var raw = localStorage.getItem('po-people-overrides');
    if (raw) {
      var overrides = JSON.parse(raw);
      if (overrides && typeof overrides === 'object' && !Array.isArray(overrides)) {
        window.PLAN_CONFIG.PEOPLE = overrides;
      }
    }
  } catch (e) {}
}());
