//utils.js: Utilidades, estado global y sistema de audio

//estado global
var State = {
  run:        1,
  hp:         100,
  maxHp:      100,
  impulse:    3,
  maxImpulse: 3,
  zone:       1,
  currentNode:  null,
  mapNodes:     [],
  combatsWon:   0,
  unlockedIds:  ['gen_e', 'gen_e', 'tr_b', 'anc_s'],
  shopUses:     0,
  eventUses:    0,
};

//Helpers DOM
function getId(id) {
  return document.getElementById(id);
}

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

function showScreen(id) {
  var all = document.querySelectorAll('.screen');
  for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
  getId(id).classList.add('active');
}

function showDmgPopup(text, x, y) {
  var el = getId('dmg-popup');
  el.textContent = text;
  el.className = 'dmg-popup';
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
  setTimeout(function() { el.classList.add('hidden'); }, 950);
}

//SFX con Web Audio API
var SFX = (function() {
  var ctx = null;
  var vol = 0.5;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tono(freq, dur, tipo, g) {
    try {
      var c = ac(), osc = c.createOscillator(), gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = tipo || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime((g || 0.25) * vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.start(); osc.stop(c.currentTime + dur);
    } catch(e) {}
  }

  function ruido(dur, g) {
    try {
      var c = ac(), buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var src = c.createBufferSource(), gain = c.createGain();
      src.buffer = buf; src.connect(gain); gain.connect(c.destination);
      gain.gain.setValueAtTime((g || 0.2) * vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      src.start();
    } catch(e) {}
  }

  return {
    setVol:      function(v) { vol = v; },
    colocar:     function() { tono(880, 0.06, 'square', 0.15); setTimeout(function() { tono(1200, 0.04, 'square', 0.1); }, 40); },
    seleccionar: function() { tono(660, 0.05, 'sine', 0.12); },
    danoEnemigo: function() { tono(200, 0.12, 'sawtooth', 0.25); ruido(0.08, 0.15); },
    danoJugador: function() { tono(120, 0.18, 'sawtooth', 0.3);  ruido(0.12, 0.2); },
    sinergia:    function() { tono(440, 0.08, 'sine', 0.2); setTimeout(function() { tono(880, 0.12, 'sine', 0.25); }, 80); },
    victoria:    function() {
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
