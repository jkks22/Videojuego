// map-player.js: sprite del protagonista en el mapa

"use strict";

var PROTA_FRAME_W  = 96;
var PROTA_FRAME_H  = 128;
var PROTA_COLS     = 4;
var PROTA_ANIM_FPS = 6;
var PROTA_DIR_ROW  = { south: 0, north: 1, west: 2, east: 3 };

var MapPlayer = {
  x:             0,
  y:             0,
  targetX:       0,
  targetY:       0,
  moving:        false,
  speed:         3,
  dir:           'south',
  frameIndex:    0,
  frameTick:     0,
  frameDelay:    Math.round(60 / PROTA_ANIM_FPS),
  img:           null,
  loaded:        false,
  canvas:        null,
  ctx:           null,
  animId:        null,
  currentNodeId: null,

  init: function(mapContainerEl, startNode) {
    // Limpiar instancia previa
    this.destroy();
    this.loaded = false;

    // Crear canvas overlay
    this.canvas        = document.createElement('canvas');
    this.canvas.width  = mapContainerEl.scrollWidth  || mapContainerEl.clientWidth  || 900;
    this.canvas.height = mapContainerEl.scrollHeight || mapContainerEl.clientHeight || 600;
    this.canvas.style.cssText =
      'position:absolute;top:0;left:0;pointer-events:none;z-index:20;';
    mapContainerEl.style.position = 'relative';
    mapContainerEl.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Cargar imagen — ajusta la ruta a donde tengas prota.png
    this.img        = new Image();
    this.img.onload = function() {
      MapPlayer.loaded = true;
      console.log('prota.png cargado:', MapPlayer.img.width, 'x', MapPlayer.img.height);
    };
    this.img.onerror = function() {
      console.error('ERROR: no se pudo cargar prota.png — verifica la ruta:', MapPlayer.img.src);
    };
    this.img.src = 'assets/sprites/prota.png';

    // Posición inicial
    if (startNode) {
      this.x = this.targetX = startNode.x || 100;
      this.y = this.targetY = startNode.y || 100;
      this.currentNodeId = startNode.id;
    } else {
      this.x = this.targetX = 100;
      this.y = this.targetY = 100;
    }

    this.moving     = false;
    this.frameIndex = 0;
    this.frameTick  = 0;

    this._loop();
  },

  moveTo: function(node) {
    if (this.moving) return;
    this.targetX = node.x;
    this.targetY = node.y;
    this.moving  = true;
    this._setDir(node.x - this.x, node.y - this.y);
  },

  _setDir: function(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      this.dir = dx > 0 ? 'east' : 'west';
    } else {
      this.dir = dy > 0 ? 'south' : 'north';
    }
  },

  _loop: function() {
    var self = this;
    function tick() {
      self.animId = requestAnimationFrame(tick);
      self._update();
      self._draw();
    }
    tick();
  },

  _update: function() {
    if (!this.moving) return;

    var dx   = this.targetX - this.x;
    var dy   = this.targetY - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.speed) {
      this.x      = this.targetX;
      this.y      = this.targetY;
      this.moving = false;
      if (State && State.currentNode) {
        Game.enterNode(State.currentNode);
      }
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }

    this.frameTick++;
    if (this.frameTick >= this.frameDelay) {
      this.frameTick  = 0;
      this.frameIndex = (this.frameIndex + 1) % PROTA_COLS;
    }
  },

  _draw: function() {
    var c = this.ctx;
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar punto de debug aunque no haya cargado la imagen
    c.fillStyle = 'lime';
    c.fillRect(this.x - 4, this.y - 4, 8, 8);

    if (!this.loaded) return;

    var row = PROTA_DIR_ROW[this.dir];
    var sx  = this.frameIndex * PROTA_FRAME_W;
    var sy  = row * PROTA_FRAME_H;

    // Dibujar sin fondo negro — usar globalCompositeOperation para quitar el negro del sprite
    c.save();
    c.imageSmoothingEnabled = false;
    c.drawImage(
      this.img,
      sx, sy, PROTA_FRAME_W, PROTA_FRAME_H,
      Math.round(this.x - PROTA_FRAME_W / 2),
      Math.round(this.y - PROTA_FRAME_H / 2),
      PROTA_FRAME_W, PROTA_FRAME_H
    );
    c.restore();
  },

  destroy: function() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx    = null;
    this.loaded = false;
  },
};