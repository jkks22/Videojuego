// Arcane Assembly - TC2005B Equipo 4

// constantes del tablero
var GRID_COLS = 5;
var GRID_ROWS = 5;
var HEX_SIZE = 32;
var CANVAS_W = 340;
var CANVAS_H = 340;
var PIECES_PER_ROUND = 5;

var SHOP_USES_MAX = 2;
var EVENT_USES_MAX = 3;

// tipos de piezas
var TYPE_GEN   = 'generator';
var TYPE_TRANS = 'transformer';
var TYPE_CAT   = 'catalyst';
var TYPE_ANCH  = 'anchor';

var TYPE_COLORS = {
  generator: '#00E5C8',
  transformer: '#FFD166',
  catalyst: '#9B72CF',
  anchor: '#56CFB2'
};

var TYPE_ICONS = {
  generator: '⚡',
  transformer: '⚙',
  catalyst: '✦',
  anchor: '⬡'
};

var TYPE_LABELS = {
  generator: 'GENERADOR',
  transformer: 'TRANSFORMADOR',
  catalyst: 'CATALIZADOR',
  anchor: 'ANCLA'
};

var RARITIES      = ['común', 'poco común', 'rara', 'épica', 'legendaria'];
var RARITY_COLORS = ['#6B7FA3', '#56CFB2', '#9B72CF', '#FFD166', '#FF6B9D'];

/* catalogo de piezas */
var CATALOG = [
  { id:'gen_e', name:'Cristal de Energía', type:TYPE_GEN, output:2, rarity:0, desc:'Genera 2 unidades de energía base.' },
  { id:'gen_h', name:'Núcleo Térmico', type:TYPE_GEN, output:3, rarity:1, desc:'Genera 3 unidades de calor arcano.' },
  { id:'gen_p', name:'Emisor de Pulso', type:TYPE_GEN, output:4, rarity:2, desc:'Genera 4 unidades de pulso arcano.' },
  { id:'gen_v', name:'Grieta del Vacío', type:TYPE_GEN, output:6, rarity:3, desc:'Genera 6 unidades de energía pura.' },
  { id:'tr_b', name:'Cámara de Corte', type:TYPE_TRANS, multiplier:1.5, rarity:0, desc:'Convierte recursos vecinos x1.5 en daño.' },
  { id:'tr_f', name:'Fragua Arcana', type:TYPE_TRANS, multiplier:2.0, rarity:1, desc:'Convierte recursos vecinos x2.0 en daño.' },
  { id:'tr_s', name:'Condensador de Tormenta', type:TYPE_TRANS, multiplier:2.8, rarity:2, desc:'Convierte recursos vecinos x2.8.' },
  { id:'tr_v', name:'Aniquilador', type:TYPE_TRANS, multiplier:3.5, rarity:3, desc:'Convierte recursos vecinos x3.5.' },
  { id:'cat_r', name:'Resonador', type:TYPE_CAT, amplify:0.25, rarity:0, desc:'Amplifica vecinos +25%. Bonus si hay GEN+TRANS adyacentes.' },
  { id:'cat_p', name:'Prisma Arcano', type:TYPE_CAT, amplify:0.45, rarity:2, desc:'Amplifica vecinos +45%.' },
  { id:'cat_n', name:'Nodo Nexo', type:TYPE_CAT, amplify:0.75, rarity:3, desc:'Amplifica TODOS los vecinos +75%.' },
  { id:'anc_s', name:'Ancla de Escudo', type:TYPE_ANCH, shieldVal:10, rarity:0, desc:'Genera 10 puntos de escudo cada ronda.' },
  { id:'anc_r', name:'Ancla de Regeneración', type:TYPE_ANCH, regenVal:6, rarity:1, desc:'Recupera 6 HP al ganar el combate.' },
  { id:'anc_x', name:'Ancla Reflectora', type:TYPE_ANCH, reflectPct:0.25, rarity:2, desc:'Refleja el 25% del daño entrante.' },
  { id:'anc_f', name:'Ancla Fortaleza', type:TYPE_ANCH, shieldVal:18, rarity:3, desc:'Genera 18 puntos de escudo.' },
];

// enemigos
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

// eventos del mapa
var EVENT_POOL = [
  // ... (los eventos van aqui)
];

// ─────────────────────────────────────────────────────────

// funciones de ayuda (utils)

function getId(id) {
  return document.getElementById(id);
}

// elemento aleatorio de un array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(val, min, max) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

function waitMs(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

function getPiece(id) {
  for (var i = 0; i < CATALOG.length; i++) {
    if (CATALOG[i].id === id) return CATALOG[i];
  }
  return null;
}

// cambiar de pantalla
function showScreen(id) {
  var all = document.querySelectorAll('.screen');
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove('active');
  }
  getId(id).classList.add('active');
}

function showDmgPopup(text, x, y) {
  // ... implementacion
}

// ─────────────────────────────────────────────────────────

