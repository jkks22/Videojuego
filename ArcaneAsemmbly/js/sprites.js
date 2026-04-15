//sprites.js: caché de imágenes, clase SpriteAnimator y gestión de sprites de batalla.

//caché global de imágenes para no recargar el mismo archivo más de una vez
var imgCache = {};

//carga una imagen y la guarda en caché; devuelve una Promesa con el objeto Image
function loadImg(src) {
  return new Promise(function(resolve, reject) {
    if (imgCache[src]) { resolve(imgCache[src]); return; }
    var img     = new Image();
    img.onload  = function() { imgCache[src] = img; resolve(img); };
    img.onerror = function() { console.warn('sprite no encontrado:', src); reject(); };
    img.src     = src;
  });
}

/** 
 * SpriteAnimator: reproduce una animación de hoja de sprites sobre un elemento <canvas>
 * {string}    canvasId: id del canvas destino
 * {object}   def: definición del sprite con propiedades src,cols,rows,frameW,frameH,totalFrames,fps y opcional offsetRow 
 * {boolean}  loop: si true, la animación se repite indefinidamente
 * {function} onDone: callback que se llama al terminar una animación no-loop 
 * {boolean}  flip: si true, el sprite se refleja horizontalmente, personaje jugador
 */
function SpriteAnimator(canvasId, def, loop, onDone, flip) {
  this.canvas = getId(canvasId);
  this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
  this.def = def;
  this.loop = loop !== undefined ? loop : true;
  this.onDone = onDone || null;
  this.flip = flip || false;
  this.frame = 0;
  this.img = null;
  this.rafId = null;
  this.lastTime = 0;
  this._start();
}

// Inicia la carga de la imagen y luego arranca el ticker de frames
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
        // Si no existe el sprite, dibuja un marcador de posición para no dejar el canvas vacío
        self._drawPlaceholder();
        self.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
      });
  }
};

// Dibuja un rectángulo simple cuando la hoja de sprites no está disponible
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

