(function(global){
  const STORAGE_KEY = 'woodmart-studio-profiles-v1';

  const DEFAULT_CONFIG = Object.freeze({
    header:{
      color:'rgb(34, 34, 34)'
    },
    footer:{
      color:'rgb(24, 24, 24)'
    },
    typography:{
      basic:{
        fontFamily:'Inter',
        style:'Regular 400',
        type:'Cyrillic',
        fontSize:'16px',
        color:'rgb(34, 34, 34)'
      },
      title:{
        fontFamily:'Playfair Display',
        style:'SemiBold 600',
        type:'Cyrillic',
        textTransform:'none',
        color:'rgb(34, 34, 34)'
      },
      entities:{
        fontFamily:'Inter',
        style:'SemiBold 600',
        type:'Cyrillic',
        textTransform:'none',
        color:'rgb(34, 34, 34)',
        hoverColor:'rgb(192, 103, 255)'
      },
      secondary:{
        fontFamily:'Montserrat',
        style:'Medium 500',
        type:'Cyrillic'
      },
      widget:{
        fontFamily:'Inter',
        style:'SemiBold 600',
        type:'Cyrillic',
        textTransform:'uppercase',
        fontSize:'14px',
        color:'rgb(34, 34, 34)'
      },
      header:{
        fontFamily:'Inter',
        style:'Medium 500',
        type:'Cyrillic',
        textTransform:'uppercase',
        fontSize:'13px'
      }
    },
    colors:{
      primary:'rgb(192, 103, 255)',
      secondary:'rgb(87, 125, 255)'
    },
    backgrounds:{
      pages:{
        all:'rgb(245, 245, 247)'
      },
      shop:{
        archive:'rgb(255, 255, 255)',
        single:'rgb(250, 250, 252)'
      },
      blog:{
        archive:'rgb(255, 255, 255)',
        single:'rgb(250, 250, 252)'
      }
    },
    buttons:{
      default:{
        fontFamily:'Inter',
        style:'SemiBold 600',
        textTransform:'uppercase',
        background:'rgb(192, 103, 255)',
        hoverBackground:'rgb(173, 86, 236)'
      },
      accent:{
        fontFamily:'Playfair Display',
        style:'SemiBold 600',
        textTransform:'none',
        background:'rgb(34, 34, 34)',
        hoverBackground:'rgb(55, 55, 55)'
      }
    },
    links:{
      color:{
        regular:'rgb(129, 119, 142)',
        hover:'rgb(192, 103, 255)'
      },
      underline:{
        regular:'solid',
        hover:'solid'
      },
      underlineColor:{
        regular:'rgb(192, 103, 255)',
        hover:'rgb(129, 119, 142)'
      }
    }
  });

  function deepClone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function mergeConfig(base, patch){
    const result = Array.isArray(base) ? base.slice() : {...base};
    if(!patch){
      return result;
    }
    Object.keys(patch).forEach(key=>{
      const baseValue = base ? base[key] : undefined;
      const nextValue = patch[key];
      if(nextValue && typeof nextValue === 'object' && !Array.isArray(nextValue)){
        result[key] = mergeConfig(baseValue || {}, nextValue);
      }else{
        result[key] = nextValue;
      }
    });
    return result;
  }

  function generateId(){
    return 'profile-' + Math.random().toString(36).slice(2,7) + Date.now().toString(36);
  }

  function createProfile(name, config){
    return {
      id:generateId(),
      name:name || 'Новый профиль',
      createdAt:new Date().toISOString(),
      config:deepClone(config || DEFAULT_CONFIG)
    };
  }

  function preset(name, description, tags, overrides){
    return {
      id:'preset-' + name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      name,
      description,
      tags,
      config:mergeConfig(DEFAULT_CONFIG, overrides)
    };
  }

  const STANDARD_PRESETS = [
    preset('Scandi Soft', 'Спокойная скандинавская гамма с прохладным серо-бирюзовым акцентом.', ['calm','minimal'], {
      header:{color:'rgb(28, 35, 38)'},
      footer:{color:'rgb(21, 27, 30)'},
      typography:{
        basic:{fontFamily:'Manrope', style:'Regular 400', color:'rgb(32, 40, 45)'},
        title:{fontFamily:'Playfair Display', style:'SemiBold 600', color:'rgb(28, 35, 38)'},
        entities:{color:'rgb(18, 110, 130)', hoverColor:'rgb(12, 143, 160)'},
        secondary:{fontFamily:'Source Sans 3', style:'Medium 500'}
      },
      colors:{
        primary:'rgb(12, 143, 160)',
        secondary:'rgb(190, 210, 214)'
      },
      backgrounds:{
        pages:{all:'rgb(244, 248, 248)'},
        shop:{archive:'rgb(255, 255, 255)', single:'rgb(236, 244, 244)'},
        blog:{archive:'rgb(255, 255, 255)', single:'rgb(236, 244, 244)'}
      },
      buttons:{
        default:{background:'rgb(12, 143, 160)', hoverBackground:'rgb(10, 124, 139)'},
        accent:{background:'rgb(28, 35, 38)', hoverBackground:'rgb(46, 54, 58)'}
      },
      links:{
        color:{regular:'rgb(12, 143, 160)', hover:'rgb(10, 124, 139)'},
        underlineColor:{regular:'rgb(12, 143, 160)', hover:'rgb(28, 35, 38)'}
      }
    }),
    preset('Midnight Neon', 'Тёмная витрина с неоновыми акцентами для технологичных проектов.', ['dark','tech'], {
      header:{color:'rgb(12, 14, 24)'},
      footer:{color:'rgb(8, 9, 18)'},
      typography:{
        basic:{fontFamily:'Inter', color:'rgb(220, 226, 255)'},
        title:{fontFamily:'Montserrat', style:'Bold 700', color:'rgb(0, 255, 204)'},
        entities:{fontFamily:'Inter', style:'Medium 500', color:'rgb(0, 255, 204)', hoverColor:'rgb(255, 120, 230)'},
        widget:{color:'rgb(200, 210, 255)'},
        header:{fontSize:'14px'}
      },
      colors:{
        primary:'rgb(0, 255, 204)',
        secondary:'rgb(255, 120, 230)'
      },
      backgrounds:{
        pages:{all:'rgb(12, 14, 24)'},
        shop:{archive:'rgb(18, 21, 36)', single:'rgb(15, 17, 30)'},
        blog:{archive:'rgb(18, 21, 36)', single:'rgb(15, 17, 30)'}
      },
      buttons:{
        default:{background:'rgb(0, 255, 204)', hoverBackground:'rgb(0, 224, 190)'},
        accent:{background:'rgb(255, 120, 230)', hoverBackground:'rgb(230, 90, 210)'}
      },
      links:{
        color:{regular:'rgb(0, 255, 204)', hover:'rgb(255, 120, 230)'},
        underline:{regular:'dotted', hover:'solid'},
        underlineColor:{regular:'rgb(0, 255, 204)', hover:'rgb(255, 120, 230)'}
      }
    }),
    preset('Earthy Luxe', 'Природные землистые оттенки с золотистым акцентом для премиальных брендов.', ['premium','natural'], {
      header:{color:'rgb(48, 34, 24)'},
      footer:{color:'rgb(32, 23, 18)'},
      typography:{
        basic:{fontFamily:'Cormorant Garamond', style:'Regular 400', color:'rgb(60, 44, 34)'},
        title:{fontFamily:'Lora', style:'SemiBold 600', color:'rgb(48, 34, 24)'},
        entities:{fontFamily:'Cormorant Garamond', style:'Medium 500', color:'rgb(164, 125, 64)', hoverColor:'rgb(190, 152, 88)'},
        secondary:{fontFamily:'Source Sans 3', style:'Regular 400'},
        widget:{fontFamily:'Source Sans 3', color:'rgb(88, 68, 54)'}
      },
      colors:{
        primary:'rgb(164, 125, 64)',
        secondary:'rgb(90, 146, 124)'
      },
      backgrounds:{
        pages:{all:'rgb(249, 245, 238)'},
        shop:{archive:'rgb(250, 245, 236)', single:'rgb(244, 236, 222)'},
        blog:{archive:'rgb(250, 245, 236)', single:'rgb(244, 236, 222)'}
      },
      buttons:{
        default:{background:'rgb(164, 125, 64)', hoverBackground:'rgb(150, 112, 55)'},
        accent:{background:'rgb(90, 146, 124)', hoverBackground:'rgb(76, 129, 109)'}
      },
      links:{
        color:{regular:'rgb(90, 146, 124)', hover:'rgb(164, 125, 64)'},
        underlineColor:{regular:'rgb(164, 125, 64)', hover:'rgb(48, 34, 24)'}
      }
    }),
    preset('Fresh Pastel', 'Пастельная палитра для lifestyle-проектов и блогов.', ['pastel','lifestyle'], {
      header:{color:'rgb(242, 244, 248)'},
      footer:{color:'rgb(236, 238, 242)'},
      typography:{
        basic:{fontFamily:'Nunito', style:'Regular 400', color:'rgb(60, 60, 72)'},
        title:{fontFamily:'Poppins', style:'SemiBold 600', color:'rgb(58, 66, 92)'},
        entities:{fontFamily:'Poppins', style:'Medium 500', color:'rgb(229, 111, 148)', hoverColor:'rgb(84, 145, 196)'},
        widget:{fontFamily:'Nunito', color:'rgb(84, 145, 196)'}
      },
      colors:{
        primary:'rgb(229, 111, 148)',
        secondary:'rgb(84, 145, 196)'
      },
      backgrounds:{
        pages:{all:'rgb(250, 250, 252)'},
        shop:{archive:'rgb(255, 255, 255)', single:'rgb(246, 248, 252)'},
        blog:{archive:'rgb(255, 255, 255)', single:'rgb(246, 248, 252)'}
      },
      buttons:{
        default:{background:'rgb(229, 111, 148)', hoverBackground:'rgb(209, 96, 132)'},
        accent:{background:'rgb(84, 145, 196)', hoverBackground:'rgb(66, 126, 180)'}
      },
      links:{
        color:{regular:'rgb(84, 145, 196)', hover:'rgb(229, 111, 148)'},
        underlineColor:{regular:'rgb(84, 145, 196)', hover:'rgb(229, 111, 148)'}
      }
    }),
    preset('Citrus Energy', 'Яркая цитрусовая палитра с динамичными акцентами.', ['bold','commerce'], {
      header:{color:'rgb(18, 30, 32)'},
      footer:{color:'rgb(12, 20, 22)'},
      typography:{
        basic:{fontFamily:'Rubik', style:'Regular 400', color:'rgb(32, 46, 50)'},
        title:{fontFamily:'Rubik', style:'Bold 700', color:'rgb(255, 128, 0)'},
        entities:{fontFamily:'Rubik', style:'Medium 500', color:'rgb(255, 128, 0)', hoverColor:'rgb(0, 166, 156)'},
        widget:{fontFamily:'Rubik', color:'rgb(0, 166, 156)'}
      },
      colors:{
        primary:'rgb(255, 128, 0)',
        secondary:'rgb(0, 166, 156)'
      },
      backgrounds:{
        pages:{all:'rgb(244, 248, 247)'},
        shop:{archive:'rgb(255, 255, 255)', single:'rgb(240, 247, 245)'},
        blog:{archive:'rgb(255, 255, 255)', single:'rgb(240, 247, 245)'}
      },
      buttons:{
        default:{background:'rgb(255, 128, 0)', hoverBackground:'rgb(236, 118, 0)'},
        accent:{background:'rgb(0, 166, 156)', hoverBackground:'rgb(0, 140, 132)'}
      },
      links:{
        color:{regular:'rgb(0, 166, 156)', hover:'rgb(255, 128, 0)'},
        underlineColor:{regular:'rgb(0, 166, 156)', hover:'rgb(32, 46, 50)'}
      }
    }),
    preset('Noir Editorial', 'Редакционный стиль с глубоким контрастом и кинематографичными акцентами.', ['editorial','contrast'], {
      header:{color:'rgb(18, 18, 22)'},
      footer:{color:'rgb(12, 12, 16)'},
      typography:{
        basic:{fontFamily:'IBM Plex Serif', style:'Regular 400', color:'rgb(220, 220, 228)'},
        title:{fontFamily:'Playfair Display', style:'Bold 700', color:'rgb(255, 215, 160)'},
        entities:{fontFamily:'IBM Plex Serif', style:'Medium 500', color:'rgb(255, 215, 160)', hoverColor:'rgb(209, 108, 146)'},
        widget:{fontFamily:'IBM Plex Sans', color:'rgb(180, 180, 196)'},
        header:{fontFamily:'IBM Plex Sans', textTransform:'none', fontSize:'15px'}
      },
      colors:{
        primary:'rgb(255, 215, 160)',
        secondary:'rgb(209, 108, 146)'
      },
      backgrounds:{
        pages:{all:'rgb(18, 18, 22)'},
        shop:{archive:'rgb(24, 24, 30)', single:'rgb(20, 20, 26)'},
        blog:{archive:'rgb(24, 24, 30)', single:'rgb(20, 20, 26)'}
      },
      buttons:{
        default:{background:'rgb(255, 215, 160)', hoverBackground:'rgb(233, 192, 138)'},
        accent:{background:'rgb(209, 108, 146)', hoverBackground:'rgb(189, 92, 132)'}
      },
      links:{
        color:{regular:'rgb(255, 215, 160)', hover:'rgb(209, 108, 146)'},
        underline:{regular:'solid', hover:'dashed'},
        underlineColor:{regular:'rgb(255, 215, 160)', hover:'rgb(209, 108, 146)'}
      }
    }),
    preset('Ocean Breeze', 'Свежие морские оттенки для wellness-брендов и сервисов.', ['fresh','wellness'], {
      header:{color:'rgb(14, 52, 71)'},
      footer:{color:'rgb(10, 38, 54)'},
      typography:{
        basic:{fontFamily:'Source Sans 3', style:'Regular 400', color:'rgb(26, 64, 82)'},
        title:{fontFamily:'Manrope', style:'SemiBold 600', color:'rgb(18, 94, 121)'},
        entities:{fontFamily:'Manrope', style:'Medium 500', color:'rgb(0, 166, 203)', hoverColor:'rgb(0, 192, 212)'},
        widget:{fontFamily:'Source Sans 3', color:'rgb(0, 166, 203)'}
      },
      colors:{
        primary:'rgb(0, 166, 203)',
        secondary:'rgb(135, 206, 206)'
      },
      backgrounds:{
        pages:{all:'rgb(238, 246, 248)'},
        shop:{archive:'rgb(255, 255, 255)', single:'rgb(228, 242, 247)'},
        blog:{archive:'rgb(255, 255, 255)', single:'rgb(228, 242, 247)'}
      },
      buttons:{
        default:{background:'rgb(0, 166, 203)', hoverBackground:'rgb(0, 142, 183)'},
        accent:{background:'rgb(18, 94, 121)', hoverBackground:'rgb(14, 80, 104)'}
      },
      links:{
        color:{regular:'rgb(0, 166, 203)', hover:'rgb(18, 94, 121)'},
        underlineColor:{regular:'rgb(0, 166, 203)', hover:'rgb(18, 94, 121)'}
      }
    }),
    preset('Muted Clay', 'Приглушённые терракотовые оттенки с мягким контрастом.', ['calm','ecommerce'], {
      header:{color:'rgb(58, 42, 38)'},
      footer:{color:'rgb(44, 30, 28)'},
      typography:{
        basic:{fontFamily:'Mulish', style:'Regular 400', color:'rgb(64, 48, 44)'},
        title:{fontFamily:'Mulish', style:'SemiBold 600', color:'rgb(150, 104, 88)'},
        entities:{fontFamily:'Mulish', style:'Medium 500', color:'rgb(150, 104, 88)', hoverColor:'rgb(210, 150, 134)'},
        secondary:{fontFamily:'Mulish', style:'Regular 400'},
        widget:{fontFamily:'Mulish', color:'rgb(210, 150, 134)'}
      },
      colors:{
        primary:'rgb(150, 104, 88)',
        secondary:'rgb(210, 150, 134)'
      },
      backgrounds:{
        pages:{all:'rgb(249, 244, 240)'},
        shop:{archive:'rgb(255, 255, 255)', single:'rgb(244, 236, 232)'},
        blog:{archive:'rgb(255, 255, 255)', single:'rgb(244, 236, 232)'}
      },
      buttons:{
        default:{background:'rgb(150, 104, 88)', hoverBackground:'rgb(134, 90, 75)'},
        accent:{background:'rgb(58, 42, 38)', hoverBackground:'rgb(76, 58, 54)'}
      },
      links:{
        color:{regular:'rgb(150, 104, 88)', hover:'rgb(210, 150, 134)'},
        underlineColor:{regular:'rgb(150, 104, 88)', hover:'rgb(58, 42, 38)'}
      }
    }),
    preset('Digital Pop', 'Контрастная цифровая палитра с трендовыми градиентами.', ['modern','startup'], {
      header:{color:'rgb(18, 22, 46)'},
      footer:{color:'rgb(12, 16, 40)'},
      typography:{
        basic:{fontFamily:'DM Sans', style:'Regular 400', color:'rgb(214, 220, 255)'},
        title:{fontFamily:'Space Grotesk', style:'SemiBold 600', color:'rgb(118, 99, 255)'},
        entities:{fontFamily:'Space Grotesk', style:'Medium 500', color:'rgb(255, 89, 171)', hoverColor:'rgb(118, 99, 255)'},
        widget:{fontFamily:'DM Sans', color:'rgb(118, 99, 255)'}
      },
      colors:{
        primary:'rgb(118, 99, 255)',
        secondary:'rgb(255, 89, 171)'
      },
      backgrounds:{
        pages:{all:'rgb(18, 22, 46)'},
        shop:{archive:'rgb(26, 30, 60)', single:'rgb(22, 26, 54)'},
        blog:{archive:'rgb(26, 30, 60)', single:'rgb(22, 26, 54)'}
      },
      buttons:{
        default:{background:'rgb(118, 99, 255)', hoverBackground:'rgb(106, 88, 233)'},
        accent:{background:'rgb(255, 89, 171)', hoverBackground:'rgb(233, 74, 155)'}
      },
      links:{
        color:{regular:'rgb(118, 99, 255)', hover:'rgb(255, 89, 171)'},
        underline:{regular:'solid', hover:'solid'},
        underlineColor:{regular:'rgb(118, 99, 255)', hover:'rgb(255, 89, 171)'}
      }
    }),
    preset('Olive Studio', 'Оливково-нейтральная палитра для интерьерных и арт-проектов.', ['art','studio'], {
      header:{color:'rgb(40, 42, 32)'},
      footer:{color:'rgb(32, 34, 24)'},
      typography:{
        basic:{fontFamily:'Gentium Plus', style:'Regular 400', color:'rgb(50, 52, 40)'},
        title:{fontFamily:'Bodoni Moda', style:'SemiBold 600', color:'rgb(98, 109, 71)'},
        entities:{fontFamily:'Bodoni Moda', style:'Medium 500', color:'rgb(98, 109, 71)', hoverColor:'rgb(171, 161, 120)'},
        widget:{fontFamily:'Gentium Plus', color:'rgb(171, 161, 120)'}
      },
      colors:{
        primary:'rgb(98, 109, 71)',
        secondary:'rgb(171, 161, 120)'
      },
      backgrounds:{
        pages:{all:'rgb(244, 242, 232)'},
        shop:{archive:'rgb(249, 247, 236)', single:'rgb(238, 234, 222)'},
        blog:{archive:'rgb(249, 247, 236)', single:'rgb(238, 234, 222)'}
      },
      buttons:{
        default:{background:'rgb(98, 109, 71)', hoverBackground:'rgb(86, 96, 62)'},
        accent:{background:'rgb(171, 161, 120)', hoverBackground:'rgb(154, 143, 103)'}
      },
      links:{
        color:{regular:'rgb(98, 109, 71)', hover:'rgb(171, 161, 120)'},
        underlineColor:{regular:'rgb(98, 109, 71)', hover:'rgb(50, 52, 40)'}
      }
    })
  ];

  const STANDARD_PRESETS_LIMIT = 10;
  if(STANDARD_PRESETS.length < STANDARD_PRESETS_LIMIT){
    throw new Error('Недостаточно предустановленных профилей. Ожидалось 10.');
  }

  function loadState(){
    if(typeof window === 'undefined'){
      return {
        profiles:[createProfile('Основной профиль', DEFAULT_CONFIG)],
        activeId:null
      };
    }
    let raw;
    try{
      raw = window.localStorage.getItem(STORAGE_KEY);
    }catch(err){
      raw = null;
    }
    if(!raw){
      const initial = {
        profiles:[createProfile('Основной профиль', DEFAULT_CONFIG)],
        activeId:null
      };
      initial.activeId = initial.profiles[0].id;
      saveState(initial);
      return initial;
    }
    try{
      const parsed = JSON.parse(raw);
      if(!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0){
        throw new Error('State invalid');
      }
      parsed.profiles = parsed.profiles.map(profile=>({
        id:profile.id || generateId(),
        name:profile.name || 'Профиль',
        createdAt:profile.createdAt || new Date().toISOString(),
        config:mergeConfig(DEFAULT_CONFIG, profile.config || {})
      }));
      if(!parsed.activeId || !parsed.profiles.some(p=>p.id===parsed.activeId)){
        parsed.activeId = parsed.profiles[0].id;
      }
      return parsed;
    }catch(err){
      const fallback = {
        profiles:[createProfile('Основной профиль', DEFAULT_CONFIG)],
        activeId:null
      };
      fallback.activeId = fallback.profiles[0].id;
      saveState(fallback);
      return fallback;
    }
  }

  function saveState(state){
    if(typeof window === 'undefined'){
      return state;
    }
    try{
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profiles:state.profiles,
        activeId:state.activeId
      }));
    }catch(err){
      console.warn('Не удалось сохранить состояние Woodmart Studio', err);
    }
    return state;
  }

  function setActive(state, id){
    if(state.profiles.some(profile=>profile.id===id)){
      state.activeId = id;
      saveState(state);
    }
    return state;
  }

  function updateProfile(state, id, updater){
    const index = state.profiles.findIndex(profile=>profile.id===id);
    if(index === -1){
      return state;
    }
    const current = state.profiles[index];
    const nextConfig = typeof updater === 'function' ? updater(deepClone(current.config)) : mergeConfig(current.config, updater);
    state.profiles[index] = {
      ...current,
      config:nextConfig
    };
    saveState(state);
    return state;
  }

  function renameProfile(state, id, name){
    const profile = state.profiles.find(item=>item.id===id);
    if(profile){
      profile.name = name || profile.name;
      saveState(state);
    }
    return state;
  }

  function deleteProfile(state, id){
    if(state.profiles.length === 1){
      return state;
    }
    const index = state.profiles.findIndex(item=>item.id===id);
    if(index === -1){
      return state;
    }
    state.profiles.splice(index,1);
    if(state.activeId === id){
      state.activeId = state.profiles[0].id;
    }
    saveState(state);
    return state;
  }

  function duplicateProfile(state, id){
    const source = state.profiles.find(item=>item.id===id);
    if(!source){
      return state;
    }
    const clone = createProfile(source.name + ' (копия)', source.config);
    state.profiles.push(clone);
    state.activeId = clone.id;
    saveState(state);
    return state;
  }

  function resetProfile(state, id){
    return updateProfile(state, id, DEFAULT_CONFIG);
  }

  function getActiveProfile(state){
    return state.profiles.find(profile=>profile.id===state.activeId) || state.profiles[0];
  }

  function getStandardPresets(){
    return STANDARD_PRESETS.map(preset=>({
      ...preset,
      config:deepClone(preset.config)
    }));
  }

  function createProfileFromPreset(preset){
    const base = typeof preset === 'string'
      ? STANDARD_PRESETS.find(item=>item.id===preset)
      : preset;
    if(!base){
      return createProfile('Новый профиль', DEFAULT_CONFIG);
    }
    return createProfile(base.name, base.config);
  }

  function exportProfile(profile){
    return JSON.stringify({
      name:profile.name,
      generatedAt:new Date().toISOString(),
      woodmart:profile.config
    }, null, 2);
  }

  function validateImportedConfig(payload){
    if(!payload || typeof payload !== 'object'){
      throw new Error('Некорректная структура файла.');
    }
    if(!payload.woodmart || typeof payload.woodmart !== 'object'){
      throw new Error('В JSON не найдена секция "woodmart".');
    }
    return mergeConfig(DEFAULT_CONFIG, payload.woodmart);
  }

  function importProfile(payload){
    const normalized = validateImportedConfig(payload);
    const name = payload.name || 'Импортированный профиль';
    return createProfile(name, normalized);
  }

  function readColorAsHex(color){
    if(!color){
      return '#000000';
    }
    if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color.trim())){
      return normalizeHex(color);
    }
    const rgbMatch = color.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
    if(rgbMatch){
      const r = clampComponent(parseInt(rgbMatch[1],10));
      const g = clampComponent(parseInt(rgbMatch[2],10));
      const b = clampComponent(parseInt(rgbMatch[3],10));
      return '#' + [r,g,b].map(component=>component.toString(16).padStart(2,'0')).join('').toUpperCase();
    }
    return '#000000';
  }

  function clampComponent(value){
    if(Number.isNaN(value)){
      return 0;
    }
    return Math.max(0, Math.min(255, value));
  }

  function normalizeHex(value){
    if(!value){
      return '#000000';
    }
    const raw = value.trim().replace('#','');
    if(raw.length === 3){
      return '#' + raw.split('').map(char=>char+char).join('').toUpperCase();
    }
    return '#' + raw.padEnd(6,'0').slice(0,6).toUpperCase();
  }

  function colorToRgbString(value){
    if(!value){
      return 'rgb(0, 0, 0)';
    }
    if(/^rgb/i.test(value.trim())){
      return value;
    }
    const hex = normalizeHex(value);
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function setByPath(target, path, value){
    const segments = path.split('.');
    const last = segments.pop();
    let cursor = target;
    segments.forEach(segment=>{
      if(!cursor[segment] || typeof cursor[segment] !== 'object'){
        cursor[segment] = {};
      }
      cursor = cursor[segment];
    });
    cursor[last] = value;
    return target;
  }

  function getByPath(target, path){
    const segments = path.split('.');
    let cursor = target;
    for(const segment of segments){
      if(cursor == null){
        return undefined;
      }
      cursor = cursor[segment];
    }
    return cursor;
  }

  global.WoodmartStore = {
    DEFAULT_CONFIG:deepClone(DEFAULT_CONFIG),
    loadState,
    saveState,
    setActive,
    updateProfile,
    renameProfile,
    deleteProfile,
    duplicateProfile,
    resetProfile,
    getActiveProfile,
    getStandardPresets,
    createProfileFromPreset,
    createProfile,
    exportProfile,
    importProfile,
    readColorAsHex,
    colorToRgbString,
    normalizeHex,
    setByPath,
    getByPath
  };
})(typeof window !== 'undefined' ? window : globalThis);