/* estado */
var State = {
  run: 1,
  hp: 100,
  maxHp: 100,
  impulse: 3,
  maxImpulse: 3,
  zone: 1,
  currentNode: null,
  mapNodes: [],
  combatsWon: 0,
  unlockedIds: ['gen_e', 'gen_e', 'tr_b', 'anc_s'],
  shopUses: 0,
  eventUses: 0,
};

// ─────────────────────────────────────────────────────────

// sistema de particulas
var fxCanvas    = null;
var fxCtx       = null;
var fxParticles = [];
var fxRafId     = null;

function fxInit() {
  // inicializar el canvas de efectos
}

function fxResize() {
  // ajustar tamaño del canvas
}

function fxLoop() {
  // loop de animacion de particulas
}

function fxSpawn(lista) {
  // crear particulas nuevas
}

function fxSynergy(x, y) {
  // efecto cuando hay sinergia entre piezas
}

function fxShield(x, y) {
  // efecto de escudo
}

function fxVictory(cx, cy) {
  // efecto de victoria
}

// ─────────────────────────────────────────────────────────

// sprites
var SPRITE_DEF = {
  // Protagonista
  idle:    { src:'assets/sprites/idle.png',    cols:5,  rows:1, frameW:106, frameH:22, totalFrames:5,  fps:8  },
  attack:  { src:'assets/sprites/attack.png',  cols:11, rows:1, frameW:106, frameH:22, totalFrames:11, fps:12 },
  death:   { src:'assets/sprites/death.png',   cols:5,  rows:1, frameW:106, frameH:22, totalFrames:5,  fps:8  },
  damaged: { src:'assets/sprites/damaged.png', cols:2,  rows:1, frameW:106, frameH:22, totalFrames:2,  fps:8  },
  // Enemigo zona 1 - Necromancer
  necroIdle:   { src:'assets/sprites/necromancer.png', cols:8,  rows:1, frameW:125, frameH:94, totalFrames:8,  fps:8,  offsetRow:0 },
  necroAttack: { src:'assets/sprites/necromancer.png', cols:12, rows:1, frameW:125, frameH:94, totalFrames:12, fps:12, offsetRow:2 },
  necroHurt:   { src:'assets/sprites/necromancer.png', cols:16, rows:1, frameW:125, frameH:94, totalFrames:16, fps:10, offsetRow:4 },
  necroDeath:  { src:'assets/sprites/necromancer.png', cols:5,  rows:1, frameW:125, frameH:94, totalFrames:5,  fps:8,  offsetRow:5 },
  // Enemigo zona 2 - Golem
  golemIdle:   { src:'assets/sprites/Golem_1_idle.png',   cols:8,  rows:1, frameW:90, frameH:64, totalFrames:8,  fps:8  },
  golemAttack: { src:'assets/sprites/Golem_1_attack.png', cols:11, rows:1, frameW:90, frameH:64, totalFrames:11, fps:12 },
  golemHurt:   { src:'assets/sprites/Golem_1_hurt.png',   cols:4,  rows:1, frameW:90, frameH:64, totalFrames:4,  fps:10 },
  golemDie:    { src:'assets/sprites/Golem_1_die.png',    cols:13, rows:1, frameW:90, frameH:64, totalFrames:13, fps:10 },
  // Boss - Mago
  bossIdle:   { src:'assets/sprites/wizard idle.png',   cols:10, rows:1, frameW:80, frameH:80, totalFrames:10, fps:8  },
  bossAttack: { src:'assets/sprites/wizard attack.png', cols:8,  rows:2, frameW:1280, frameH:1280, totalFrames:10, fps:10 },
  bossDeath:  { src:'assets/sprites/wizard death.png',  cols:10, rows:1, frameW:80, frameH:80, totalFrames:10, fps:8  },
};

var imgCache = {};

function loadImg(src) {
  // cargar imagen con cache
}

function SpriteAnimator(canvasId, def, loop, onDone, flip) {
  // constructor del animador de sprites
  this.canvas = getId(canvasId);
  this.ctx    = this.canvas ? this.canvas.getContext('2d') : null;
  this.def    = def;
  this.loop   = loop !== undefined ? loop : true;
  this.onDone = onDone || null;
  this.flip   = flip || false;
  this.frame  = 0;
  this.img    = null;
  this.rafId  = null;
  this._start();
}

SpriteAnimator.prototype._start   = function() { /* ... */ };
SpriteAnimator.prototype._tick    = function(now) { /* ... */ };
SpriteAnimator.prototype._draw    = function() { /* ... */ };
SpriteAnimator.prototype.stop     = function() { /* ... */ };
SpriteAnimator.prototype.changeDef = function(def, loop, onDone) { /* ... */ };

// vars de animacion
var playerAnim   = null;
var enemyAnim    = null;
var merchantAnim = null;
var npcAnim      = null;

function initBattleSprites(nombreEnemigo, isBoss) {
  // inicializar sprites segun el enemigo y zona
}

