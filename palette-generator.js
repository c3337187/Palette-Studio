(function(global){
  const FONT_LIBRARY = {
    manrope:{
      id:'manrope',
      family:'Manrope',
      stack:"'Manrope', sans-serif",
      css:'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap&subset=cyrillic',
      category:'sans-serif',
      tags:['современный','универсальный']
    },
    inter:{
      id:'inter',
      family:'Inter',
      stack:"'Inter', sans-serif",
      css:'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=cyrillic',
      category:'sans-serif',
      tags:['универсальный','UI']
    },
    rubik:{
      id:'rubik',
      family:'Rubik',
      stack:"'Rubik', sans-serif",
      css:'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap&subset=cyrillic',
      category:'sans-serif',
      tags:['технологичный']
    },
    montserrat:{
      id:'montserrat',
      family:'Montserrat',
      stack:"'Montserrat', sans-serif",
      css:'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap&subset=cyrillic',
      category:'sans-serif',
      tags:['геометрический']
    },
    playfair:{
      id:'playfair',
      family:'Playfair Display',
      stack:"'Playfair Display', serif",
      css:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap&subset=cyrillic',
      category:'serif',
      tags:['редакционный','премиальный']
    },
    lora:{
      id:'lora',
      family:'Lora',
      stack:"'Lora', serif",
      css:'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap&subset=cyrillic',
      category:'serif',
      tags:['читаемый','редакционный']
    },
    sourceSans:{
      id:'source-sans',
      family:'Source Sans 3',
      stack:"'Source Sans 3', sans-serif",
      css:'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap&subset=cyrillic',
      category:'sans-serif',
      tags:['гуманистический']
    },
    notoSans:{
      id:'noto-sans',
      family:'Noto Sans',
      stack:"'Noto Sans', sans-serif",
      css:'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap&subset=cyrillic',
      category:'sans-serif',
      tags:['универсальный']
    },
    cormorant:{
      id:'cormorant',
      family:'Cormorant Garamond',
      stack:"'Cormorant Garamond', serif",
      css:'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap&subset=cyrillic',
      category:'serif',
      tags:['эстетичный']
    },
    ubuntu:{
      id:'ubuntu',
      family:'Ubuntu',
      stack:"'Ubuntu', sans-serif",
      css:'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap&subset=cyrillic',
      category:'sans-serif',
      tags:['технологичный','нейтральный']
    }
  };

  const FONT_PAIRINGS = [
    {
      id:'modern',
      heading:'manrope',
      text:'inter',
      ui:'manrope',
      match:hsl=>hsl.s<0.5 && hsl.l>0.45
    },
    {
      id:'editorial',
      heading:'playfair',
      text:'inter',
      ui:'inter',
      match:hsl=>hsl.h>=20 && hsl.h<=70 && hsl.l>0.35
    },
    {
      id:'tech',
      heading:'rubik',
      text:'notoSans',
      ui:'rubik',
      match:hsl=>hsl.h>=180 && hsl.h<=260 && hsl.s>=0.35
    },
    {
      id:'contrast',
      heading:'montserrat',
      text:'sourceSans',
      ui:'montserrat',
      match:hsl=>hsl.l<0.35
    },
    {
      id:'classic',
      heading:'lora',
      text:'sourceSans',
      ui:'sourceSans',
      match:()=>true
    }
  ];

  function generatePalette(mainColor, options={}){
    const baseHex = normalizeHex(mainColor);
    if(!baseHex){
      throw new Error('Укажите корректный HEX основного цвета (например, #FFB870).');
    }

    const dominantHsl = rgbToHsl(hexToRgb(baseHex));
    const brightenRatio = clamp(0.18 + (0.5 - dominantHsl.l) * 0.35, 0.08, 0.38);
    const baseSurface = mixColors(baseHex, '#FFFFFF', brightenRatio);

    const secondaryShift = dominantHsl.h >= 35 && dominantHsl.h <= 220 ? 28 : -26;
    const secondaryHue = normalizeHue(dominantHsl.h + secondaryShift);
    const secondaryS = clamp(dominantHsl.s * 0.72 + 0.1, 0.2, 0.78);
    const secondaryL = clamp(dominantHsl.l * 0.85 + 0.12, 0.28, 0.8);
    const secondaryTone = hslToHex({h:secondaryHue, s:secondaryS, l:secondaryL});

    const accentHue = normalizeHue(dominantHsl.h + 180);
    const accentS = clamp(Math.max(dominantHsl.s, 0.45) + 0.18, 0.55, 0.95);
    const accentL = clamp(0.56 - (dominantHsl.l - 0.5) * 0.45, 0.34, 0.62);
    const accentTone = hslToHex({h:accentHue, s:accentS, l:accentL});

    const baseSurfaceHsl = rgbToHsl(hexToRgb(baseSurface));
    const neutral = baseSurfaceHsl.l > 0.58
      ? '#1F1A27'
      : mixColors('#FFFFFF', baseSurface, 0.82);

    const cardSurface = mixColors(baseSurface, secondaryTone, 0.24);
    const mutedSurface = mixColors(secondaryTone, '#FFFFFF', clamp(brightenRatio + 0.18, 0.3, 0.55));
    const heroSurface = mixColors(secondaryTone, accentTone, 0.42);
    const accentSurface = mixColors(secondaryTone, neutral, 0.2);
    const border = mixColors(secondaryTone, neutral, 0.18);
    const actionPrimary = mixColors(accentTone, neutral, baseSurfaceHsl.l > 0.6 ? 0.16 : 0.26);
    const actionHover = mixColors(actionPrimary, '#FFFFFF', 0.1);
    const mutedText = mixColors(neutral, baseSurface, 0.42);
    const badge = mixColors(secondaryTone, '#FFFFFF', 0.48);

    const tokens = {
      '--color-base':baseSurface,
      '--color-secondary':secondaryTone,
      '--color-accent':accentTone,
      '--color-neutral':neutral
    };

    const aliases = {
      '--surface-primary':{mode:'base', ref:'--color-base'},
      '--surface-card':{mode:'custom', value:cardSurface},
      '--surface-muted':{mode:'custom', value:mutedSurface},
      '--surface-hero':{mode:'custom', value:heroSurface},
      '--surface-accent':{mode:'custom', value:accentSurface},
      '--text-strong':{mode:'base', ref:'--color-neutral'},
      '--text-muted':{mode:'custom', value:mutedText},
      '--border-subtle':{mode:'custom', value:border},
      '--action-primary':{mode:'custom', value:actionPrimary},
      '--action-primary-hover':{mode:'custom', value:actionHover},
      '--badge-accent':{mode:'custom', value:badge}
    };

    const fonts = pickFontMeta(dominantHsl);

    const profile = {
      dominant:baseHex,
      base:baseSurface,
      secondary:secondaryTone,
      accent:accentTone,
      neutral,
      muted:mutedSurface,
      action:actionPrimary,
      hero:heroSurface,
      ratio:{
        primary:baseSurface,
        secondary:mutedSurface,
        accent:actionPrimary
      },
      fonts:{
        main:fonts.text.family,
        heading:fonts.heading.family,
        ui:fonts.ui.family
      }
    };

    return {
      profile,
      tokens,
      aliases,
      fonts,
      meta:{
        strategy:'60-30-10',
        distribution:{primary:60, secondary:30, accent:10},
        source:'PaletteGenerator',
        input:baseHex
      }
    };
  }

  function pickFontMeta(baseHsl){
    const pair = FONT_PAIRINGS.find(option=>option.match(baseHsl)) || FONT_PAIRINGS[FONT_PAIRINGS.length-1];
    return {
      heading:resolveFont(pair.heading),
      text:resolveFont(pair.text),
      ui:resolveFont(pair.ui)
    };
  }

  function resolveFont(key){
    const font = FONT_LIBRARY[key];
    if(!font){
      return FONT_LIBRARY.inter;
    }
    return {...font};
  }

  function normalizeHue(value){
    let hue = value % 360;
    if(hue < 0){
      hue += 360;
    }
    return hue;
  }

  function normalizeHex(hex){
    if(typeof hex !== 'string'){return null;}
    const trimmed = hex.trim();
    const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    const valid = /^#([0-9a-fA-F]{6})$/;
    if(valid.test(prefixed)){
      return prefixed.toUpperCase();
    }
    const short = /^#([0-9a-fA-F]{3})$/;
    if(short.test(prefixed)){
      const m = short.exec(prefixed)[1];
      return `#${m[0]}${m[0]}${m[1]}${m[1]}${m[2]}${m[2]}`.toUpperCase();
    }
    return null;
  }

  function hexToRgb(hex){
    const normalized = normalizeHex(hex);
    if(!normalized){return {r:0,g:0,b:0};}
    const value = parseInt(normalized.slice(1), 16);
    return {
      r:(value >> 16) & 255,
      g:(value >> 8) & 255,
      b:value & 255
    };
  }

  function rgbToHex({r,g,b}){
    const toHex = v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbToHsl({r,g,b}){
    const rn = r/255;
    const gn = g/255;
    const bn = b/255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    if(delta !== 0){
      if(max === rn){
        h = ((gn - bn) / delta) % 6;
      } else if(max === gn){
        h = (bn - rn) / delta + 2;
      } else {
        h = (rn - gn) / delta + 4;
      }
      h *= 60;
      if(h < 0){h += 360;}
    }
    const l = (max + min) / 2;
    let s = 0;
    if(delta !== 0){
      s = delta / (1 - Math.abs(2 * l - 1));
    }
    return {h, s, l};
  }

  function hslToHex({h,s,l}){
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if(h >= 0 && h < 60){
      r = c; g = x; b = 0;
    } else if(h >= 60 && h < 120){
      r = x; g = c; b = 0;
    } else if(h >= 120 && h < 180){
      r = 0; g = c; b = x;
    } else if(h >= 180 && h < 240){
      r = 0; g = x; b = c;
    } else if(h >= 240 && h < 300){
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    return rgbToHex({
      r:(r + m) * 255,
      g:(g + m) * 255,
      b:(b + m) * 255
    });
  }

  function mixColors(a, b, ratio){
    const weight = clamp(ratio, 0, 1);
    const rgbA = hexToRgb(a);
    const rgbB = hexToRgb(b);
    return rgbToHex({
      r:rgbA.r * (1 - weight) + rgbB.r * weight,
      g:rgbA.g * (1 - weight) + rgbB.g * weight,
      b:rgbA.b * (1 - weight) + rgbB.b * weight
    });
  }

  function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
  }

  const api = {generatePalette};

  if(typeof module !== 'undefined' && module.exports){
    module.exports = api;
  }
  global.PaletteGenerator = api;

  if(typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module){
    const input = process.argv[2];
    if(!input){
      console.error('Usage: node palette-generator.js <HEX-color>');
      process.exit(1);
    }
    try{
      const result = generatePalette(input);
      console.log(JSON.stringify(result.profile, null, 2));
    }catch(error){
      console.error(error.message);
      process.exit(1);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
