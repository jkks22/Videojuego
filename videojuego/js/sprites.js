//sprites.js: Carga de imagenes, SpriteAnimator y animaciones de batalla

var imgCache = {};

function loadImg(src) {
  return new Promise(function(resolve, reject) {
    if (imgCache[src]) { resolve(imgCache[src]); return; }
    var img = new Image();
    img.onload  = function() { imgCache[src] = img; resolve(img); };
    img.onerror = function() { console.warn('sprite no encontrado:', src); reject(); };
    img.src = src;
  });
}

//SpriteAnimator
function SpriteAnimator(canvasId, def, loop, onDone, flip) {
  this.canvas = getId(canvasId);
  this.ctx    = this.canvas ? this.canvas.getContext('2d') : null;
  this.def    = def;
  this.loop   = loop !== undefined ? loop : true;
  this.onDone = onDone || null;
  this.flip   = flip  || false;
  this.frame  = 0;
  this.img    = null;
  this.rafId  = null;
  this._start();
}

SpriteAnimator.prototype._start = function() {
  var self = this;
  if (imgCache[this.def.src]) {
    this.img = imgCache[this.def.src];
    this.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
  } else {
    loadImg(this.def.src)
      .then(function(img) {
        self.img = img;
        self.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
      })
      .catch(function() {
        self._drawPlaceholder();
        self.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
      });
  }
};

SpriteAnimator.prototype._drawPlaceholder = function() {
  if (!this.ctx) return;
  var cw = this.canvas.width, ch = this.canvas.height;
  this.ctx.clearRect(0, 0, cw, ch);
  this.ctx.fillStyle = '#1E3050';
  this.ctx.fillRect(4, 4, cw - 8, ch - 8);
  this.ctx.fillStyle = '#6B7FA3';
  this.ctx.font = '10px monospace';
  this.ctx.textAlign = 'center';
  this.ctx.fillText('?', cw / 2, ch / 2 + 4);
};

SpriteAnimator.prototype._tick = function(now) {
  var self = this;
  if (!this.lastTime) this.lastTime = now;
  var interval = 1000 / this.def.fps;
  if (now - this.lastTime >= interval) {
    this.lastTime = now;
    this.frame++;
    if (this.frame >= this.def.totalFrames) {
      if (this.loop) {
        this.frame = 0;
      } else {
        this.frame = this.def.totalFrames - 1;
        if (this.img) this._draw(); else this._drawPlaceholder();
        if (this.onDone) this.onDone();
        return;
      }
    }
    if (this.img) this._draw(); else this._drawPlaceholder();
  }
  this.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
};

SpriteAnimator.prototype._draw = function() {
  if (!this.ctx || !this.img) return;
  var d  = this.def;
  var sx = (this.frame % d.cols) * d.frameW;
  var sy = (d.offsetRow !== undefined ? d.offsetRow : Math.floor(this.frame / d.cols)) * d.frameH;
  var cw = this.canvas.width, ch = this.canvas.height;
  this.ctx.clearRect(0, 0, cw, ch);
  this.ctx.save();
  if (this.flip) { this.ctx.translate(cw, 0); this.ctx.scale(-1, 1); }
  this.ctx.imageSmoothingEnabled = true;
  var scale = Math.min(cw / d.frameW, ch / d.frameH);
  var dw = Math.round(d.frameW * scale);
  var dh = Math.round(d.frameH * scale);
  var dx = Math.round((cw - dw) / 2);
  var dy = Math.round((ch - dh) / 2);
  this.ctx.drawImage(this.img, sx, sy, d.frameW, d.frameH, dx, dy, dw, dh);
  this.ctx.restore();
};

SpriteAnimator.prototype.stop = function() {
  if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
};

SpriteAnimator.prototype.changeDef = function(def, loop, onDone) {
  this.stop();
  this.def    = def;
  this.loop   = loop !== undefined ? loop : true;
  this.onDone = onDone || null;
  this.frame  = 0;
  this.lastTime = 0;
  this._start();
};

