//game.js: controlador principal del juego: inicialización de runs, flujo del mapa y condiciones de victoria/derrota

const Game = {
  //valida sesión activa antes de permitir iniciar una run
  //si no hay sesión, abre el modal de login con un mensaje informativo
  //y deja una bandera para que la run arranque automáticamente tras el login
  tryStartRun: function() {
    if (!API.isLoggedIn()) {
      Auth.setPendingStartRun(true);
      Auth.open('login');
      const err = getId('login-error');
      if (err) {
        err.textContent = 'Inicia sesión o regístrate para jugar y guardar tu progreso.';
        err.classList.remove('hidden');
        err.classList.add('auth-info');
      }
      return;
    }
    this.startRun();
  },

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
    
    

    


  
    
    //crear run en BD y registrar el inventario inicial de 4 piezas
    API.iniciarRun().then(function() {
      API.agregarInventario('gen_e', 'inicial');
      API.agregarInventario('gen_e', 'inicial');
      API.agregarInventario('tr_b',  'inicial');
      API.agregarInventario('anc_s', 'inicial');
    });
    if (typeof Tutorial !== 'undefined' && Tutorial.shouldShowOnFirstRun()) {
      Tutorial.open();
    }
  },

  pause: function() {
    // impedir pausa si el combate está corriendo
    if (Combat.running) return;
  
    this.isPaused = true;
    showScreen('screen-pause');
  },
    
    resume: function() {
      this.isPaused = false;
    
      if (State.currentNode) {
        showScreen('screen-battle');
      } else {
        showScreen('screen-map');
      }
    },

    // Gurdar el progreso actual de la run en localStorage para poder reanudarla después
    saveProgress: function() {
      const progress = {
        run: State.run,
        hp: State.hp,
        maxHp: State.maxHp,
        impulse: State.impulse,
        maxImpulse: State.maxImpulse,
        zone: State.zone,
        combatsWon: State.combatsWon,
        unlockedIds: State.unlockedIds,
        shopUses: State.shopUses,
        eventUses: State.eventUses,
      };
      localStorage.setItem('arcane_progress', JSON.stringify(progress));
      console.log('Progreso guardado:');
    },

    // Cargar el progreso guardado de localStorage al iniciar el juego

  loadProgress: function() {
    const progress = localStorage.getItem('arcane_progress');
    if (progress) {
      const data = JSON.parse(progress);
      State.run = data.run || 0;
      State.hp = data.hp || 100;
      State.maxHp = data.maxHp || 100;
      State.impulse = data.impulse || 3;
      State.maxImpulse = data.maxImpulse || 3;
      State.zone = data.zone || 1;
      State.combatsWon = data.combatsWon || 0;
      State.unlockedIds = data.unlockedIds || ['gen_e', 'gen_e', 'tr_b', 'anc_s'];
      State.shopUses = data.shopUses || 0;
      State.eventUses = data.eventUses || 0;
    }
  },


    
  
  //genera los nodos para la zona indicada y los renderiza en el mapa
  buildMap: function(zone) {
    State.zone     = zone;
    State.mapNodes = generateMap(zone);
    //registrar cada nodo en BD; el nodo_id devuelto se guarda en node._dbId para usarlo al entrar
    for (let i = 0; i < State.mapNodes.length; i++) {
      (function(node) {
        API.registrarNodo({
          tipo:       node.type,
          zona:       node.zone,
          fila_mapa:  node.row,
          col_mapa:   node.col,
          completado: node.completed,
          accesible:  node.accessible,
        }).then(function(data) {
          if (data && data.nodo_id) node._dbId = data.nodo_id;
        });
      })(State.mapNodes[i]);
    }
    this.renderMap();
  },

  renderMap: function() {
    const self = this;
    const cont = getId('map-container');
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
    const dots = getId('impulse-dots');
    dots.innerHTML = '';
    for (let i = 0; i < State.maxImpulse; i++) {
      const d = document.createElement('div');
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
    const node = State.currentNode;
    if (node) {
      node.completed = true;
      API.actualizarNodo(node._dbId, { completado: true });
      //hacer accesibles los nodos hijos para que el jugador pueda elegir su ruta
      for (let i = 0; i < (node.children || []).length; i++)
        for (let j = 0; j < State.mapNodes.length; j++)
          if (State.mapNodes[j].id === node.children[i]) {
            State.mapNodes[j].accessible = true;
            API.actualizarNodo(State.mapNodes[j]._dbId, { accesible: true });
            break;
          }
    }
    //sincronizar estado de la run con la BD al terminar cada combate
    API.actualizarRun({ zona_actual: State.zone, hp_actual: State.hp });

    if (node && node.type === 'boss') {
      if (State.zone < 3) {
        //zona completada — ofrecer recompensa y avanzar a la siguiente zona
        showScreen('screen-event');
        getId('event-icon').textContent  = '🏆';
        getId('event-title').textContent = 'ZONA ' + State.zone + ' COMPLETADA';
        getId('event-text').textContent  = 'El Pliegue se abre hacia la Zona ' + (State.zone + 1) + '.';
        const ch  = getId('event-choices');
        ch.innerHTML = '';
        const btn = document.createElement('button');
        btn.className = 'event-btn';
        btn.innerHTML = 'Avanzar a Zona ' + (State.zone + 1) + ' →<span class="ec-effect">Continúa el viaje</span>';
        const self = this;
        btn.addEventListener('click', function() {
          self.buildMap(State.zone + 1);
          self.updateHUD();
          Draft.show(State.zone);
        });
        ch.appendChild(btn);
      } else {
        //las 3 zonas completadas — marcar victoria en BD y mostrar pantalla final
        API.actualizarRun({ resultado: 'victoria', hp_actual: State.hp });
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
  skipDraft: function()  { this.afterDraft(); },

  //HP del jugador llegó a 0 mostrar pantalla de game over
  gameOver: function() {
    //registrar derrota en BD
    API.actualizarRun({ resultado: 'derrota', hp_actual: 0 });
    getId('go-icon').textContent  = '💀';
    getId('go-title').textContent = 'RUN TERMINADA';
    getId('go-sub').textContent   = 'Zona ' + State.zone + ' · ' + (Combat.currentEnemy ? Combat.currentEnemy.name : '?');
    this.showStats();
    showScreen('screen-gameover');
  },

  //llena la grilla de estadísticas en la pantalla de game over / victoria
  showStats: function() {
    getId('go-stats').innerHTML =
      '<div class="go-stat"><span class="go-stat-v">' + State.zone + '</span><span class="go-stat-l">ZONA</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.combatsWon + '</span><span class="go-stat-l">VICTORIAS</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.unlockedIds.length + '</span><span class="go-stat-l">PIEZAS</span></div>' +
      '<div class="go-stat"><span class="go-stat-v">' + State.hp + '</span><span class="go-stat-l">HP FINAL</span></div>';
  },

  restartToTitle: function() { showScreen('screen-title'); },

  setVolume:    function(v) { SFX.setVol(parseFloat(v)); },
  setSFXVolume: function(v) { SFX.setVol(parseFloat(v)); },
};
// Pausa con la tecla escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const currentScreen = document.querySelector('.screen.active').id;

    // solo permitir pausa si estás en combate
    if (currentScreen !== 'screen-battle' && currentScreen !== 'screen-pause') {
      return;
    }

    if (Game.isPaused) {
      Game.resume();
    } else {
      Game.pause();
    }
  }
});

//construye el fondo animado de polígonos hexagonales de la pantalla de título
function buildTitleHexBackground() {
  const cont = getId('hexBg'); if (!cont) return;
  const ns   = 'http://www.w3.org/2000/svg'; //se utiliza como un identificador único para diferenciar
  //los gráficos vectoriales de otros elementos HTML o XML y para crear elementos SVG con createElementNS
  //en este caso se usa para construir el fondo animado de la pantalla de título con hexágonos generados
  const svg  = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 18; c++) {
      const offset = (r % 2 === 0) ? 0 : 48 * 0.9;
      const cx     = c * 48 * 1.8 + offset;
      const cy     = r * 48 * 1.55;
      const poly   = document.createElementNS(ns, 'polygon');
      const pts    = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push((cx + 44 * Math.cos(a)).toFixed(1) + ',' + (cy + 44 * Math.sin(a)).toFixed(1));
      }
      poly.setAttribute('points', pts.join(' '));
      poly.setAttribute('fill', 'none');
      //selecciona aleatoriamente una pequeña fracción de hexágonos con color
      const rnd = Math.random();
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
  Game.loadProgress();
  window.addEventListener('resize', fxResize);
  buildTitleHexBackground();
  showScreen('screen-title');
});