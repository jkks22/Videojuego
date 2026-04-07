//game.js: controlador principal del juego e inicialización
var Game = {
  startRun: function() {
    State.run++;
    State.hp          = 100;
    State.maxHp       = 100;
    State.impulse     = 3;
    State.maxImpulse  = 3;
    State.zone        = 1;
    State.combatsWon  = 0;
    State.unlockedIds = ['gen_e', 'gen_e', 'tr_b', 'anc_s'];
    State.shopUses    = 0;
    State.eventUses   = 0;
    boardInit();
    this.buildMap(1);
    showScreen('screen-map');
    this.updateHUD();
  },

  buildMap: function(zone) {
    State.zone     = zone;
    State.mapNodes = generateMap(zone);
    this.renderMap();
  },

  renderMap: function() {
    var self = this, cont = getId('map-container');
    cont.innerHTML = '';
    cont.appendChild(renderMap(State.mapNodes, function(node) { self.enterNode(node); }));
  },

  updateHUD: function() {
    getId('run-num').textContent     = State.run;
    getId('zone-val').textContent    = State.zone;
    getId('hp-bar').style.width      = (State.hp / State.maxHp * 100) + '%';
    getId('hp-val').textContent      = State.hp + '/' + State.maxHp;
    getId('piece-count').textContent = State.unlockedIds.length;

    var dots = getId('impulse-dots'); dots.innerHTML = '';
    for (var i = 0; i < State.maxImpulse; i++) {
      var d = document.createElement('div');
      d.className = 'impulse-dot' + (i < State.impulse ? '' : ' empty');
      dots.appendChild(d);
    }
  },

  enterNode: function(node) {
    State.currentNode = node;
    if (node.type === 'shop')  { Shop.show(State.zone);  return; }
    if (node.type === 'event') { Events.trigger();        return; }
    showScreen('screen-battle');
    BattleUI.setup(node);
  },

  afterCombatVictory: function() {
    var node = State.currentNode;
    if (node) {
      node.completed = true;
      for (var i = 0; i < (node.children || []).length; i++)
        for (var j = 0; j < State.mapNodes.length; j++)
          if (State.mapNodes[j].id === node.children[i]) { State.mapNodes[j].accessible = true; break; }
    }

    if (node && node.type === 'boss') {
      if (State.zone < 3) {
        showScreen('screen-event');
        getId('event-icon').textContent  = '🏆';
        getId('event-title').textContent = 'ZONA ' + State.zone + ' COMPLETADA';
        getId('event-text').textContent  = 'El Pliegue se abre hacia la Zona ' + (State.zone + 1) + '.';
        var ch  = getId('event-choices'); ch.innerHTML = '';
        var btn = document.createElement('button');
        btn.className = 'event-btn';
        btn.innerHTML = 'Avanzar a Zona ' + (State.zone + 1) + ' →<span class="ec-effect">Continúa el viaje</span>';
        var self = this;
        btn.addEventListener('click', function() {
          self.buildMap(State.zone + 1);
          self.updateHUD();
          Draft.show(State.zone);
        });
        ch.appendChild(btn);
      } else {
        getId('go-icon').textContent  = '🏆';
        getId('go-title').textContent = '¡VICTORIA TOTAL!';
        getId('go-sub').textContent   = 'Completaste las 3 zonas';
        this.showStats();
        showScreen('screen-gameover');
      }
      return;
    }
    Draft.show(State.zone);
  },

  afterDraft:  function() { this.updateHUD(); this.renderMap(); showScreen('screen-map'); },
  skipDraft:   function() { this.afterDraft(); },

  gameOver: function() {
    getId('go-icon').textContent  = '💀';
    getId('go-title').textContent = 'RUN TERMINADA';
    getId('go-sub').textContent   = 'Zona ' + State.zone + ' · ' + (Combat.currentEnemy ? Combat.currentEnemy.name : '?');
    this.showStats();
    showScreen('screen-gameover');
  },

  showStats: function() {
    getId('go-stats').innerHTML =
      '<div class="go-stat"><span class="go-stat-v">' + State.zone          + '</span><span class="go-stat-l">ZONA</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.combatsWon    + '</span><span class="go-stat-l">VICTORIAS</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.unlockedIds.length + '</span><span class="go-stat-l">PIEZAS</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.hp            + '</span><span class="go-stat-l">HP FINAL</span></div>';
  },

  restartToTitle: function() { showScreen('screen-title'); },
};

// ── Fondo hexagonal de la pantalla de título ─────────────────
function buildTitleHexBackground() {
  var cont = getId('hexBg'); if (!cont) return;
  var ns   = 'http://www.w3.org/2000/svg';
  var svg  = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  for (var r = 0; r < 10; r++)
    for (var c = 0; c < 18; c++) {
      var offset = (r % 2 === 0) ? 0 : 48 * 0.9;
      var cx = c * 48 * 1.8 + offset, cy = r * 48 * 1.55;
      var poly = document.createElementNS(ns, 'polygon'), pts = [];
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push((cx + 44 * Math.cos(a)).toFixed(1) + ',' + (cy + 44 * Math.sin(a)).toFixed(1));
      }
      poly.setAttribute('points', pts.join(' '));
      poly.setAttribute('fill', 'none');
      var rnd = Math.random();
      poly.setAttribute('stroke', rnd < 0.06 ? '#00E5C833' : rnd < 0.1 ? '#FFD16622' : '#1E305015');
      svg.appendChild(poly);
    }
  cont.appendChild(svg);
}

// ── Arranque ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  fxInit();
  boardInit();
  window.addEventListener('resize', fxResize);
  buildTitleHexBackground();
  showScreen('screen-title');
});
