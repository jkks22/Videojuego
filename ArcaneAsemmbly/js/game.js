
//game.js: controlador principal del juego: inicialización de runs, flujo del mapa y condiciones de victoria/derrota

var Game = {
  //inicia una run nueva: reinicia todo el estado, genera el mapa de zona 1 y lo muestra
  startRun: function() {
    State.run++;
    State.hp = 100;
    State.maxHp = 100;
    State.impulse = 3;
    State.maxImpulse = 3;
    State.zone = 1;
    State.combatsWon = 0;
    State.unlockedIds = ['gen_e', 'gen_e', 'tr_b', 'anc_s'];
    State.shopUses = 0;
    State.eventUses = 0;
    boardInit();
    this.buildMap(1);
    showScreen('screen-map');
    this.updateHUD();
  },

  //genera los nodos para la zona indicada y los renderiza en el mapa
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

  //actualiza todos los elementos del HUD en la pantalla de mapa
  updateHUD: function() {
    getId('run-num').textContent     = State.run;
    getId('zone-val').textContent    = State.zone;
    getId('hp-bar').style.width      = (State.hp / State.maxHp * 100) + '%';
    getId('hp-val').textContent      = State.hp + '/' + State.maxHp;
    getId('piece-count').textContent = State.unlockedIds.length;

    //redibujar los puntos de impulso
    var dots = getId('impulse-dots'); dots.innerHTML = '';
    for (var i = 0; i < State.maxImpulse; i++) {
      var d = document.createElement('div');
      d.className = 'impulse-dot' + (i < State.impulse ? '' : ' empty');
      dots.appendChild(d);
    }
  },

  //dirige al jugador a la pantalla correcta según el tipo del nodo seleccionado
  enterNode: function(node) {
    State.currentNode = node;
    if (node.type === 'shop')  { Shop.show(State.zone);  return; }
    if (node.type === 'event') { Events.trigger();        return; }
    showScreen('screen-battle');
    BattleUI.setup(node);
  },

  //se llama al ganar un combate: marca el nodo, desbloquea hijos, avanza o termina
  afterCombatVictory: function() {
    var node = State.currentNode;
    if (node) {
      node.completed = true;
      //hacer accesibles los nodos hijos para que el jugador pueda elegir su ruta
      for (var i = 0; i < (node.children || []).length; i++)
        for (var j = 0; j < State.mapNodes.length; j++)
          if (State.mapNodes[j].id === node.children[i]) { State.mapNodes[j].accessible = true; break; }
    }

    if (node && node.type === 'boss') {
      if (State.zone < 3) {
        //zona completada — ofrecer recompensa y avanzar a la siguiente zona
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
        //las 3 zonas completadas — victoria total
        getId('go-icon').textContent  = '🏆';
        getId('go-title').textContent = '¡VICTORIA TOTAL!';
        getId('go-sub').textContent   = 'Completaste las 3 zonas';
        this.showStats();
        showScreen('screen-gameover');
      }
      return;
    }
    //combate normal ganado — mostrar recompensa de draft
    Draft.show(State.zone);
  },

  afterDraft: function() { this.updateHUD(); this.renderMap(); showScreen('screen-map'); },
  skipDraft: function() { this.afterDraft(); },

  //HP del jugador llegó a 0 mostrar pantalla de game over
  gameOver: function() {
    getId('go-icon').textContent = '💀';
    getId('go-title').textContent = 'RUN TERMINADA';
    getId('go-sub').textContent = 'Zona ' + State.zone + ' · ' + (Combat.currentEnemy ? Combat.currentEnemy.name : '?');
    this.showStats();
    showScreen('screen-gameover');
  },

  //llena la grill de estadísticas en la pantalla de game over / victoria
  showStats: function() {
    getId('go-stats').innerHTML =
      '<div class="go-stat"><span class="go-stat-v">' + State.zone + '</span><span class="go-stat-l">ZONA</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.combatsWon + '</span><span class="go-stat-l">VICTORIAS</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.unlockedIds.length + '</span><span class="go-stat-l">PIEZAS</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.hp + '</span><span class="go-stat-l">HP FINAL</span></div>';
  },

  restartToTitle: function() { showScreen('screen-title'); },
};

//construye el fondo animado de polígonos hexagonales de la pantalla de título
function buildTitleHexBackground() {
  var cont = getId('hexBg'); if (!cont) return;
  var ns   = 'http://www.w3.org/2000/svg'; //se utiliza como un identificador único para diferenciar
  //los gráficos vectoriales de otros elementos HTML o XML y para crear elementos SVG con createElementNS
  //en este caso se usa para construir el fondo animado de la pantalla de título con hexágonos generados
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
      //selecciona aleatoriamente una pequeña fracción de hexágonos con color
      var rnd = Math.random();
      poly.setAttribute('stroke', rnd < 0.06 ? '#00E5C833' : rnd < 0.1 ? '#FFD16622' : '#1E305015');
      svg.appendChild(poly);
    }
  cont.appendChild(svg);
}

//reproducir SFX de selección en cada clic de botón de la página
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => SFX.seleccionar());
});

//punto de entrada — se ejecuta una vez que el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  fxInit();
  boardInit();
  window.addEventListener('resize', fxResize);
  buildTitleHexBackground();
  showScreen('screen-title');
});


