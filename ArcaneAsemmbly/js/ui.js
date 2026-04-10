//ui.js: BattleUI (selección de piezas, interacción con canvas), Tooltip, Draft, Events, Shop y Mapa.

//interfaz de combate
var BattleUI = {
  selectedIndex: null, // índice de la tarjeta seleccionada actualmente, o null

  //inicializa un encuentro de combate para el nodo del mapa indicado
  setup: function(node) {
    var enemyData = getRandom(ENEMIES[node.type] || ENEMIES.combat);
    Combat.currentEnemy = enemyData;
    Combat.init(node.zone, node.type);
    boardGenerateEnemy(node.zone, node.type);
    initBattleSprites(enemyData.name, node.type === 'boss');
    showScreen('screen-battle');
    boardRender('enemyBoard', 'enemy');
    Combat.log(enemyData.name + ' — "' + enemyData.flavorText + '"', 'info');
    //mostrar al jugador el poder estimado del enemigo antes de la ronda
    var er = Combat.resolveBoard('enemy');
    Combat.log('Poder estimado: ' + er.damage + ' DMG / ' + er.shield + ' ESC', 'info');
    RoundBuilder.startBuildRound();
  },

  //alterna la selección de una tarjeta de pieza por índice
  selectPiece: function(index, cardEl) {
    if (Combat.running) return;
    getId('piece-grid').querySelectorAll('.piece-card').forEach(function(c) { c.classList.remove('selected'); });
    if (this.selectedIndex === index) {
      //clic en la misma tarjeta la deselecciona
      this.selectedIndex = null;
    } else {
      this.selectedIndex = index;
      if (cardEl) cardEl.classList.add('selected');
      SFX.seleccionar();
    }
    boardRender('playerBoard', 'player');
  },

  //reemplaza el canvas del jugador para eliminar listeners viejos y adjuntar nuevos
  attachCanvasClick: function() {
    var self = this;
    var old  = getId('playerBoard');
    var nw   = old.cloneNode(true);
    old.parentNode.replaceChild(nw, old);

    //colocar la pieza seleccionada en la celda hexagonal que el jugador hizo clic
    nw.addEventListener('click', function(e) {
      if (Combat.running) return;
      if (self.selectedIndex === null) { Combat.log('⚠ Selecciona una pieza primero.'); return; }
      var rect = nw.getBoundingClientRect();
      var px   = (e.clientX - rect.left) * (nw.width / rect.width);
      var py   = (e.clientY - rect.top)  * (nw.height / rect.height);
      var cell = hexCellAt(px, py);
      if (!cell) return;
      if (boardGet(cell.col, cell.row, 'player')) { Combat.log('⚠ Casilla ocupada.'); return; }
      boardPlace(cell.col, cell.row, RoundBuilder.roundPieces[self.selectedIndex].id, 'player');
      SFX.colocar();
      RoundBuilder.markPlaced(self.selectedIndex);
      self.selectedIndex = null;
      boardRender('playerBoard', 'player');
    });

    //mostrar previsualización de colocación al mover el mouse con una pieza seleccionada
    nw.addEventListener('mousemove', function(e) {
      if (Combat.running || self.selectedIndex === null) return;
      var rect = nw.getBoundingClientRect();
      var px   = (e.clientX - rect.left) * (nw.width / rect.width);
      var py   = (e.clientY - rect.top)  * (nw.height / rect.height);
      boardRender('playerBoard', 'player', hexCellAt(px, py));
    });

    nw.addEventListener('mouseleave', function() { boardRender('playerBoard', 'player'); });
  },

  //elimina todas las piezas del jugador y reinicia los contadores de la ronda de construcción
  clearBoard: function() {
    if (Combat.running) return;
    boardClear('player');
    this.selectedIndex = null;
    RoundBuilder.placed = 0;
    RoundBuilder.renderPieces();
    RoundBuilder.updateLabels();
    Combat.updatePreview();
    boardRender('playerBoard', 'player');
  },

  //gasta una carga de impulso para agregar una pieza extra a la mano actual
  useImpulse: function() {
    if (State.impulse <= 0 || Combat.running) return;
    State.impulse--;
    Combat.updateImpulseUI();
    Game.updateHUD();
    RoundBuilder.addExtraPiece();
  },
};

