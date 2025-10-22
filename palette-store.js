(function(global){
  const STORAGE_KEY = 'palette-studio-profiles';

  const BASE_TOKENS = [
    {
      variable:'--color-base',
      label:'Базовый фон',
      description:'Фон-основа интерфейса (≈60% площади): страницы, большие секции, холст приложения. Это самый светлый тон палитры, на котором строится --surface-primary и проверяется контраст с текстом.',
      usage:['Фон страницы','Основной холст','Крупные секции'],
      default:'#F5F3FA'
    },
    {
      variable:'--color-secondary',
      label:'Вторичный цвет',
      description:'Поддерживающий слой (≈30%): карточки, боковые панели, модальные окна. На его базе формируются --surface-card, --surface-muted, hero и акцентные блоки, поэтому оттенок должен быть плотнее базового фона.',
      usage:['Карточки','Вторичные секции','Модальные окна'],
      default:'#D6CFFE'
    },
    {
      variable:'--color-accent',
      label:'Акцентный цвет',
      description:'Акцент (≈10%): CTA, активные ссылки, бейджи и подсветки. Цвет определяет --action-primary и состояния наведения, поэтому обязан оставаться читаемым на светлых и тёмных поверхностях.',
      usage:['CTA-кнопки','Ссылки','Статусы и бейджи'],
      default:'#FFB870'
    },
    {
      variable:'--color-neutral',
      label:'Нейтральный тёмный',
      description:'Опорный нейтральный для текста, иконок и бордеров. Формирует --text-strong и участвует в миксах alias-токенов, поэтому выбирайте насыщенный, но не выбивающийся из палитры оттенок.',
      usage:['Основной текст','Иконки','Контрастные элементы'],
      default:'#2F2537'
    }
  ];

  function mixColors(hexA, hexB, weightB){
    const a = parseHex(hexA || '#000000');
    const b = parseHex(hexB || '#000000');
    const wb = Number.isFinite(weightB) ? clamp(weightB, 0, 1) : 0.5;
    const wa = 1 - wb;
    const mix = {
      r: a.r * wa + b.r * wb,
      g: a.g * wa + b.g * wb,
      b: a.b * wa + b.b * wb
    };
    return rgbToHex(mix);
  }

  const ALIAS_DEFS = [
    {
      variable:'--surface-primary',
      label:'Поверхность основная',
      description:'Главный фон интерфейса и стартовая точка для контрастов.',
      info:[
        'Роль: главный фон страницы, секций и обёрток — именно на нём пользователь проводит больше всего времени.',
        'Исходный токен: используйте оттенок из --color-base; в тёмных палитрах берите самый светлый допустимый тон, чтобы сохранить контраст.',
        'Иерархия: держите поверхность светлее, чем --surface-card минимум на 8–10% по яркости и ощутимо светлее, чем --surface-muted, чтобы слои не сливались.',
        'Контраст: проверяйте пары с --text-strong (≥4.5:1) и --text-muted (≥3:1); при длинных текстах стремитесь к 7:1.',
        'Пример: основной фон дашборда, на котором лежат карточки и hero-блок; разница в яркости подчёркивает иерархию.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'base', ref:'--color-base'})
    },
    {
      variable:'--surface-card',
      label:'Поверхность карточек',
      description:'Основные контейнеры контента и модальные блоки.',
      info:[
        'Роль: фон карточек контента, модальных окон, форм и панелей.',
        'Исходный токен: смешивайте --color-secondary с белым или нейтральным, чтобы получить цельный слой.',
        'Иерархия: держите поверхность на шаг темнее или насыщеннее, чем --surface-primary (6–12% по яркости), и чуть светлее, чем --surface-muted.',
        'Контраст: следите за коэффициентом ≥4.5:1 с --text-strong и ≥3:1 с --text-muted для вспомогательных блоков.',
        'Пример: карточка анонса или окно авторизации на светлом фоне — плотный фон помогает отделить блок от холста.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-base'], '#FFFFFF', 0.15)
    },
    {
      variable:'--surface-muted',
      label:'Поверхность приглушённая',
      description:'Вторичные слои и состояния наведения.',
      info:[
        'Роль: мягкая подложка для hover-состояний, вторичных панелей и фильтров.',
        'Исходный токен: осветляйте --color-secondary или смешивайте его с --surface-primary, чтобы сохранить связь с основой.',
        'Иерархия: делайте поверхность темнее, чем --surface-card, но заметно спокойнее, чем --surface-accent и --action-primary, чтобы не спорить с CTA.',
        'Контраст: допустим коэффициент около 3:1 с --text-muted и ≥4.5:1 с --text-strong, если элемент несёт основную информацию.',
        'Пример: фон строки списка при наведении, боковая панель фильтров или вторичная карточка внутри сетки.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], '#FFFFFF', 0.65)
    },
    {
      variable:'--surface-hero',
      label:'Hero-поверхность',
      description:'Фон для крупных баннеров, hero-блоков и витрин.',
      info:[
        'Роль: декоративная поверхность для hero-блоков, витрин, крупных баннеров.',
        'Исходный токен: смешивайте --color-secondary и --color-accent, можно добавлять нейтральный градиент для глубины.',
        'Иерархия: держите слой чуть светлее, чем --action-primary, чтобы кнопка не терялась и выделялась поверх.',
        'Контраст: обеспечьте ≥4.5:1 с белым текстом и UI-элементами; при тёмных надписях ориентируйтесь на ≥3:1.',
        'Пример: верхний баннер лендинга с основным сообщением и CTA-кнопкой.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], base['--color-accent'], 0.4)
    },
    {
      variable:'--surface-accent',
      label:'Акцентная поверхность',
      description:'Секции с повышенной важностью и маркетинговые блоки.',
      info:[
        'Роль: акцентные секции, промо-блоки, onboarding-панели.',
        'Исходный токен: используйте --color-secondary с добавлением --color-neutral или --color-accent для глубины.',
        'Иерархия: насыщенность должна быть выше, чем у --surface-muted, но ниже, чем у --action-primary, чтобы CTA сохранял приоритет.',
        'Контраст: обеспечьте ≥4.5:1 с белым текстом; при тёмном тексте ориентируйтесь на ≥3:1.',
        'Пример: промо-блок с иллюстрацией, выделенная панель тарифов или приветственная подсказка.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], base['--color-neutral'], 0.3)
    },
    {
      variable:'--text-strong',
      label:'Текст сильный',
      description:'Главные заголовки и основной текст.',
      info:[
        'Роль: главный цвет заголовков, параграфов и интерфейсных подписей.',
        'Исходный токен: напрямую ссылается на --color-neutral; при необходимости допускается кастомное значение в HEX.',
        'Иерархия: должен оставаться самым контрастным текстовым цветом и не сливаться с ссылками или статусами.',
        'Контраст: стремитесь к ≥7:1 для заголовков и ≥4.5:1 для параграфов на --surface-primary и --surface-card; на приглушённых поверхностях допустимо ≥3:1.',
        'Пример: основной текст статей, заголовки карточек, подписи на кнопках и интерактивных элементах.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'base', ref:'--color-neutral'})
    },
    {
      variable:'--text-muted',
      label:'Текст вторичный',
      description:'Подсказки, описания и служебные подписи.',
      info:[
        'Роль: подсказки, описания, второстепенные метки и подписи.',
        'Исходный токен: по умолчанию рассчитывается из --color-neutral и --surface-primary; можно задать собственный HEX.',
        'Иерархия: оттенок заметно светлее, чем --text-strong, чтобы визуально отходить на второй план.',
        'Контраст: держите ≥3:1 с фоном для служебных подписей и ≥4.5:1, если текст несёт важную информацию.',
        'Пример: описание формы, подсказки в карточках, метки времени или шаги онбординга.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base, alias)=>mixColors(base['--color-neutral'], alias['--surface-primary'] || base['--color-base'], 0.42)
    },
    {
      variable:'--border-subtle',
      label:'Границы мягкие',
      description:'Делители, рамки карточек и нейтральные контуры.',
      info:[
        'Роль: разделители, рамки карточек и нейтральные контуры.',
        'Исходный токен: используйте --color-secondary с добавлением --color-neutral или прозрачности.',
        'Иерархия: бордер должен быть чуть темнее, чем --surface-card, но мягче акцентных границ и кнопок.',
        'Контраст: убедитесь, что линия различима на --surface-primary и --surface-muted, но не отвлекает внимание.',
        'Пример: рамка карточки, разделитель секций, контур поля ввода или таблицы.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], base['--color-neutral'], 0.12)
    },
    {
      variable:'--action-primary',
      label:'Primary action',
      description:'Главная кнопка и ключевые CTA.',
      info:[
        'Роль: главный цвет действий — основные кнопки, CTA, ключевые переключатели.',
        'Исходный токен: опирается на --color-accent с добавлением --color-neutral для плотности.',
        'Иерархия: должен быть самым заметным цветом после брендовых поверхностей и не совпадать с --surface-accent.',
        'Контраст: обеспечьте ≥4.5:1 с белым текстом и ≥3:1 с --surface-primary и --surface-card.',
        'Пример: кнопка «Купить», CTA в hero-блоке, основное действие в диалоге или форме.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-accent'], base['--color-neutral'], 0.18)
    },
    {
      variable:'--action-primary-hover',
      label:'Primary hover',
      description:'Hover/active состояние CTA.',
      info:[
        'Роль: состояние наведения и нажатия для главных CTA.',
        'Исходный токен: формируется из --action-primary с примесью белого или --surface-primary.',
        'Иерархия: оттенок должен быть заметно светлее или теплее, чем --action-primary, чтобы подсветить интерактивность.',
        'Контраст: сохраняйте ≥4.5:1 с текстом кнопки и убедитесь, что цвет не конфликтует с --surface-accent.',
        'Пример: hover и active состояние основной кнопки при наведении мышью, фокусе клавиатурой или удержании.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base, alias)=>mixColors(alias['--action-primary'] || mixColors(base['--color-accent'], base['--color-neutral'], 0.18), '#FFFFFF', 0.08)
    },
    {
      variable:'--badge-accent',
      label:'Цвет бейджа',
      description:'Бейджи статусов, теги и счётчики.',
      info:[
        'Роль: фон для бейджей статуса, тегов и счётчиков уведомлений.',
        'Исходный токен: осветляйте --color-secondary или --color-accent, чтобы получить мягкий, но заметный оттенок.',
        'Иерархия: цвет должен быть светлее, чем --surface-muted, и отличаться от --action-primary, чтобы бейджи не выглядели как кнопки.',
        'Контраст: проверяйте читаемость с --text-strong или белым текстом (≥4.5:1).',
        'Пример: бейдж «Новая», индикатор статуса, счётчик уведомлений или тег в фильтре.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], '#FFFFFF', 0.45)
    }
  ];

  const RAW_DEFAULT_PROFILES = [
    {
      id:'balanced-mauve',
      name:'Нейтральный баланс',
      base:Object.fromEntries(BASE_TOKENS.map(token=>[token.variable, token.default])),
      aliases:{},
    },
    {
      id:'twilight-gold',
      name:'Сумеречный контраст',
      base:{
        '--color-base':'#1C1B23',
        '--color-secondary':'#2D2535',
        '--color-accent':'#E7A04E',
        '--color-neutral':'#F4F1FF'
      },
      aliases:{},
    }
  ];

  const RAW_STANDARD_PRESETS = [
    {
      id:'std-calm-productivity',
      name:'Calm Productivity',
      description:'Пастельные зелёные и фирменный фиолетовый — отражение тренда digital wellbeing в SaaS-интерфейсах.',
      tags:['SaaS','Wellbeing','2024'],
      base:{
        '--color-base':'#F4F6F3',
        '--color-secondary':'#E0E7DA',
        '--color-accent':'#7B61FF',
        '--color-neutral':'#1F1B2E'
      },
      aliases:{},
    },
    {
      id:'std-neo-brutal-citrus',
      name:'Neo Brutal Citrus',
      description:'Солнечная палитра с насыщенным акцентом подчёркивает популярность ярких neo-brutalist промо.',
      tags:['Promo','Neo-brutalism'],
      base:{
        '--color-base':'#FFF7EA',
        '--color-secondary':'#FFE0B5',
        '--color-accent':'#FF6F3C',
        '--color-neutral':'#26221C'
      },
      aliases:{},
    },
    {
      id:'std-midnight-neon',
      name:'Midnight Neon',
      description:'Контрастный тёмный фон с неоновым мятным — трендовый сетап для аналитических панелей и тех-платформ.',
      tags:['Dark UI','Analytics'],
      base:{
        '--color-base':'#0C101C',
        '--color-secondary':'#151B2F',
        '--color-accent':'#5AF2D6',
        '--color-neutral':'#F4FBFF'
      },
      aliases:{},
    },
    {
      id:'std-digital-lavender',
      name:'Digital Lavender',
      description:'Лавандовый оттенок — цвет 2023-2024 по WGSN, хорошо подходит для wellbeing и beauty-сервисов.',
      tags:['Beauty','Lifestyle'],
      base:{
        '--color-base':'#F8F5FF',
        '--color-secondary':'#E4DBFF',
        '--color-accent':'#C067FF',
        '--color-neutral':'#2A1B3C'
      },
      aliases:{},
    },
    {
      id:'std-nordic-contrast',
      name:'Nordic Contrast',
      description:'Холодный минимализм с ярким синим акцентом — любимец финтеха и продуктов в стиле new nordic.',
      tags:['Fintech','Minimal'],
      base:{
        '--color-base':'#F2F7F9',
        '--color-secondary':'#E0ECF2',
        '--color-accent':'#2F7CFF',
        '--color-neutral':'#1F2A36'
      },
      aliases:{},
    },
    {
      id:'std-eco-future',
      name:'Eco Future',
      description:'Мягкие биофильные зелёные для ESG-отчётности и климатических дашбордов.',
      tags:['ESG','Sustainability'],
      base:{
        '--color-base':'#F4FBF7',
        '--color-secondary':'#D8F0E0',
        '--color-accent':'#3DAA6A',
        '--color-neutral':'#1E2F26'
      },
      aliases:{},
    },
    {
      id:'std-sunset-pop',
      name:'Sunset Pop',
      description:'Тёплая sunset-палитра поддерживает тренд эмоциональных лендингов и email-подписок.',
      tags:['Marketing','Email'],
      base:{
        '--color-base':'#FFF3F2',
        '--color-secondary':'#FED9D7',
        '--color-accent':'#FF7A59',
        '--color-neutral':'#2D1B24'
      },
      aliases:{},
    },
    {
      id:'std-cyber-grape',
      name:'Cyber Grape',
      description:'Глубокий фиолетовый с яркой кнопкой — отсылка к no-code и creator platforms.',
      tags:['Creator','No-code'],
      base:{
        '--color-base':'#141021',
        '--color-secondary':'#201B34',
        '--color-accent':'#8C6CFF',
        '--color-neutral':'#F7F4FF'
      },
      aliases:{},
    },
    {
      id:'std-soft-sand',
      name:'Soft Sand',
      description:'Тёплые нейтралы с карамельным акцентом для HR-сервисов и lifestyle-редакций.',
      tags:['HR','Editorial'],
      base:{
        '--color-base':'#F9F5EF',
        '--color-secondary':'#E7DAC8',
        '--color-accent':'#D97742',
        '--color-neutral':'#2F2419'
      },
      aliases:{},
    },
    {
      id:'std-oceanic-flow',
      name:'Oceanic Flow',
      description:'Бирюзовые тона поддерживают тренд digital wellbeing и сервисов здоровья/фитнеса.',
      tags:['Health','Productivity'],
      base:{
        '--color-base':'#F1FAFC',
        '--color-secondary':'#DCEFF4',
        '--color-accent':'#1D9AA5',
        '--color-neutral':'#103540'
      },
      aliases:{},
    }
  ];

  function clone(value){
    if(typeof global.structuredClone === 'function'){
      try{
        return global.structuredClone(value);
      }catch(e){
        // fall back to JSON clone
      }
    }
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeHex(value){
    if(!value) return '';
    let hex = String(value).trim();
    if(hex.startsWith('#')) hex = hex.slice(1);
    if(hex.length === 3){
      hex = hex.split('').map(ch=>ch+ch).join('');
    }
    if(!/^[0-9a-fA-F]{6}$/.test(hex)) return '';
    return '#'+hex.toUpperCase();
  }

  function randomId(){
    return 'id-'+Math.random().toString(36).slice(2,8);
  }

  function normalizeProfile(profile){
    const base = {};
    BASE_TOKENS.forEach(token=>{
      const raw = profile?.base?.[token.variable];
      base[token.variable] = normalizeHex(raw) || token.default;
    });
    const aliases = {};
    ALIAS_DEFS.forEach(def=>{
      const stored = profile?.aliases?.[def.variable];
      let config = stored && stored.mode ? {...stored} : def.defaultConfig();
      if(config.mode === 'base'){
        if(!BASE_TOKENS.some(token=>token.variable === config.ref)){
          config = def.defaultConfig();
        }
      }else if(config.mode === 'custom'){
        const hex = normalizeHex(config.value);
        if(hex){
          config = {...config, value:hex};
        }else{
          config = def.defaultConfig();
        }
      }else if(config.mode !== 'auto'){
        config = def.defaultConfig();
      }
      aliases[def.variable] = config;
    });
    return {
      id: profile?.id || randomId(),
      name: profile?.name || 'Безымянный профиль',
      base,
      aliases
    };
  }

  function resolveAliases(profile){
    const aliasColors = {};
    ALIAS_DEFS.forEach(def=>{
      const config = profile.aliases?.[def.variable] || def.defaultConfig();
      let color;
      if(config.mode === 'base' && BASE_TOKENS.some(token=>token.variable === config.ref)){
        color = profile.base[config.ref];
      }else if(config.mode === 'custom' && config.value){
        color = normalizeHex(config.value) || config.value;
      }else if(config.mode === 'auto' && typeof def.auto === 'function'){
        color = def.auto(profile.base, aliasColors, config);
      }
      if(!color){
        const fallback = def.defaultConfig();
        if(fallback.mode === 'base' && BASE_TOKENS.some(token=>token.variable === fallback.ref)){
          color = profile.base[fallback.ref];
        }else if(fallback.mode === 'custom' && fallback.value){
          color = normalizeHex(fallback.value) || fallback.value;
        }else{
          color = profile.base['--color-base'] || '#000000';
        }
      }
      aliasColors[def.variable] = color;
    });
    return aliasColors;
  }

  function parseHex(hex){
    const normalized = normalizeHex(hex) || '#000000';
    return {
      r: parseInt(normalized.slice(1,3),16),
      g: parseInt(normalized.slice(3,5),16),
      b: parseInt(normalized.slice(5,7),16)
    };
  }

  function rgbToHex({r,g,b}){
    const toHex = value=>{
      const clamped = clamp(Math.round(value), 0, 255);
      const hex = clamped.toString(16).toUpperCase();
      return hex.length===1?'0'+hex:hex;
    };
    return '#'+[r,g,b].map(toHex).join('');
  }

  function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
  }

  const DEFAULT_PROFILES = RAW_DEFAULT_PROFILES.map(profile=>normalizeProfile(profile));
  const STANDARD_PRESETS = RAW_STANDARD_PRESETS.map(entry=>({
    id: entry.id,
    name: entry.name,
    description: entry.description || '',
    tags: Array.isArray(entry.tags) ? entry.tags.slice() : [],
    profile: normalizeProfile(entry)
  }));
  const DEFAULT_STATE = {activeId:'balanced-mauve', profiles:DEFAULT_PROFILES};

  function hydrateState(state){
    if(!state || !Array.isArray(state.profiles)){
      return clone(DEFAULT_STATE);
    }
    const profiles = state.profiles.map(normalizeProfile);
    if(!profiles.length){
      return clone(DEFAULT_STATE);
    }
    const activeId = profiles.some(profile=>profile.id===state.activeId)
      ? state.activeId
      : profiles[0].id;
    return {activeId, profiles};
  }

  function loadState(){
    const fallback = clone(DEFAULT_STATE);
    try{
      if(!global.localStorage) return fallback;
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if(!raw) return fallback;
      const parsed = JSON.parse(raw);
      return hydrateState(parsed);
    }catch(e){
      return fallback;
    }
  }

  function saveState(state){
    const sanitized = hydrateState(state || {});
    try{
      if(global.localStorage){
        const payload = {
          activeId: sanitized.activeId,
          profiles: sanitized.profiles
        };
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    }catch(e){
      // ignore persistence errors
    }
    return sanitized;
  }

  function applyPalette(profile){
    const root = global.document?.documentElement;
    if(!root) return {};
    const normalized = profile && profile.base && profile.aliases ? profile : normalizeProfile(profile);
    Object.entries(normalized.base).forEach(([key,value])=>root.style.setProperty(key,value));
    const aliases = resolveAliases(normalized);
    Object.entries(aliases).forEach(([key,value])=>root.style.setProperty(key,value));
    return aliases;
  }

  function getDefaultState(){
    return clone(DEFAULT_STATE);
  }

  function getDefaultProfiles(){
    return DEFAULT_PROFILES.map(profile=>clone(profile));
  }

  function getStandardPresets(){
    return STANDARD_PRESETS.map(preset=>(
      {
        id:preset.id,
        name:preset.name,
        description:preset.description,
        tags:preset.tags.slice(),
        profile:clone(preset.profile)
      }
    ));
  }

  const API = {
    STORAGE_KEY,
    BASE_TOKENS,
    ALIAS_DEFS,
    DEFAULT_PROFILES: getDefaultProfiles(),
    STANDARD_PRESETS: getStandardPresets(),
    getDefaultProfiles,
    getStandardPresets,
    getDefaultState,
    loadState,
    saveState,
    hydrateState,
    normalizeProfile,
    resolveAliases,
    applyPalette,
    mixColors,
    normalizeHex,
    randomId,
    clone
  };

  if(typeof module !== 'undefined' && module.exports){
    module.exports = API;
  }
  global.PaletteStore = API;
})(typeof window !== 'undefined' ? window : globalThis);
