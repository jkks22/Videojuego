//sprites.js: caché de imágenes, clase SpriteAnimator y gestión de sprites de batalla.

//imgCache almacena objetos Image ya cargados para evitar recargas y acelerar el acceso
const imgCache = {};

//solicita una imagen al navegador y la almacena en imgCache al completarse.
// Devuelve una Promesa para que el llamador pueda encadenar .then() sin bloquear.
// POR QUÉ Promesa en lugar de callback directo: permite usar async/await y
// encadenar múltiples cargas en paralelo con Promise.all() si fuera necesario.
function loadImg(src) {
  return new Promise(function(resolve, reject) {
    if (imgCache[src]) { resolve(imgCache[src]); return; }
    const img    = new Image();
    img.onload   = function() { imgCache[src] = img; resolve(img); };
    img.onerror  = function() { console.warn('sprite no encontrado:', src); reject(); };
    img.src      = src;
  });
}

/**
* SpriteAnimator: reproduce una animación de hoja de sprites sobre un elemento <canvas>
* {string}    canvasId: id del canvas destino
* {object}   def: definición del sprite con propiedades src,cols,rows,frameW,frameH,totalFrames,fps y opcional offsetRow 
* {boolean}  loop: si true, la animación se repite indefinidamente
* {function} onDone: callback que se llama al terminar una animación no-loop 
* {boolean}  flip: si true, el sprite se refleja horizontalmente, personaje jugador mirando a la izquierda
*/
function SpriteAnimator(canvasId, def, loop, onDone, flip) {
  this.canvas = getId(canvasId);
  this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
  this.def = def;
  this.loop = loop !== undefined ? loop : true;
  this.onDone = onDone || null;
  this.flip = flip   || false;
  this.frame = 0;
  this.img = null;
  this.rafId = null;
  this.lastTime = 0;
  this._start();
}

//inicia la carga de la imagen (o la toma del caché) y luego arranca el ticker de animación 
//comienza a animar tan pronto como la imagen esté disponible, sin bloquear el hilo principal ni la UI
SpriteAnimator.prototype._start = function() {
  const self = this;
  if (imgCache[this.def.src]) {
    this.img  = imgCache[this.def.src];
    this.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
  } else {
    loadImg(this.def.src)
      .then(function(img) {
        self.img   = img;
        self.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
      })
      .catch(function() {
        // Si el archivo no existe dibujamos un marcador de posición para que el
        // canvas nunca quede en blanco — el juego sigue funcionando sin sprites.
        self._drawPlaceholder();
        self.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
      });
  }
};

//dibuja un rectángulo de relleno cuando la hoja de sprites no está disponible
//POR QUÉ mantener el ticker incluso sin imagen: el juego debe poder avanzar
//aunque los assets no hayan cargado
SpriteAnimator.prototype._drawPlaceholder = function() {
  if (!this.ctx) return;
  const cw = this.canvas.width;
  const ch = this.canvas.height;
  this.ctx.clearRect(0, 0, cw, ch);
  this.ctx.fillStyle = '#1E3050';
  this.ctx.fillRect(4, 4, cw - 8, ch - 8);
  this.ctx.fillStyle = '#6B7FA3';
  this.ctx.font = '10px monospace';
  this.ctx.textAlign = 'center';
  this.ctx.fillText('?', cw / 2, ch / 2 + 4);
};

//se llama en cada frame de animación del navegador requestAnimationFrame
SpriteAnimator.prototype._tick = function(now) {
  const self     = this;
  const interval = 1000 / this.def.fps;

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
        return; //salir sin programar otro frame — la animación terminó
      }
    }
    if (this.img) this._draw(); else this._drawPlaceholder();
  }
  this.rafId = requestAnimationFrame(function(ts) { self._tick(ts); });
};