//instancias de animadores
var playerAnim   = null;
var enemyAnim    = null;
var merchantAnim = null;
var npcAnim      = null;

//inicializacion de sprites de batalla ─────────────────────
function initBattleSprites(nombreEnemigo, isBoss) {
  if (playerAnim) playerAnim.stop();
  if (enemyAnim)  enemyAnim.stop();

  playerAnim = new SpriteAnimator('sprite-player', SPRITE_DEF.idle, true, null, true);

  var defE;
  if (isBoss)               defE = SPRITE_DEF.bossIdle;
  else if (State.zone <= 1) defE = SPRITE_DEF.necroIdle;
  else                      defE = SPRITE_DEF.golemIdle;

  enemyAnim = new SpriteAnimator('sprite-enemy', defE, true);
  getId('sprite-enemy-name').textContent = nombreEnemigo || 'Enemigo';
  updateSpriteHP(1, 1);
}

function updateSpriteHP(pp, ep) {
  var pb = getId('sprite-player-hp'), eb = getId('sprite-enemy-hp');
  if (pb) pb.style.width = Math.max(0, pp * 100) + '%';
  if (eb) eb.style.width = Math.max(0, ep * 100) + '%';
}

//animaciones de accion
function playPlayerAttack(onDone) {
  if (!playerAnim) { if (onDone) onDone(); return; }
  playerAnim.changeDef(SPRITE_DEF.attack, false, function() {
    setTimeout(function() {
      if (playerAnim) playerAnim.changeDef(SPRITE_DEF.idle, true);
      if (onDone) onDone();
    }, 80);
  });
}

function playEnemyAttack(onDone) {
  if (!enemyAnim) { if (onDone) onDone(); return; }
  var isBoss = false;
  if (Combat.currentEnemy)
    for (var i = 0; i < ENEMIES.boss.length; i++)
      if (ENEMIES.boss[i].name === Combat.currentEnemy.name) { isBoss = true; break; }

  var atk, idle;
  if (isBoss)               { atk = SPRITE_DEF.bossAttack;  idle = SPRITE_DEF.bossIdle; }
  else if (State.zone <= 1) { atk = SPRITE_DEF.necroAttack; idle = SPRITE_DEF.necroIdle; }
  else                      { atk = SPRITE_DEF.golemAttack; idle = SPRITE_DEF.golemIdle; }

  enemyAnim.changeDef(atk, false, function() {
    setTimeout(function() {
      if (enemyAnim) enemyAnim.changeDef(idle, true);
      if (onDone) onDone();
    }, 80);
  });
}

function playEnemyDeath(onDone) {
  if (!enemyAnim) { if (onDone) onDone(); return; }
  var isBoss = false;
  if (Combat.currentEnemy)
    for (var i = 0; i < ENEMIES.boss.length; i++)
      if (ENEMIES.boss[i].name === Combat.currentEnemy.name) { isBoss = true; break; }

  var die = isBoss ? SPRITE_DEF.bossDeath : (State.zone <= 1 ? SPRITE_DEF.necroDeath : SPRITE_DEF.golemDie);
  enemyAnim.changeDef(die, false, function() {
    setTimeout(function() { if (onDone) onDone(); }, 400);
  });
}

function spriteHit(slot) {
  var canvas = getId('sprite-' + slot);
  if (!canvas) return;
  var el = canvas.closest('.sprite-slot') || canvas.parentElement;
  el.classList.remove('hit');
  void el.offsetWidth;
  el.classList.add('hit');
  setTimeout(function() { el.classList.remove('hit'); }, 400);
}

//sprites de pantallas secundarias
function initDraftSprite() {
  if (merchantAnim) merchantAnim.stop();
  merchantAnim = new SpriteAnimator('sprite-merchant', SPRITE_DEF.idle, true, null, true);
}

function initNpcSprite() {
  if (npcAnim) npcAnim.stop();
  npcAnim = new SpriteAnimator('sprite-npc', SPRITE_DEF.idle, true, null, false);
}