//se llama cada frame de animación — avanza el contador de frames al fps correcto
SpriteAnimator.prototype._tick = function(now) {
  var self     = this;
  var interval = 1000 / this.def.fps;

  if (now - this.lastTime >= interval) {
    this.lastTime = now;
    this.frame++;
    if (this.frame >= this.def.totalFrames) {
      if (this.loop) {
        this.frame = 0; //reiniciar si es loop
      } else {
        //congelar en el último frame y disparar el callback
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

//dibuja el frame actual recortado de la hoja de sprites, escalado al tamaño del canvas
SpriteAnimator.prototype._draw = function() {
  if (!this.ctx || !this.img) return;
  var d  = this.def;
  //calcular posición del frame dentro de la hoja de sprites
  var sx = (this.frame % d.cols) * d.frameW;
  var sy = (d.offsetRow !== undefined ? d.offsetRow : Math.floor(this.frame / d.cols)) * d.frameH;
  var cw = this.canvas.width;
  var ch = this.canvas.height;

  this.ctx.clearRect(0, 0, cw, ch);
  this.ctx.save();
  if (this.flip) { this.ctx.translate(cw, 0); this.ctx.scale(-1, 1); } //espejo horizontal
  this.ctx.imageSmoothingEnabled = true;

  //escalar el frame para que quepa en el canvas manteniendo proporciones
  var scale = Math.min(cw / d.frameW, ch / d.frameH);
  var dw = Math.round(d.frameW * scale);
  var dh = Math.round(d.frameH * scale);
  var dx = Math.round((cw - dw) / 2);
  var dy = Math.round((ch - dh) / 2);
  this.ctx.drawImage(this.img, sx, sy, d.frameW, d.frameH, dx, dy, dw, dh);
  this.ctx.restore();
};

//cancela el loop de animación
SpriteAnimator.prototype.stop = function() {
  if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
};

//cambia a una nueva definición de animación sin crear un nuevo SpriteAnimator
SpriteAnimator.prototype.changeDef = function(def, loop, onDone) {
  this.stop();
  this.def      = def;
  this.loop     = loop !== undefined ? loop : true;
  this.onDone   = onDone || null;
  this.frame    = 0;
  this.lastTime = 0;
  this._start();
};

//instancias activas de animador — una por slot de canvas
var playerAnim   = null;
var enemyAnim    = null;
var merchantAnim = null;
var npcAnim      = null;

//configura los animadores del jugador y el enemigo al entrar a una pantalla de combate
function initBattleSprites(nombreEnemigo, isBoss) {
  if (playerAnim) playerAnim.stop();
  if (enemyAnim)  enemyAnim.stop();

  //el jugador siempre usa el set de sprites del Ingeniero Arcano
  playerAnim = new SpriteAnimator('sprite-player', SPRITE_DEF.idle, true, null, true);

  //el sprite del enemigo depende de la zona y si es un jefe
  var defE;
  if (isBoss) defE = SPRITE_DEF.bossIdle;
  else if (State.zone <= 1) defE = SPRITE_DEF.necroIdle;
  else defE = SPRITE_DEF.golemIdle;

  enemyAnim = new SpriteAnimator('sprite-enemy', defE, true);
  getId('sprite-enemy-name').textContent = nombreEnemigo || 'Enemigo';
  updateSpriteHP(1, 1);
}

//actualiza el ancho de las barras de HP debajo de cada sprite valores 0–1
function updateSpriteHP(pp, ep) {
  var pb = getId('sprite-player-hp');
  var eb = getId('sprite-enemy-hp');
  if (pb) pb.style.width = Math.max(0, pp * 100) + '%';
  if (eb) eb.style.width = Math.max(0, ep * 100) + '%';
}

//reproduce la animación de ataque del jugador y luego regresa a idle
function playPlayerAttack(onDone) {
  if (!playerAnim) { if (onDone) onDone(); return; }
  playerAnim.changeDef(SPRITE_DEF.attack, false, function() {
    setTimeout(function() {
      if (playerAnim) playerAnim.changeDef(SPRITE_DEF.idle, true);
      if (onDone) onDone();
    }, 80);
  });
}

//reproduce la animación de ataque del enemigo y luego regresa a idle
function playEnemyAttack(onDone) {
  if (!enemyAnim) { if (onDone) onDone(); return; }

  //seleccionar el set de animación correcto según tipo de enemigo y zona
  var isBoss = false;
  if (Combat.currentEnemy)
    for (var i = 0; i < ENEMIES.boss.length; i++)
      if (ENEMIES.boss[i].name === Combat.currentEnemy.name) { isBoss = true; break; }

  var atk, idle;
  if (isBoss) { atk = SPRITE_DEF.bossAttack;  idle = SPRITE_DEF.bossIdle; }
  else if (State.zone <= 1) { atk = SPRITE_DEF.necroAttack; idle = SPRITE_DEF.necroIdle; }
  else { atk = SPRITE_DEF.golemAttack; idle = SPRITE_DEF.golemIdle; }

  enemyAnim.changeDef(atk, false, function() {
    setTimeout(function() {
      if (enemyAnim) enemyAnim.changeDef(idle, true);
      if (onDone) onDone();
    }, 80);
  });
}

//reproduce la animación de muerte del enemigo y luego llama al callback
function playEnemyDeath(onDone) {
  if (!enemyAnim) { if (onDone) onDone(); return; }

  var isBoss = false;
  if (Combat.currentEnemy)
    for (var i = 0; i < ENEMIES.boss.length; i++)
      if (ENEMIES.boss[i].name === Combat.currentEnemy.name) { isBoss = true; break; }

  var die = isBoss ? SPRITE_DEF.bossDeath
          : (State.zone <= 1 ? SPRITE_DEF.necroDeath : SPRITE_DEF.golemDie);

  enemyAnim.changeDef(die, false, function() {
    setTimeout(function() { if (onDone) onDone(); }, 400);
  });
}

//activa la animación CSS de impacto en el slot de sprite indicado player o enemy
function spriteHit(slot) {
  var canvas = getId('sprite-' + slot);
  if (!canvas) return;
  var el = canvas.closest('.sprite-slot') || canvas.parentElement;
  el.classList.remove('hit');
  void el.offsetWidth; //forzar reflow para reiniciar la animación
  el.classList.add('hit');
  setTimeout(function() { el.classList.remove('hit'); }, 400);
}

//inicializa el sprite del mercader en la pantalla de draft/recompensa
function initDraftSprite() {
  if (merchantAnim) merchantAnim.stop();
  merchantAnim = new SpriteAnimator('sprite-merchant', SPRITE_DEF.idle, true, null, true);
}

//inicializa el sprite del NPC en la pantalla de evento
function initNpcSprite() {
  if (npcAnim) npcAnim.stop();
  npcAnim = new SpriteAnimator('sprite-npc', SPRITE_DEF.idle, true, null, false);
}