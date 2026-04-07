//constants.js — Constantes globales, catálogo y datos del juego

//tablero y eventos
var GRID_COLS       = 5;
var GRID_ROWS       = 5;
var HEX_SIZE        = 32;
var CANVAS_W        = 340;
var CANVAS_H        = 340;
var PIECES_PER_ROUND = 5;
var SHOP_USES_MAX   = 2;
var EVENT_USES_MAX  = 3;

//tipos de piezas
var TYPE_GEN   = 'generator';
var TYPE_TRANS = 'transformer';
var TYPE_CAT   = 'catalyst';
var TYPE_ANCH  = 'anchor';

var TYPE_COLORS = {
  generator:   '#00E5C8',
  transformer: '#FFD166',
  catalyst:    '#9B72CF',
  anchor:      '#56CFB2',
};

var TYPE_ICONS = {
  generator:   '⚡',
  transformer: '⚙',
  catalyst:    '✦',
  anchor:      '⬡',
};

var TYPE_LABELS = {
  generator:   'GENERADOR',
  transformer: 'TRANSFORMADOR',
  catalyst:    'CATALIZADOR',
  anchor:      'ANCLA',
};

var RARITIES      = ['común', 'poco común', 'rara', 'épica', 'legendaria'];
var RARITY_COLORS = ['#6B7FA3', '#56CFB2', '#9B72CF', '#FFD166', '#FF6B9D'];

//catalogo de piezas
var CATALOG = [
  { id:'gen_e', name:'Cristal de Energía',      type:TYPE_GEN,   output:2,           rarity:0, desc:'Genera 2 unidades de energía base.' },
  { id:'gen_h', name:'Núcleo Térmico',           type:TYPE_GEN,   output:3,           rarity:1, desc:'Genera 3 unidades de calor arcano.' },
  { id:'gen_p', name:'Emisor de Pulso',          type:TYPE_GEN,   output:4,           rarity:2, desc:'Genera 4 unidades de pulso arcano.' },
  { id:'gen_v', name:'Grieta del Vacío',         type:TYPE_GEN,   output:6,           rarity:3, desc:'Genera 6 unidades de energía pura.' },
  { id:'tr_b',  name:'Cámara de Corte',          type:TYPE_TRANS, multiplier:1.5,     rarity:0, desc:'Convierte recursos vecinos x1.5 en daño.' },
  { id:'tr_f',  name:'Fragua Arcana',            type:TYPE_TRANS, multiplier:2.0,     rarity:1, desc:'Convierte recursos vecinos x2.0 en daño.' },
  { id:'tr_s',  name:'Condensador de Tormenta', type:TYPE_TRANS, multiplier:2.8,     rarity:2, desc:'Convierte recursos vecinos x2.8.' },
  { id:'tr_v',  name:'Aniquilador',             type:TYPE_TRANS, multiplier:3.5,     rarity:3, desc:'Convierte recursos vecinos x3.5.' },
  { id:'cat_r', name:'Resonador',               type:TYPE_CAT,   amplify:0.25,       rarity:0, desc:'Amplifica vecinos +25%. Bonus si hay GEN+TRANS adyacentes.' },
  { id:'cat_p', name:'Prisma Arcano',           type:TYPE_CAT,   amplify:0.45,       rarity:2, desc:'Amplifica vecinos +45%.' },
  { id:'cat_n', name:'Nodo Nexo',               type:TYPE_CAT,   amplify:0.75,       rarity:3, desc:'Amplifica TODOS los vecinos +75%.' },
  { id:'anc_s', name:'Ancla de Escudo',         type:TYPE_ANCH,  shieldVal:10,       rarity:0, desc:'Genera 10 puntos de escudo cada ronda.' },
  { id:'anc_r', name:'Ancla de Regeneración',   type:TYPE_ANCH,  regenVal:6,         rarity:1, desc:'Recupera 6 HP al ganar el combate.' },
  { id:'anc_x', name:'Ancla Reflectora',        type:TYPE_ANCH,  reflectPct:0.25,    rarity:2, desc:'Refleja el 25% del daño entrante.' },
  { id:'anc_f', name:'Ancla Fortaleza',         type:TYPE_ANCH,  shieldVal:18,       rarity:3, desc:'Genera 18 puntos de escudo.' },
];

