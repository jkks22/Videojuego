//fx.js: sistema de particulas y efectos visuales (RF-01)

var fxCanvas    = null;
var fxCtx       = null;
var fxParticles = [];
var fxRafId     = null;

function fxInit() {
  fxCanvas = getId('fx-canvas');
  if (!fxCanvas) return;
  fxCtx = fxCanvas.getContext('2d');
  fxResize();
  fxLoop();
}

function fxResize() {
  if (!fxCanvas) return;
  fxCanvas.width  = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}

function fxLoop() {
  fxRafId = requestAnimationFrame(fxLoop);
  if (!fxCtx || fxParticles.length === 0) return;
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  for (var i = fxParticles.length - 1; i >= 0; i--) {
    var p = fxParticles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= p.decay;
    if (p.life <= 0) { fxParticles.splice(i, 1); continue; }

    fxCtx.save();
    fxCtx.globalAlpha = p.life;
    fxCtx.fillStyle = fxCtx.shadowColor = p.color;
    fxCtx.shadowBlur = 6;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    fxCtx.fill();
    fxCtx.restore();
  }
}

function fxSpawn(lista) {
  for (var i = 0; i < lista.length; i++) fxParticles.push(lista[i]);
}

//efectos especificos
function fxSynergy(x, y) {
  var cols = ['#FFD166', '#9B72CF', '#00E5C8'], ps = [];
  for (var i = 0; i < 28; i++) {
    var a = (Math.PI * 2 / 28) * i + Math.random() * 0.3;
    var v = 1.5 + Math.random() * 2.5;
    ps.push({
      x: x, y: y,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5,
      r: 2 + Math.random() * 2,
      color: cols[i % 3],
      life: 1, decay: 0.022 + Math.random() * 0.01,
    });
  }
  fxSpawn(ps);
}

function fxShield(x, y) {
  var ps = [];
  for (var i = 0; i < 14; i++) {
    var a = Math.random() * Math.PI * 2;
    ps.push({
      x: x + (Math.random() - .5) * 30,
      y: y + (Math.random() - .5) * 30,
      vx: Math.cos(a) * 0.8, vy: Math.sin(a) * 0.8 - 1,
      r: 2 + Math.random() * 1.5,
      color: '#00E5C8',
      life: 1, decay: 0.03,
    });
  }
  fxSpawn(ps);
}

function fxVictory(cx, cy) {
  var cols = ['#FFD166', '#00E5C8', '#9B72CF', '#FF6B9D', '#56CFB2'], ps = [];
  for (var i = 0; i < 50; i++) {
    var a = Math.random() * Math.PI * 2;
    var v = 2 + Math.random() * 4;
    ps.push({
      x: cx, y: cy,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3,
      r: 2 + Math.random() * 3,
      color: cols[i % 5],
      life: 1, decay: 0.012 + Math.random() * 0.008,
    });
  }
  fxSpawn(ps);
}