function updateSpriteHP(playerPct, enemyPct) { /* ... */ }
function playPlayerAttack(onDone) { /* ... */ }
function playEnemyAttack(onDone)  { /* ... */ }
function playEnemyDeath(onDone)   { /* ... */ }
function spriteHit(slot)          { /* ... */ }
function initDraftSprite()        { /* ... */ }
function initNpcSprite()          { /* ... */ }

// ─────────────────────────────────────────────────────────

// geometria hex
function hexCenter(col, row) {
  // calcular el centro en pixeles de una celda
}

function hexDraw(ctx, cx, cy, size, fill, stroke, label, labelColor, glowColor) {
  // dibujar un hexagono en el canvas
}

function hexCellAt(px, py) {
  // que celda hex corresponde a las coordenadas del mouse
}

function hexNeighbors(col, row) {
  // devuelve las 6 celdas vecinas de una posicion
}

// ─────────────────────────────────────────────────────────

// tablero - grillas del juego
var playerGrid = [];
var enemyGrid  = [];

// inicializar las dos grillas vacias
function boardInit() { /* ... */ }
function boardClear(side) { /* ... */ }
function boardPlace(col, row, pieceId, side) { /* ... */ }
function boardGet(col, row, side) { /* ... */ }
function boardCount(side) { /* ... */ }

function boardRender(canvasId, side, hoverCell, flashCells) {
  // dibujar el tablero completo con piezas, conexiones y efectos
}

function boardGenerateEnemy(zone, nodeType) {
  // generar el tablero del enemigo segun zona y tipo de nodo
}

// ─────────────────────────────────────────────────────────

/* combate */
var Combat = {

  running: false,
  buildRound: 1,
  enemyHp: 0,
  enemyMaxHp: 0,
  currentEnemy: null,

  init: function(zone, nodeType) {
    // inicializar un nuevo combate
  },

  resolveBoard: function(side) {
    // calcular dano y escudo del tablero
    // paso 1 - generadores
    // paso 2 - transformadores
    // paso 3 - catalizadores y sinergia
    // paso 4 - anclas
  },

  log: function(msg, tipo) {
    // agregar mensaje al log de combate
  },

  updateEnemyUI:  function() { /* ... */ },
  updatePlayerUI: function() { /* ... */ },
  updateImpulseUI: function() { /* ... */ },
  updatePreview:  function() { /* ... */ },

  runRound: async function() {
    // ejecutar una ronda completa de combate
    // jugador ataca -> enemigo contraataca -> revisar resultado
  },
};

// ─────────────────────────────────────────────────────────

// manejo de rondas
var RoundBuilder = {

  roundPieces: [],
  placed: 0,

  startBuildRound: function() {
    // preparar las piezas para la ronda de construccion
  },

  renderPieces: function() {
    // mostrar las tarjetas de piezas en el inventario
  },

  updateLabels: function() { /* ... */ },
  markPlaced:   function(index) { /* ... */ },
  addExtraPiece: function() { /* ... */ },
};

//UI de la batalla
var BattleUI = {

  selectedIndex: null,

  setup: function(node) {
    //configurar la pantalla de batalla para un nodo
  },

  selectPiece: function(index, cardEl) {
    //seleccionar una pieza del inventario
  },

  attachCanvasClick: function() {
    //eventos de clic en el canvas del tablero
  },

  clearBoard:  function() { /* ... */ },
  useImpulse:  function() { /* ... */ },
};

//tooltip
var Tooltip = {
  show: function(e, piece) { /* ... */ },
  hide: function() { /* ... */ },
};

//draft-pantalla de recompensa
var Draft = {
  show: function(zone, minRarity) {
    //mostrar 3 cartas de piezas para elegir
  },
};

// ─────────────────────────────────────────────────────────

// eventos
var Events = {
  trigger:  function() {},
  resolve:  function(choice) {},
};

// ─────────────────────────────────────────────────────────

// tienda
var Shop = {
  show: function(zone) {
    // mostrar la tienda con piezas disponibles
  },
};

// ─────────────────────────────────────────────────────────

// generar los nodos del mapa para la zona actual
function generateMap(zone) { /* ... */ }
function renderMap(nodes, onClickNode) { /* ... */ }


/* controlador principal */
var Game = {

  startRun: function() {
    //inicializar el estado y arrancar una run nueva
  },

  buildMap:  function(zone) { /* ... */ },
  renderMap: function() { /* ... */ },
  updateHUD: function() { /* ... */ },

  enterNode: function(node) {
    //decidir que hacer segun el tipo de nodo
  },

  afterCombatVictory: function() { /* ... */ },
  afterDraft:         function() { /* ... */ },
  skipDraft:          function() { /* ... */ },
  gameOver:           function() { /* ... */ },
  showStats:          function() { /* ... */ },
  restartToTitle:     function() { /* ... */ },
};

// ─────────────────────────────────────────────────────────

function buildTitleHexBackground() {
  //generar el fondo hexagonal animado de la pantalla de titulo
}

// inicio-cuando carga la pagina
document.addEventListener('DOMContentLoaded', function() {
  fxInit();
  window.addEventListener('resize', fxResize);
  buildTitleHexBackground();
});