//mostrar información de una pieza en un tooltip cerca del cursor del mouse
var Tooltip = {
  show: function(e, piece) {
    var t = getId('tooltip');
    var stats = '';
    if (piece.output)     stats = 'Genera: '    + piece.output;
    if (piece.multiplier) stats = 'Mult: x'     + piece.multiplier;
    if (piece.amplify)    stats = 'Amplifica: +' + Math.round(piece.amplify * 100) + '%';
    if (piece.shieldVal)  stats = 'Escudo: '    + piece.shieldVal;
    if (piece.regenVal)   stats = 'Regen: '     + piece.regenVal + ' HP';
    if (piece.reflectPct) stats = 'Reflejo: '   + Math.round(piece.reflectPct * 100) + '%';

    t.innerHTML =
      '<span class="tt-name" style="color:' + TYPE_COLORS[piece.type] + '">' + piece.name + '</span>' +
      piece.desc +
      (stats ? '<div class="tt-stats">' + stats + '</div>' : '');

    t.style.left = (e.clientX + 14) + 'px';
    t.style.top  = (e.clientY - 10) + 'px';
    t.classList.remove('hidden');
  },
  hide: function() { getId('tooltip').classList.add('hidden'); },
};

//selección de recompensa
var Draft = {
  //muestra 3 piezas aleatorias filtradas por zona y rareza mínima
  show: function(zone, minRarity) {
    if (!minRarity) minRarity = 0;
    showScreen('screen-draft');
    initDraftSprite();

    var elegibles = CATALOG.filter(function(p) {
      return p.rarity <= Math.min(zone + 1, 4) && p.rarity >= minRarity;
    });
    elegibles.sort(function() { return Math.random() - .5; });

    var picks = elegibles.slice(0, 3);
    var cont  = getId('draft-cards');
    cont.innerHTML = '';
    for (var i = 0; i < picks.length; i++) {
      var piece = picks[i];
      var card  = document.createElement('div');
      card.className = 'draft-card';
      card.innerHTML =
        '<div class="dc-icon" style="color:' + TYPE_COLORS[piece.type] + '">' + TYPE_ICONS[piece.type] + '</div>' +
        '<div class="dc-name">' + piece.name + '</div>' +
        '<div class="dc-type" style="color:' + TYPE_COLORS[piece.type] + '">' + TYPE_LABELS[piece.type] + '</div>' +
        '<div class="dc-desc">' + piece.desc + '</div>' +
        '<div class="dc-rarity" style="color:' + RARITY_COLORS[piece.rarity] + '">' + RARITIES[piece.rarity].toUpperCase() + '</div>';
      (function(p) {
        //al hacer clic en una tarjeta se agrega la pieza a la colección y se vuelve al mapa
        card.addEventListener('click', function() { State.unlockedIds.push(p.id); Game.afterDraft(); });
      })(piece);
      cont.appendChild(card);
    }
  },
};

//eventos
var Events = {
  trigger: function() {
    //omitir si el pool está vacío o el jugador ya usó todos los eventos disponibles
    if (EVENT_POOL.length === 0 || State.eventUses >= EVENT_USES_MAX) {
      Game.afterDraft();
      return;
    }
    var ev = getRandom(EVENT_POOL);
    showScreen('screen-event');
    initNpcSprite();
    getId('event-icon').textContent  = ev.icon  || '❓';
    getId('event-title').textContent = ev.title;
    getId('event-text').textContent  = ev.text;

    var ch = getId('event-choices');
    ch.innerHTML = '';
    for (var i = 0; i < ev.choices.length; i++) {
      (function(c) {
        var btn = document.createElement('button');
        btn.className = 'event-btn';
        btn.innerHTML = c.label + '<span class="ec-effect">' + c.effect + '</span>';
        btn.addEventListener('click', function() { Events.resolve(c); });
        ch.appendChild(btn);
      })(ev.choices[i]);
    }
    State.eventUses++;
  },

  //aplica el efecto mecánico de la opción elegida por el jugador
  resolve: function(c) {
    if      (c.action === 'heal') { State.hp = Math.min(State.maxHp, State.hp + (c.value || 20)); Draft.show(State.zone); }
    else if (c.action === 'rare') { Draft.show(State.zone, 2); }  // solo piezas de rareza ≥ 2
    else if (c.action === 'dmg')  { State.hp -= (c.value || 10); if (State.hp <= 0) Game.gameOver(); else Game.afterDraft(); }
    else                           Game.afterDraft(); //skip o una acción desconocida -> volver al mapa
  },
};

//tienda
var Shop = {
  //la tienda reutiliza la pantalla Draft filtrada a piezas poco-comunes o mejores
  show: function(zone) {
    if (State.shopUses >= SHOP_USES_MAX) { Game.afterDraft(); return; }
    State.shopUses++;
    Draft.show(zone, 1); //rareza mínima 1 (poco común)
  },
};

//mapa
//genera los nodos del mapa con rutas ramificadas para la zona indicada
function generateMap(zone) {
  return [
    { id:0, zone:zone, type:'start',  row:0, col:1, accessible:true,  completed:true,  children:[1,2] },
    { id:1, zone:zone, type:'combat', row:1, col:0, accessible:true,  completed:false, children:[3,4] },
    { id:2, zone:zone, type:'event',  row:1, col:2, accessible:true,  completed:false, children:[3,4] },
    { id:3, zone:zone, type:'elite',  row:2, col:0, accessible:false, completed:false, children:[5]   },
    { id:4, zone:zone, type:'shop',   row:2, col:2, accessible:false, completed:false, children:[5]   },
    { id:5, zone:zone, type:'boss',   row:3, col:1, accessible:false, completed:false, children:[]    },
  ];
}

