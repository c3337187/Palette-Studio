(function(global){
  const STORAGE_KEY = 'palette-studio-profiles';

  const BASE_TOKENS = [
    {
      variable:'--color-base',
      label:'Базовый фон',
      description:'Тон, задающий доминирующий фон (≈60%) и служащий источником для --surface-primary. Должен быть самым светлым из базовых цветов, чтобы обеспечивать контраст 4.5:1 с основным текстом.',
      usage:['Фон','Hero','Секции'],
      default:'#F5F3FA'
    },
    {
      variable:'--color-secondary',
      label:'Вторичный цвет',
      description:'Оттенок для второго слоя (≈30%), используемый в --surface-card, --surface-muted, --surface-hero и --surface-accent. Выбирайте его чуть глубже базового фона, чтобы строить иерархию между блоками.',
      usage:['Карточки','Подложки'],
      default:'#D6CFFE'
    },
    {
      variable:'--color-accent',
      label:'Акцентный цвет',
      description:'Активные элементы и микровзаимодействия (≈10%). На его основе генерируются --action-primary, состояния hover и часть hero-градиента, поэтому оттенок должен оставаться читаемым на светлом и тёмном фоне.',
      usage:['CTA','Ссылки','Бейджи'],
      default:'#FFB870'
    },
    {
      variable:'--color-neutral',
      label:'Нейтральный тёмный',
      description:'Главный цвет текста, иконок и контрастных элементов. Формирует --text-strong и влияет на подмешивание во вторичные состояния, поэтому выбирайте насыщенный, но не кричащий тон.',
      usage:['Текст','Иконки'],
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
        'Что это: фон-основа для страницы, крупных секций и общих контейнеров.',
        'Как сочетается: должна быть самой светлой поверхностью; держите её светлее --surface-card минимум на 8–10% по яркости и значительно светлее --surface-muted, чтобы текст (--text-strong) стабильно достигал контраста ≥ 4.5:1.',
        'Как настроить: в светлой теме берите оттенок из --color-base, в тёмной — выбирайте самый светлый тон палитры и оставляйте лёгкий брендовый подтон, чтобы фон не выглядел серым.',
        'Пример: основной фон дашборда, на котором лежат карточки и hero-блок; за счёт разницы яркости они считываются отдельными слоями.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'base', ref:'--color-base'})
    },
    {
      variable:'--surface-card',
      label:'Поверхность карточек',
      description:'Основные контейнеры контента и модальные блоки.',
      info:[
        'Что это: фон для карточек, модальных окон, форм, панелей настроек.',
        'Как сочетается: делайте её на шаг темнее или насыщеннее, чем --surface-primary (разница яркости 6–12%), чтобы блоки читались отдельными слоями, но всё ещё давали контраст ≥ 4.5:1 с --text-strong. Поддерживайте связь с --surface-muted, чтобы состояния hover выглядели родственно.',
        'Как настроить: используйте --color-secondary, смягчённый белым или нейтральным, и проверяйте, что оттенок не конкурирует по силе с --surface-accent и --action-primary.',
        'Пример: карточка анонса, окно авторизации или плитка товара — слегка более плотная подложка помогает отделить содержимое от общего фона.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-base'], '#FFFFFF', 0.15)
    },
    {
      variable:'--surface-muted',
      label:'Поверхность приглушённая',
      description:'Вторичные слои и состояния наведения.',
      info:[
        'Что это: мягкая подложка для состояний наведения, вторичных панелей, фильтров.',
        'Как сочетается: ощутимо темнее, чем --surface-card, но светлее и спокойнее, чем --surface-accent и --action-primary, чтобы внимание усиливалось без конкуренции с CTA. Контраст с --text-muted может быть около 3:1, а с --text-strong ≥ 4.5:1 по необходимости.',
        'Как настроить: смешайте --color-secondary с белым или нейтральным, оставляя заметную связь с карточками и героем.',
        'Пример: фон строки списка при наведении, боковая панель фильтров, вторичная карточка внутри сетки.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], '#FFFFFF', 0.65)
    },
    {
      variable:'--surface-hero',
      label:'Hero-поверхность',
      description:'Фон для крупных баннеров, hero-блоков и витрин.',
      info:[
        'Что это: декоративная поверхность для витрины, hero-разделов, больших баннеров.',
        'Как сочетается: собирает воедино --color-secondary и --color-accent, оставаясь чуть светлее --action-primary, чтобы CTA не терялся, и обеспечивая контраст ≥ 4.5:1 с белым текстом и элементами.',
        'Как настроить: используйте насыщенный градиент или плотный микс без выбеленных участков, чтобы блок ощущался самостоятельным слоем и не дублировал --surface-card.',
        'Пример: верхний баннер лендинга с призывом к действию или hero-иллюстрацией.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], base['--color-accent'], 0.4)
    },
    {
      variable:'--surface-accent',
      label:'Акцентная поверхность',
      description:'Секции с повышенной важностью и маркетинговые блоки.',
      info:[
        'Что это: фон для выделенных секций, маркетинговых блоков, onboarding-элементов.',
        'Как сочетается: по насыщенности занимает место между --surface-muted и --action-primary. Контраст с белым текстом держите ≥ 4.5:1, а при тёмном тексте проверяйте ≥ 3:1.',
        'Как настроить: смешивайте --color-secondary с небольшим количеством --color-neutral, чтобы добавить глубины и отличить блок от карточек, но не перекрыть внимание главной кнопки.',
        'Пример: промо-блок с иллюстрацией, выделенная панель тарифов, onboarding-подсказка с иконкой.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], base['--color-neutral'], 0.3)
    },
    {
      variable:'--text-strong',
      label:'Текст сильный',
      description:'Главные заголовки и основной текст.',
      info:[
        'Что это: основной цвет текста для заголовков, параграфов, элементов интерфейса.',
        'Как сочетается: обеспечивает контраст ≥ 7:1 для заголовков и ≥ 4.5:1 для параграфов по отношению к --surface-primary и --surface-card; на приглушённых поверхностях допускается ≥ 3:1 для вспомогательных элементов.',
        'Как настроить: берите насыщенный нейтральный тон из --color-neutral, избегайте цветных оттенков, чтобы текст не воспринимался как ссылка или статус.',
        'Пример: основной текст статей, заголовки карточек, подписи на кнопках и интерактивных элементах.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'base', ref:'--color-neutral'})
    },
    {
      variable:'--text-muted',
      label:'Текст вторичный',
      description:'Подсказки, описания и служебные подписи.',
      info:[
        'Что это: цвет текста для подсказок, описаний, второстепенных меток.',
        'Как сочетается: заметно светлее --text-strong и ближе к --surface-primary, чтобы визуально отходить на второй план; держите контраст ≥ 3:1 с поверхностями и ≥ 4.5:1, если текст несёт важную информацию.',
        'Как настроить: смешивайте --color-neutral с --surface-primary или --surface-card (в тёмной теме — наоборот, затемняйте светлую базу), пока текст не станет мягким, но читаемым.',
        'Пример: описание формы, вспомогательные подписи в карточках, метки времени или номера шагов.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base, alias)=>mixColors(base['--color-neutral'], alias['--surface-primary'] || base['--color-base'], 0.42)
    },
    {
      variable:'--border-subtle',
      label:'Границы мягкие',
      description:'Делители, рамки карточек и нейтральные контуры.',
      info:[
        'Что это: контуры и разделители, которые создают структуру без жёстких линий.',
        'Как сочетается: чуть темнее или насыщеннее, чем --surface-card, но заметно мягче, чем акцентные границы. Опирается на --color-secondary с каплей --color-neutral, чтобы не выпадать из палитры.',
        'Как настроить: используйте прозрачность или лёгкие миксы; проверяйте, что бордер остаётся различимым на --surface-primary и --surface-muted, но не перетягивает внимание.',
        'Пример: рамка карточки, разделитель секций, контур полей ввода и таблиц.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base)=>mixColors(base['--color-secondary'], base['--color-neutral'], 0.12)
    },
    {
      variable:'--action-primary',
      label:'Primary action',
      description:'Главная кнопка и ключевые CTA.',
      info:[
        'Что это: основной цвет активных действий — главные кнопки, CTA, ключевые переключатели.',
        'Как сочетается: самый насыщенный цвет после брендовых поверхностей. Держите контраст ≥ 4.5:1 с белым текстом и ≥ 3:1 с --surface-primary и --surface-card, чтобы элементы были заметны и доступны.',
        'Как настроить: используйте --color-accent с примесью --color-neutral для глубины; убедитесь, что оттенок не совпадает с --surface-accent и не теряется на hero-поверхности.',
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
        'Что это: состояние наведения и нажатия для главных CTA.',
        'Как сочетается: чуть светлее или теплее, чем --action-primary, чтобы подсветить интерактивность, сохраняя контраст ≥ 4.5:1 с текстом и поверхностью, на которой находится кнопка.',
        'Как настроить: добавьте к --action-primary белый или светлую часть --surface-primary; убедитесь, что оттенок не уходит в серый и не конфликтует с --surface-accent.',
        'Пример: состояние основной кнопки при наведении курсора, фокусе с клавиатуры или удержании.'
      ].join('\n\n'),
      defaultConfig:()=>({mode:'auto'}),
      auto:(base, alias)=>mixColors(alias['--action-primary'] || mixColors(base['--color-accent'], base['--color-neutral'], 0.18), '#FFFFFF', 0.08)
    },
    {
      variable:'--badge-accent',
      label:'Цвет бейджа',
      description:'Бейджи статусов, теги и счетчики.',
      info:[
        'Что это: фон для бейджей статуса, тегов, счётчиков уведомлений.',
        'Как сочетается: светлее и мягче, чем --surface-muted, чтобы не спорить с контентом, но даёт достаточный контраст для текста бейджа (обычно --text-strong или белый). Не должен повторять тон --action-primary, иначе бейджи будут выглядеть как кнопки.',
        'Как настроить: осветлите --color-secondary или --color-accent; регулируйте насыщенность, чтобы элементы оставались заметными на --surface-primary и --surface-card.',
        'Пример: бейдж «Новая», индикатор статуса, счётчик уведомлений или тег в списке фильтров.'
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

  const API = {
    STORAGE_KEY,
    BASE_TOKENS,
    ALIAS_DEFS,
    DEFAULT_PROFILES: getDefaultProfiles(),
    getDefaultProfiles,
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