//enemigos
var ENEMIES = {
  combat: [
    { name:'Guardián Arcano',    build:'mixed',   flavorText:'Sus redes de energía pulsan en sintonía.' },
    { name:'Autómata de Cobre',  build:'tanky',   flavorText:'Cubierto de anclas, difícil de penetrar.' },
    { name:'Tejedor de Grietas', build:'aggro',   flavorText:'Ataca antes de que puedas reaccionar.' },
    { name:'Resonador Errante',  build:'amplify', flavorText:'Sus catalizadores multiplican cada golpe.' },
  ],
  elite: [
    { name:'Arquitecto del Vacío', build:'aggro', flavorText:'Ha perfeccionado el arte de la destrucción.' },
    { name:'Forjador Maldito',     build:'mixed',  flavorText:'Combina fuego y oscuridad en cada pieza.' },
  ],
  boss: [
    { name:'El Colapso',            build:'boss', flavorText:'El fin de todas las construcciones.' },
    { name:'Fractalis, el Primero', build:'boss', flavorText:'La primera pieza colocada en el tablero arcano.' },
    { name:'Nodo Supremo',          build:'boss', flavorText:'Control absoluto del tablero.' },
  ],
};

//eventos del mapa
var EVENT_POOL = [
  // (los eventos van aquí)
];

//definiciones de sprites
var SPRITE_DEF = {
  idle:        { src:'assets/sprites/idle.png',           cols:5,  rows:1, frameW:106, frameH:22,  totalFrames:5,  fps:8  },
  attack:      { src:'assets/sprites/attack.png',         cols:11, rows:1, frameW:106, frameH:22,  totalFrames:11, fps:12 },
  death:       { src:'assets/sprites/death.png',          cols:5,  rows:1, frameW:106, frameH:22,  totalFrames:5,  fps:8  },
  damaged:     { src:'assets/sprites/damaged.png',        cols:2,  rows:1, frameW:106, frameH:22,  totalFrames:2,  fps:8  },
  necroIdle:   { src:'assets/sprites/necromancer.png',    cols:8,  rows:4, frameW:128, frameH:140, totalFrames:8,  fps:8,  offsetRow:0 },
  necroAttack: { src:'assets/sprites/necromancer.png',    cols:8,  rows:4, frameW:128, frameH:140, totalFrames:8,  fps:10, offsetRow:2 },
  necroHurt:   { src:'assets/sprites/necromancer.png',    cols:8,  rows:4, frameW:128, frameH:140, totalFrames:8,  fps:8,  offsetRow:1 },
  necroDeath:  { src:'assets/sprites/necromancer.png',    cols:5,  rows:4, frameW:128, frameH:140, totalFrames:5,  fps:8,  offsetRow:3 },
  towerIdle:   { src:'assets/sprites/redtower.png',       cols:8,  rows:1, frameW:137, frameH:140, totalFrames:8,  fps:6  },
  golemIdle:   { src:'assets/sprites/Golem_1_idle.png',   cols:8,  rows:1, frameW:90,  frameH:64,  totalFrames:8,  fps:8  },
  golemAttack: { src:'assets/sprites/Golem_1_attack.png', cols:11, rows:1, frameW:90,  frameH:64,  totalFrames:11, fps:12 },
  golemHurt:   { src:'assets/sprites/Golem_1_hurt.png',   cols:4,  rows:1, frameW:90,  frameH:64,  totalFrames:4,  fps:10 },
  golemDie:    { src:'assets/sprites/Golem_1_die.png',    cols:13, rows:1, frameW:90,  frameH:64,  totalFrames:13, fps:10 },
  bossIdle:    { src:'assets/sprites/wizard_idle.png',    cols:10, rows:1, frameW:80,  frameH:80,  totalFrames:10, fps:8  },
  bossAttack:  { src:'assets/sprites/wizard_attack.png',  cols:8,  rows:5, frameW:250, frameH:100, totalFrames:8,  fps:10 },
  bossDeath:   { src:'assets/sprites/wizard_death.png',   cols:10, rows:1, frameW:80,  frameH:80,  totalFrames:10, fps:8  },
};