//construye y retorna un SVG del mapa a partir de la lista de nodos
//onClickNode se llama cuando el jugador hace clic en un nodo accesible
function renderMap(nodes, onClickNode) {
  var W = 440, H = 380, ns = 'http://www.w3.org/2000/svg'; //se utiliza como un identificador único para diferenciar
  //los gráficos vectoriales de otros elementos HTML o XML y para crear elementos SVG con createElementNS
  //que en este caso se usa para construir el mapa del juego con nodos y conexiones entre ellos   
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('width',  W);
  svg.setAttribute('height', H);

  var COLOR = { start:'#00E5C8', combat:'#FFD166', elite:'#FF6B9D', shop:'#9B72CF', event:'#56CFB2', boss:'#FF4444' };
  var ICON  = { start:'⬡', combat:'⚔', elite:'💀', shop:'🏪', event:'❓', boss:'☠' };
  var LABEL = { start:'INICIO', combat:'COMBATE', elite:'ÉLITE', shop:'TIENDA', event:'EVENTO', boss:'JEFE' };

  //posición en píxeles de un nodo según su fila y columna en la grilla del mapa
  function pos(n) { return { x: 80 + n.col * 140, y: 45 + n.row * (H / 4.3) }; }

  //bibujar líneas de conexión punteadas entre nodo padre e hijos
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i]; if (!n.children) continue;
    for (var j = 0; j < n.children.length; j++) {
      var ch = null;
      for (var k = 0; k < nodes.length; k++) if (nodes[k].id === n.children[j]) { ch = nodes[k]; break; }
      if (!ch) continue;
      var d = pos(n), h = pos(ch);
      var ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', d.x); ln.setAttribute('y1', d.y);
      ln.setAttribute('x2', h.x); ln.setAttribute('y2', h.y);
      ln.setAttribute('stroke', '#1E3050');
      ln.setAttribute('stroke-width', '2');
      ln.setAttribute('stroke-dasharray', '5 4');
      svg.appendChild(ln);
    }
  }

  //bibujar cada nodo con su círculo, icono y etiqueta
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i], p = pos(n), col = COLOR[n.type] || '#888';
    var active = n.accessible && !n.completed;
    //un nodo está bloqueado si su límite de uso fue alcanzado (tienda/evento)
    var bl = (n.type === 'shop'  && State.shopUses  >= SHOP_USES_MAX) ||
             (n.type === 'event' && State.eventUses >= EVENT_USES_MAX);

    var g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    g.style.cursor = active ? 'pointer' : 'default';

    //halo pulsante para nodos activos
    if (active) {
      var halo = document.createElementNS(ns, 'circle');
      halo.setAttribute('r', '28'); halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', bl ? '#444' : col);
      halo.setAttribute('stroke-width', '1'); halo.setAttribute('opacity', '0.3');
      g.appendChild(halo);
    }

    var circ = document.createElementNS(ns, 'circle');
    circ.setAttribute('r', '22');
    circ.setAttribute('fill',         n.completed ? '#080C18' : bl ? '#1a1a2e' : col + '1A');
    circ.setAttribute('stroke',       n.completed ? '#1E3050' : bl ? '#333'    : col);
    circ.setAttribute('stroke-width', active ? '2.5' : '1.5');
    g.appendChild(circ);

    var ic = document.createElementNS(ns, 'text');
    ic.setAttribute('text-anchor', 'middle'); ic.setAttribute('dominant-baseline', 'middle');
    ic.setAttribute('font-size', '16');
    ic.setAttribute('fill', n.completed ? '#1E3050' : bl ? '#444' : col);
    ic.textContent = n.completed ? '✓' : bl ? '🔒' : ICON[n.type];
    g.appendChild(ic);

    var lbl = document.createElementNS(ns, 'text');
    lbl.setAttribute('text-anchor', 'middle'); lbl.setAttribute('y', '36');
    lbl.setAttribute('font-size', '8');
    lbl.setAttribute('fill', (n.completed || bl) ? '#1E3050' : '#6B7FA3');
    lbl.setAttribute('font-family', 'Orbitron,sans-serif');
    lbl.setAttribute('letter-spacing', '1');
    lbl.textContent = LABEL[n.type];
    g.appendChild(lbl);

    if (active) (function(nodo) { g.addEventListener('click', function() { onClickNode(nodo); }); })(n);
    svg.appendChild(g);
  }
  return svg;
}