// Recorta el frame actual de la hoja de sprites y lo escala al tamaño del canvas.
//
// Cómo se indexan los frames (sx / sy):
//   La hoja está organizada en columnas y filas de celdas de igual tamaño.
//   • sx (source X) = (sourceFrame % cols) * frameW
//       El resto de dividir el índice del frame entre el número de columnas
//       da la columna actual dentro de la fila → multiplicada por el ancho
//       de cada frame obtiene el píxel X de inicio en la imagen.
//   • sy (source Y) = fila * frameH
//       La "fila" se calcula de dos formas:
//       - Si offsetRow está definido en la definición del sprite, se usa ese
//         valor fijo.  Esto permite que una hoja con múltiples animaciones en
//         filas distintas muestre siempre la animación correcta sin mezclar
//         frames de otras filas (ej. la fila 0 es "idle", la fila 2 es "ataque").
//       - Si offsetRow no está definido, la fila es Math.floor(frame / cols),
//         lo que recorre la hoja en orden de izquierda a derecha, fila por fila.
//
// Por qué frameH evita espacio vacío:
//   El recorte toma exactamente frameH píxeles de alto.  Si la hoja tiene filas
//   adicionales (por ejemplo 4 filas pero sólo usamos la primera), drawImage
//   nunca accede a las filas sobrantes porque el área de origen está acotada
//   por (sy, frameH).  Sin este acotamiento se vería contenido de otras
//   animaciones superpuesto en el canvas.
SpriteAnimator.prototype._draw = function() {
  if (!this.ctx || !this.img) return;
  const d  = this.def;
  const sourceFrame = this.frame + (d.offsetCol || 0);
  //calcular posición del frame dentro de la hoja de sprites
  const sx = (sourceFrame % d.cols) * d.frameW;
  const sy = (d.offsetRow !== undefined ? d.offsetRow : Math.floor(sourceFrame / d.cols)) * d.frameH;
  const cw = this.canvas.width;
  const ch = this.canvas.height;

  this.ctx.clearRect(0, 0, cw, ch);
  this.ctx.save();

  //si flip es true, reflejar horizontalmente para que el personaje mire a la izquierda 
  if (this.flip) { this.ctx.translate(cw, 0); this.ctx.scale(-1, 1); }
  this.ctx.imageSmoothingEnabled = true;

  //escalar el frame para que ocupe el canvas completo manteniendo proporción
  const scale = Math.min(cw / d.frameW, ch / d.frameH);
  const dw = Math.round(d.frameW * scale);
  const dh = Math.round(d.frameH * scale);
  const dx = Math.round((cw - dw) / 2);
  const dy = Math.round((ch - dh) / 2);
  this.ctx.drawImage(this.img, sx, sy, d.frameW, d.frameH, dx, dy, dw, dh);
  this.ctx.restore();
};

//cancela el loop de animación liberando el id de rAF reservado
SpriteAnimator.prototype.stop = function() {
  if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
};

//cambia a una nueva definición de animación reutilizando el mismo canvas
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
//son let porque se reasignan en cada combate/pantalla nueva
let playerAnim   = null;
let enemyAnim    = null;
let merchantAnim = null;
let npcAnim      = null;

//configura los animadores del jugador y el enemigo al entrar a una pantalla de combate
function initBattleSprites(nombreEnemigo, nodeType) {
  if (playerAnim) playerAnim.stop();
  if (enemyAnim)  enemyAnim.stop();

  //el jugador siempre usa el set de sprites del Ingeniero Arcano
  playerAnim = new SpriteAnimator('sprite-player', SPRITE_DEF.idle, true, null, true);

  //el sprite del enemigo depende de la zona y si es un jefe
  let defE;
  if (nodeType === 'boss') defE = SPRITE_DEF.bossIdle;
  else if (nodeType === 'elite') defE = SPRITE_DEF.golemIdle;
  else defE = SPRITE_DEF.necroIdle;

  enemyAnim = new SpriteAnimator('sprite-enemy', defE, true);
  getId('sprite-enemy-name').textContent = nombreEnemigo || 'Enemigo';
  updateSpriteHP(1, 1);
}

//actualiza el ancho de las barras de HP debajo de cada sprite (valores 0–1)
function updateSpriteHP(pp, ep) {
  const pb = getId('sprite-player-hp');
  const eb = getId('sprite-enemy-hp');
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
  let isBoss = false;
  if (Combat.currentEnemy)
    for (let i = 0; i < ENEMIES.boss.length; i++)
      if (ENEMIES.boss[i].name === Combat.currentEnemy.name) { isBoss = true; break; }

  let atk, idle;
  if (isBoss) { atk = SPRITE_DEF.bossAttack;  idle = SPRITE_DEF.bossIdle; }
  else if (State.currentNode && State.currentNode.type === 'elite') { atk = SPRITE_DEF.golemAttack; idle = SPRITE_DEF.golemIdle; }
  else { atk = SPRITE_DEF.necroAttack; idle = SPRITE_DEF.necroIdle; }

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

  let isBoss = false;
  if (Combat.currentEnemy)
    for (let i = 0; i < ENEMIES.boss.length; i++)
      if (ENEMIES.boss[i].name === Combat.currentEnemy.name) { isBoss = true; break; }

  const die = isBoss ? SPRITE_DEF.bossDeath
            : ((State.currentNode && State.currentNode.type === 'elite') ? SPRITE_DEF.golemDie : SPRITE_DEF.necroDeath);

  enemyAnim.changeDef(die, false, function() {
    setTimeout(function() { if (onDone) onDone(); }, 400);
  });
}

//reproduce un destello de impacto en el sprite del jugador o enemigo al recibir daño 
//slot: 'player' o 'enemy'
function spriteHit(slot) {
  const canvas = getId('sprite-' + slot);
  if (!canvas) return;
  const el = canvas.closest('.sprite-slot') || canvas.parentElement;
  el.classList.remove('hit');
  void el.offsetWidth; //forzar reflow para reiniciar la animación CSS
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
