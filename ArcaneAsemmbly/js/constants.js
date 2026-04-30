//constants.js: constantes globales, catálogo de piezas, enemigos, eventos y sprites.

//dimensiones del tablero hexagonal y límites de jugabilidad
const GRID_COLS        = 5;
const GRID_ROWS        = 5;
const HEX_SIZE         = 48;
const CANVAS_W         = 500;
const CANVAS_H         = 500;
const PIECES_PER_ROUND = 5;   //piezas que el jugador coloca por ronda
const SHOP_USES_MAX    = 2;   //veces máximas que se puede usar la tienda por run
const EVENT_USES_MAX   = 3;   //eventos máximos por run

//identificadores internos de tipo de pieza
const TYPE_GEN   = 'generator';
const TYPE_TRANS = 'transformer';
const TYPE_CAT   = 'catalyst';
const TYPE_ANCH  = 'anchor';

//color de visualización por tipo de pieza
const TYPE_COLORS = {
  generator:   '#00E5C8',
  transformer: '#FFD166',
  catalyst:    '#9B72CF',
  anchor:      '#56CFB2',
};

//icono emoji por tipo de pieza
const TYPE_ICONS = {
  generator:   '⚡',
  transformer: '⚙',
  catalyst:    '✦',
  anchor:      '⬡',
};

//etiqueta de texto por tipo de pieza
const TYPE_LABELS = {
  generator:   'GENERADOR',
  transformer: 'TRANSFORMADOR',
  catalyst:    'CATALIZADOR',
  anchor:      'ANCLA',
};

// Nombres y colores de rareza (índice 0 = común … 4 = legendaria)
const RARITIES      = ['común', 'poco común', 'rara', 'épica', 'legendaria'];
const RARITY_COLORS = ['#6B7FA3', '#56CFB2', '#9B72CF', '#FFD166', '#FF6B9D'];

//catálogo completo de piezas del juego
//cada pieza tiene: id único, nombre, tipo, estadística principal, rareza y descripción
const CATALOG = [
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

//enemigos agrupados por tipo de nodo del mapa
const ENEMIES = {
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

//conjunto de eventos aleatorios que aparecen en nodos de tipo "event"
//cada evento tiene: icono, título, texto narrativo y arreglo de opciones con su efecto mecánico
const EVENT_POOL = [
  {
    icon: '⛲',
    title: 'SANTUARIO CURATIVO',
    text: 'Un santuario brillante irradia energía cálida.\nSus runas prometen restauración a quienes se arrodillen.',
    choices: [
      { label: 'Rezar en el santuario', effect: 'Recupera 25 HP, luego elige una pieza', action: 'heal', value: 25 },
      { label: 'Ignorarlo',             effect: 'No ocurre nada',                        action: 'skip' },
    ],
  },
  {
    icon: '📚',
    title: 'BIBLIOTECA ANTIGUA',
    text: 'Estantes decrépitos guardan planos de construcciones arcanas olvidadas.\nAlgunos parecen increíblemente poderosos.',
    choices: [
      { label: 'Estudiar los planos raros', effect: 'Obtén una pieza rara',        action: 'rare' },
      { label: 'Incendiar la biblioteca',   effect: 'Recibes 20 HP de daño',       action: 'dmg', value: 20 },
      { label: 'Alejarte',                  effect: 'No ocurre nada',              action: 'skip' },
    ],
  },
  {
    icon: '🔮',
    title: 'EXTRAÑO MISTERIOSO',
    text: 'Una figura encapuchada te ofrece una poderosa pieza arcana.\n"Sin costo", dice con una sonrisa torcida.',
    choices: [
      { label: 'Aceptar el regalo', effect: 'Obtén una pieza rara', action: 'rare' },
      { label: 'Rechazar la oferta', effect: 'No ocurre nada',      action: 'skip' },
    ],
  },
  {
    icon: '⚡',
    title: 'GÉISER DE MANÁ',
    text: 'Una línea ley crepitante erupciona del suelo bajo tus pies.\nEnergía mágica pura inunda el área.',
    choices: [
      { label: 'Absorber la energía',    effect: 'Recupera 20 HP, luego elige una pieza', action: 'heal', value: 20 },
      { label: 'Sobrecargar tu sistema', effect: 'Recibes 15 HP de daño',                 action: 'dmg',  value: 15 },
      { label: 'Ignorarlo',             effect: 'No ocurre nada',                          action: 'skip' },
    ],
  },
];

//definiciones de hojas de sprites — cols/rows describen el layout de la hoja
//offsetRow se usa cuando múltiples animaciones comparten la misma imagen
const SPRITE_DEF = {
  idle: { src:'assets/sprites/ingenieroarcano.png', cols:8, rows:1, frameW:120, frameH:160, totalFrames:8, fps:8 },
  attack:  { src:'assets/sprites/ingenieroattack.png',  cols:6, rows:1, frameW:160, frameH:160, totalFrames:6, fps:12 },
  death:   { src:'assets/sprites/ingenierodeath.png',   cols:6, rows:1, frameW:160, frameH:160, totalFrames:6, fps:8  },
  damaged: { src:'assets/sprites/ingenierodamaged.png', cols:4, rows:1, frameW:240, frameH:160, totalFrames:4, fps:8  },

  necroIdle:   { src:'assets/sprites/necromancer_green_idle.png',   cols:10, rows:1, frameW:96, frameH:160, totalFrames:10, fps:5 },
  necroAttack: { src:'assets/sprites/necromancer_green_attack.png', cols:10, rows:1, frameW:96, frameH:160, totalFrames:10, fps:7 },
  necroHurt:   { src:'assets/sprites/necromancer_green_hurt.png',   cols:10, rows:1, frameW:96, frameH:160, totalFrames:10, fps:6 },
  necroDeath:  { src:'assets/sprites/necromancer_green_death.png',  cols:10, rows:1, frameW:96, frameH:160, totalFrames:9,  fps:5, offsetCol:1 },

  golemIdle:   { src:'assets/sprites/Golem_1_idle.png',   cols:8,  rows:1, frameW:90,  frameH:64,  totalFrames:8,  fps:8  },
  golemAttack: { src:'assets/sprites/Golem_1_attack.png', cols:11, rows:1, frameW:90,  frameH:64,  totalFrames:11, fps:12 },
  golemHurt:   { src:'assets/sprites/Golem_1_hurt.png',   cols:4,  rows:1, frameW:90,  frameH:64,  totalFrames:4,  fps:10 },
  golemDie:    { src:'assets/sprites/Golem_1_die.png',    cols:13, rows:1, frameW:90,  frameH:64,  totalFrames:13, fps:10 },

  bossIdle:    { src:'assets/sprites/wizard_idle.png',    cols:10, rows:1, frameW:80,  frameH:80,  totalFrames:10, fps:8  },
  bossAttack:  { src:'assets/sprites/wizard_attack.png',  cols:8,  rows:5, frameW:250, frameH:100, totalFrames:8,  fps:10 },
  bossDeath:   { src:'assets/sprites/wizard_death.png',   cols:10, rows:1, frameW:80,  frameH:80,  totalFrames:10, fps:8  },
};
