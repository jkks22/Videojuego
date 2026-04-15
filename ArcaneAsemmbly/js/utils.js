//utils.js: Estado global del juego, funciones auxiliares de DOM y sistema de audio procedural (SFX).

//estado global único compartido por todos los módulos del juego
var State = {
  run: 1,//número de run actual
  hp: 100,//HP actual del jugador
  maxHp: 100,//HP máximo del jugador
  impulse: 3,//cargas de impulso disponibles
  maxImpulse: 3,//máximo de cargas de impulso
  zone: 1,//zona del mapa 1–3
  currentNode: null,//nodo activo del mapa
  mapNodes: [],//lista de nodos generados para esta zona
  combatsWon: 0,//victorias en combate acumuladas
  unlockedIds:  ['gen_e', 'gen_e', 'tr_b', 'anc_s'],//piezas en la colección del jugador
  shopUses: 0,//veces que se usó la tienda en esta run
  eventUses: 0,//eventos que se han activado en esta run
};

//atajo para document.getElementById
function getId(id) {
  return document.getElementById(id);
}

//devuelve un elemento aleatorio de un arreglo
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//limita val entre min y max (inclusive)
function clamp(val, min, max) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

//Devuelve una Promesa que se resuelve después de ms milisegundos
function waitMs(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

//busca y devuelve la definición de pieza por id dentro del CATALOG
function getPiece(id) {
  for (var i = 0; i < CATALOG.length; i++) {
    if (CATALOG[i].id === id) return CATALOG[i];
  }
  return null;
}

//oculta todas las pantallas y muestra únicamente la indicada
function showScreen(id) {
  var all = document.querySelectorAll('.screen');
  for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
  getId(id).classList.add('active');
}

//muestra un número de daño flotante en las coordenadas de pantalla (x, y)
function showDmgPopup(text, x, y) {
  var el = getId('dmg-popup');
  el.textContent = text;
  el.className   = 'dmg-popup';
  el.style.left  = x + 'px';
  el.style.top   = y + 'px';
  // Forzar reflow para reiniciar la animación CSS
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
  setTimeout(function() { el.classList.add('hidden'); }, 950);
}

//sistema de efectos de sonido procedurales usando Web Audio API
var SFX = (function() {
  var ctx = null;
  var vol = 0.5;

  //crea el AudioContext de forma diferida (requiere gesto del usuario por política del navegador)
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  //reproduce un tono oscilador simple: frecuencia, duración en segundos, forma de onda y ganancia
  function tono(freq, dur, tipo, g) {
    try {
      var c    = ac();
      var osc  = c.createOscillator();
      var gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = tipo || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime((g || 0.25) * vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.start();
      osc.stop(c.currentTime + dur);
    } catch(e) {}
  }

  //reproduce ruido blanco corto para sonidos de impacto
  function ruido(dur, g) {
    try {
      var c = ac();
      var buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var src = c.createBufferSource();
      var gain = c.createGain();
      src.buffer = buf;
      src.connect(gain);
      gain.connect(c.destination);
      gain.gain.setValueAtTime((g || 0.2) * vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      src.start();
    } catch(e) {}
  }

  //API pública del módulo SFX
  return {
    setVol: function(v) { vol = v; },
    colocar: function() { tono(880, 0.06, 'square', 0.15); setTimeout(function() { tono(1200, 0.04, 'square', 0.1); }, 40); },
    seleccionar: function() { tono(660, 0.05, 'sine', 0.12); },
    danoEnemigo: function() { tono(200, 0.12, 'sawtooth', 0.25); ruido(0.08, 0.15); },
    danoJugador: function() { tono(120, 0.18, 'sawtooth', 0.3);  ruido(0.12, 0.2); },
    sinergia: function() { tono(440, 0.08, 'sine', 0.2); setTimeout(function() { tono(880, 0.12, 'sine', 0.25); }, 80); },
    victoria: function() {
      tono(523, 0.1, 'sine', 0.3);
      setTimeout(function() { tono(659, 0.1, 'sine', 0.3); }, 100);
      setTimeout(function() { tono(784, 0.22, 'sine', 0.35); }, 200);
    },
    derrota: function() {
      tono(300, 0.15, 'sawtooth', 0.25);
      setTimeout(function() { tono(200, 0.2, 'sawtooth', 0.2); }, 150);
      setTimeout(function() { tono(120, 0.35, 'sawtooth', 0.15); }, 320);
    },
  };
})();