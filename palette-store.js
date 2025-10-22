(function(global){
  const STORAGE_KEY = 'palette-studio-profiles';

  const BASE_TOKENS = [
    {variable:'--color-base', label:'Базовый фон', description:'Основная поверхность и большие секции (≈60%).', usage:['Фон','Hero','Секции'], default:'#F5F3FA'},
    {variable:'--color-secondary', label:'Вторичный цвет', description:'Карточки, блоки и подложки (≈30%).', usage:['Карточки','Подложки'], default:'#D6CFFE'},
    {variable:'--color-accent', label:'Акцентный цвет', description:'CTA, ссылки и бейджи (≈10%).', usage:['CTA','Ссылки','Бейджи'], default:'#FFB870'},
    {variable:'--color-neutral', label:'Нейтральный тёмный', description:'Текст, иконки и сильный контент.', usage:['Текст','Иконки'], default:'#2F2537'}
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
    {variable:'--surface-primary', label:'Поверхность основная', description:'Главный фон интерфейса.', defaultConfig:()=>({mode:'base', ref:'--color-base'})},
    {variable:'--surface-card', label:'Поверхность карточек', description:'Карточки и блоки.', defaultConfig:()=>({mode:'auto'}), auto:(base)=>mixColors(base['--color-base'], '#FFFFFF', 0.15)},
    {variable:'--surface-muted', label:'Поверхность приглушённая', description:'Вторичные подложки.', defaultConfig:()=>({mode:'auto'}), auto:(base)=>mixColors(base['--color-secondary'], '#FFFFFF', 0.65)},
    {variable:'--surface-hero', label:'Hero-поверхность', description:'Градиенты и крупные баннеры.', defaultConfig:()=>({mode:'auto'}), auto:(base)=>mixColors(base['--color-secondary'], base['--color-accent'], 0.4)},
    {variable:'--surface-accent', label:'Акцентная поверхность', description:'Выделенные блоки.', defaultConfig:()=>({mode:'auto'}), auto:(base)=>mixColors(base['--color-secondary'], base['--color-neutral'], 0.3)},
    {variable:'--text-strong', label:'Текст сильный', description:'Основной текст и заголовки.', defaultConfig:()=>({mode:'base', ref:'--color-neutral'})},
    {variable:'--text-muted', label:'Текст вторичный', description:'Подписи и пояснения.', defaultConfig:()=>({mode:'auto'}), auto:(base, alias)=>mixColors(base['--color-neutral'], alias['--surface-primary'] || base['--color-base'], 0.42)},
    {variable:'--border-subtle', label:'Границы мягкие', description:'Рамки и разделители.', defaultConfig:()=>({mode:'auto'}), auto:(base)=>mixColors(base['--color-secondary'], base['--color-neutral'], 0.12)},
    {variable:'--action-primary', label:'Primary action', description:'Основной CTA.', defaultConfig:()=>({mode:'auto'}), auto:(base)=>mixColors(base['--color-accent'], base['--color-neutral'], 0.18)},
    {variable:'--action-primary-hover', label:'Primary hover', description:'Hover/active для CTA.', defaultConfig:()=>({mode:'auto'}), auto:(base, alias)=>mixColors(alias['--action-primary'] || mixColors(base['--color-accent'], base['--color-neutral'], 0.18), '#FFFFFF', 0.08)},
    {variable:'--badge-accent', label:'Цвет бейджа', description:'Теги и небольшие акценты.', defaultConfig:()=>({mode:'auto'}), auto:(base)=>mixColors(base['--color-secondary'], '#FFFFFF', 0.45)}
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
