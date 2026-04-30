//ui.js: BattleUI, Tooltip, Draft, Events, Shop y Mapa

//interfaz de combate
const BattleUI = {
  selectedIndex: null, //indice de la tarjeta seleccionada del inventario, o null
  movingPiece:   null, //pieza levantada del tablero en proceso de mover, o null
  //movingPiece tiene la forma { id, fromCol, fromRow } cuando esta activa

  //inicializa un encuentro de combate para el nodo del mapa indicado
  setup: function(node) {
    const enemyData = getRandom(ENEMIES[node.type] || ENEMIES.combat);
    Combat.currentEnemy = enemyData;
    Combat.init(node.zone, node.type);
    //registrar el combate en BD usando el nodo_id guardado al generar el mapa
    //solo llamar si el nodo ya tiene _dbId asignado
    if (node._dbId) {
      API.iniciarCombate(node._dbId, Combat.enemyMaxHp);
    }
    boardGenerateEnemy(node.zone, node.type);
    initBattleSprites(enemyData.name, node.type);
    showScreen('screen-battle');
    boardRender('enemyBoard', 'enemy');
    Combat.log(enemyData.name + ' — "' + enemyData.flavorText + '"', 'info');
    //mostrar al jugador el poder estimado del enemigo antes de la ronda
    const er = Combat.resolveBoard('enemy');
    Combat.log('Poder estimado: ' + er.damage + ' DMG / ' + er.shield + ' ESC', 'info');
    RoundBuilder.startBuildRound();
  },

  //alterna la seleccion de una tarjeta de pieza por indice
  //si habia una pieza levantada del tablero, cancela esa operacion primero
  selectPiece: function(index, cardEl) {
    if (Combat.running) return;
    //si el jugador estaba moviendo una pieza, cancelar el movimiento al elegir otra del inventario
    if (this.movingPiece) {
      this._cancelMove();
    }
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

  //devuelve la pieza levantada a su posicion original
  _cancelMove: function() {
    if (!this.movingPiece) return;
    boardPlace(this.movingPiece.fromCol, this.movingPiece.fromRow, this.movingPiece.id, 'player');
    this.movingPiece = null;
    Combat.updatePreview();
    boardRender('playerBoard', 'player');
  },

  //reemplaza el canvas del jugador para eliminar listeners viejos y adjuntar nuevos
  attachCanvasClick: function() {
    const self = this;
    const old  = getId('playerBoard');
    const nw   = old.cloneNode(true);
    old.parentNode.replaceChild(nw, old);

    //click handler unificado: maneja colocacion nueva, levantar pieza y mover pieza levantada
    nw.addEventListener('click', function(e) {
      if (Combat.running) return;
      const rect = nw.getBoundingClientRect();
      const px   = (e.clientX - rect.left) * (nw.width / rect.width);
      const py   = (e.clientY - rect.top)  * (nw.height / rect.height);
      const cell = hexCellAt(px, py);
      if (!cell) return;

      const pieceInCell = boardGet(cell.col, cell.row, 'player');

      //CASO 1: hay una pieza levantada y el jugador hace clic en una celda vacia -> moverla
      if (self.movingPiece && !pieceInCell) {
        boardPlace(cell.col, cell.row, self.movingPiece.id, 'player');
        SFX.colocar();
        Combat.log('↔ Pieza movida.', 'info');
        self.movingPiece = null;
        Combat.updatePreview();
        boardRender('playerBoard', 'player');
        return;
      }

      //CASO 2: hay una pieza levantada y el jugador hace clic en otra ocupada -> cancelar
      if (self.movingPiece && pieceInCell) {
        self._cancelMove();
        Combat.log('⚠ Movimiento cancelado.', 'info');
        return;
      }

      //CASO 3: no hay pieza levantada, hay pieza en la celda -> levantarla para mover
      if (!self.movingPiece && pieceInCell) {
        //si el jugador tenia una pieza del inventario seleccionada, deseleccionarla
        if (self.selectedIndex !== null) {
          getId('piece-grid').querySelectorAll('.piece-card').forEach(function(c) { c.classList.remove('selected'); });
          self.selectedIndex = null;
        }
        self.movingPiece = { id: pieceInCell, fromCol: cell.col, fromRow: cell.row };
        //quitar la pieza del tablero para que la celda quede libre temporalmente
        boardPlace(cell.col, cell.row, null, 'player');
        SFX.seleccionar();
        Combat.log('✋ Pieza levantada. Clic en celda vacía para colocarla.', 'info');
        Combat.updatePreview();
        boardRender('playerBoard', 'player');
        return;
      }

      //CASO 4: no hay pieza levantada, celda vacia, hay pieza del inventario seleccionada -> colocar nueva
      if (!self.movingPiece && !pieceInCell) {
        if (self.selectedIndex === null) { Combat.log('⚠ Selecciona una pieza primero.'); return; }
        const piezaId = RoundBuilder.roundPieces[self.selectedIndex].id;
        boardPlace(cell.col, cell.row, piezaId, 'player');
        //registrar la colocacion en BD para estadisticas de uso de piezas
        API.registrarColocacion(piezaId, cell.col, cell.row, 'jugador');
        SFX.colocar();
        RoundBuilder.markPlaced(self.selectedIndex);
        self.selectedIndex = null;
        boardRender('playerBoard', 'player');
      }
    });

    //mostrar previsualizacion de colocacion al mover el mouse con una pieza seleccionada o levantada
    nw.addEventListener('mousemove', function(e) {
      if (Combat.running) return;
      if (self.selectedIndex === null && !self.movingPiece) return;
      const rect = nw.getBoundingClientRect();
      const px   = (e.clientX - rect.left) * (nw.width / rect.width);
      const py   = (e.clientY - rect.top)  * (nw.height / rect.height);
      boardRender('playerBoard', 'player', hexCellAt(px, py));
    });

    nw.addEventListener('mouseleave', function() { boardRender('playerBoard', 'player'); });
  },

  //elimina todas las piezas del jugador y reinicia los contadores de la ronda de construccion
  clearBoard: function() {
    if (Combat.running) return;
    //si habia una pieza levantada en proceso, descartarla
    this.movingPiece = null;
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

//modulo DeckBuilder: pantalla de armar mazo antes de cada combate
//el jugador elige exactamente PIECES_PER_ROUND (5) piezas de su inventario completo
//esas 5 piezas se reutilizan en TODAS las rondas del combate
const DeckBuilder = {
  selected: [],      //array de indices de State.unlockedIds seleccionados
  pendingNode: null, //nodo al que se va a entrar despues de armar el mazo

  //inicia la pantalla de armar mazo para el nodo de combate indicado
  show: function(node) {
    this.pendingNode = node;
    this.selected    = [];

    //actualizar el badge del tipo de nodo
    const badge = getId('deck-node-badge');
    badge.textContent =
      node.type === 'boss'  ? '👑 JEFE'   :
      node.type === 'elite' ? '💀 ELITE'  : '⚔ COMBATE';
    badge.style.color =
      node.type === 'boss'  ? '#FF4444'   :
      node.type === 'elite' ? '#FF6B9D'   : '#FFD166';

    this.renderInventory();
    this.updateCounter();
    showScreen('screen-deck-builder');
  },

  //dibuja todas las piezas del inventario del jugador en una grilla
  //cada pieza se puede clickear para seleccionar/deseleccionar
  renderInventory: function() {
    const cont = getId('deck-inventory');
    cont.innerHTML = '';

    //agrupar State.unlockedIds para mostrar contador de duplicados
    //un mismo id puede aparecer varias veces (p.ej. 2x gen_e iniciales)
    //pero queremos mostrar 1 sola tarjeta con el contador "x2"
    const counts = {};
    for (let i = 0; i < State.unlockedIds.length; i++) {
      const id = State.unlockedIds[i];
      counts[id] = (counts[id] || 0) + 1;
    }

    //convertir a un array de pares { id, count } sin duplicados
    const grupos = [];
    const vistos = {};
    for (let i = 0; i < State.unlockedIds.length; i++) {
      const id = State.unlockedIds[i];
      if (!vistos[id]) { grupos.push({ id, count: counts[id] }); vistos[id] = true; }
    }

    //alerta si el inventario es menor a 5 (no se puede armar mazo completo)
    if (State.unlockedIds.length < PIECES_PER_ROUND) {
      const faltan = PIECES_PER_ROUND - State.unlockedIds.length;
      const aviso = document.createElement('div');
      aviso.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 1rem; color: #FFD166; font-size: 0.9rem; background: rgba(255,209,102,0.05); border: 1px solid rgba(255,209,102,0.3); border-radius: 6px;';
      aviso.innerHTML = '⚠ Tu inventario tiene ' + State.unlockedIds.length + ' piezas. Selecciona todas y se rellenaran ' + faltan + ' pieza' + (faltan > 1 ? 's' : '') + ' basica' + (faltan > 1 ? 's' : '') + ' automaticamente.';
      cont.appendChild(aviso);
    }

    //renderizar cada pieza como una tarjeta clickeable
    for (let i = 0; i < grupos.length; i++) {
      this._renderPieceCard(cont, grupos[i].id, grupos[i].count);
    }
  },

  //crea y agrega una tarjeta de pieza al contenedor del inventario
  _renderPieceCard: function(cont, id, count) {
    const piece = getPiece(id);
    if (!piece) return;
    const card = document.createElement('div');
    card.className = 'deck-piece';
    card.dataset.id = id;
    card.innerHTML =
      '<span class="pc-icon" style="color:' + TYPE_COLORS[piece.type] + '">' + TYPE_ICONS[piece.type] + '</span>' +
      '<div class="pc-info">' +
        '<span class="pc-name">' + piece.name + '</span>' +
        '<span class="pc-type ' + piece.type + '">' + TYPE_LABELS[piece.type] + '</span>' +
      '</div>' +
      (count > 1 ? '<span class="pc-count">x' + count + '</span>' : '');

    const self = this;
    card.addEventListener('click', function() { self.toggle(id); });
    card.addEventListener('mouseenter', function(e) { Tooltip.show(e, piece); });
    card.addEventListener('mouseleave', function() { Tooltip.hide(); });

    cont.appendChild(card);
  },

  //alterna seleccion de una pieza por id
  toggle: function(pieceId) {
    //buscar el primer indice de esta pieza en unlockedIds que NO este ya seleccionado
    const idx = this._findUnselectedIndex(pieceId);
    const ultimoSeleccionado = this._findLastSelectedOfId(pieceId);

    if (ultimoSeleccionado >= 0 && idx === -1) {
      //todas las copias estan seleccionadas, quitar una
      this.selected.splice(this.selected.indexOf(ultimoSeleccionado), 1);
    } else if (idx >= 0) {
      //hay una copia disponible para seleccionar
      if (this.selected.length >= PIECES_PER_ROUND) {
        return; //limite alcanzado, no agregar mas
      }
      this.selected.push(idx);
    } else {
      return;
    }

    SFX.seleccionar();
    this._updateCardStates();
    this.updateCounter();
  },

  //devuelve el primer indice en State.unlockedIds del id dado que NO esta en selected
  _findUnselectedIndex: function(pieceId) {
    for (let i = 0; i < State.unlockedIds.length; i++) {
      if (State.unlockedIds[i] === pieceId && this.selected.indexOf(i) === -1) {
        return i;
      }
    }
    return -1;
  },

  //devuelve el ultimo indice (de State.unlockedIds) seleccionado que coincide con el id
  _findLastSelectedOfId: function(pieceId) {
    for (let i = this.selected.length - 1; i >= 0; i--) {
      const idx = this.selected[i];
      if (State.unlockedIds[idx] === pieceId) return idx;
    }
    return -1;
  },

  //recalcula que tarjetas se muestran como seleccionadas segun this.selected
  _updateCardStates: function() {
    const seleccionadasPorId = {};
    for (let i = 0; i < this.selected.length; i++) {
      const id = State.unlockedIds[this.selected[i]];
      seleccionadasPorId[id] = (seleccionadasPorId[id] || 0) + 1;
    }

    const cards = getId('deck-inventory').querySelectorAll('.deck-piece');
    cards.forEach(function(card) {
      const id = card.dataset.id;
      if (seleccionadasPorId[id] > 0) card.classList.add('selected');
      else                            card.classList.remove('selected');
    });
  },

  //actualiza el contador "X / 5" y el estado del boton confirmar
  //si el inventario tiene menos de 5 piezas, el boton se habilita cuando todas estan seleccionadas
  //(las que falten se rellenaran automaticamente con piezas basicas en confirm())
  updateCounter: function() {
    const total      = State.unlockedIds.length;
    const seleccion  = this.selected.length;
    const counterEl  = getId('deck-selected-count');
    const confirmBtn = getId('deck-confirm-btn');

    counterEl.textContent = seleccion;

    if (total >= PIECES_PER_ROUND) {
      //inventario suficiente: hay que seleccionar exactamente 5
      confirmBtn.disabled = (seleccion !== PIECES_PER_ROUND);
    } else {
      //inventario insuficiente: el boton se habilita cuando todas las disponibles estan seleccionadas
      //las restantes (PIECES_PER_ROUND - total) se rellenaran con piezas basicas en confirm()
      confirmBtn.disabled = (seleccion !== total);
    }
  },

  //rellena automaticamente con piezas aleatorias del inventario
  autoFill: function() {
    this.selected = [];
    const indices = [];
    for (let i = 0; i < State.unlockedIds.length; i++) indices.push(i);
    indices.sort(function() { return Math.random() - 0.5; });

    const limite = Math.min(PIECES_PER_ROUND, indices.length);
    for (let i = 0; i < limite; i++) this.selected.push(indices[i]);

    SFX.seleccionar();
    this._updateCardStates();
    this.updateCounter();
  },

  //limpiar todas las selecciones
  clearSelection: function() {
    this.selected = [];
    this._updateCardStates();
    this.updateCounter();
  },

  //confirmar el mazo y pasar al combate
  //si el inventario tiene menos de 5 piezas, rellena con piezas basicas del catalogo (rareza 0)
  confirm: function() {
    //convertir indices a piezas reales (objetos del CATALOG)
    const mazoElegido = [];
    for (let i = 0; i < this.selected.length; i++) {
      const id = State.unlockedIds[this.selected[i]];
      const p  = getPiece(id);
      if (p) mazoElegido.push(p);
    }

    //rellenar con piezas basicas del catalogo si el mazo esta incompleto
    //usa solo piezas comunes (rareza 0) para no regalar piezas avanzadas
    if (mazoElegido.length < PIECES_PER_ROUND) {
      const basicas = CATALOG.filter(function(p) { return p.rarity === 0; });
      while (mazoElegido.length < PIECES_PER_ROUND && basicas.length > 0) {
        const random = basicas[Math.floor(Math.random() * basicas.length)];
        mazoElegido.push(random);
      }
    }

    //validacion final: si por alguna razon no llegamos a 5, no permitir continuar
    if (mazoElegido.length !== PIECES_PER_ROUND) return;

    //guardar el mazo en RoundBuilder para que startBuildRound lo use
    RoundBuilder.combatDeck = mazoElegido;

    //arrancar el combate normal
    BattleUI.setup(this.pendingNode);
  },
};

//mostrar información de una pieza en un tooltip cerca del cursor del mouse
const Tooltip = {
  show: function(e, piece) {
    const t = getId('tooltip');
    let stats = '';
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
const Draft = {
  //muestra 3 piezas aleatorias filtradas por zona y rareza mínima
  //origen indica cómo se obtuvo la pieza ('draft', 'tienda') para registrarlo en BD
  show: function(zone, minRarity, origen) {
    if (!minRarity) minRarity = 0;
    if (!origen)    origen    = 'draft';
    showScreen('screen-draft');
    initDraftSprite();

    const elegibles = CATALOG.filter(function(p) {
      return p.rarity <= Math.min(zone + 1, 4) && p.rarity >= minRarity;
    });
    elegibles.sort(function() { return Math.random() - .5; });

    const picks = elegibles.slice(0, 3);
    const cont  = getId('draft-cards');
    cont.innerHTML = '';
    for (let i = 0; i < picks.length; i++) {
      const piece = picks[i];
      const card  = document.createElement('div');
      card.className = 'draft-card';
      card.innerHTML =
        '<div class="dc-icon" style="color:' + TYPE_COLORS[piece.type] + '">' + TYPE_ICONS[piece.type] + '</div>' +
        '<div class="dc-name">' + piece.name + '</div>' +
        '<div class="dc-type" style="color:' + TYPE_COLORS[piece.type] + '">' + TYPE_LABELS[piece.type] + '</div>' +
        '<div class="dc-desc">' + piece.desc + '</div>' +
        '<div class="dc-rarity" style="color:' + RARITY_COLORS[piece.rarity] + '">' + RARITIES[piece.rarity].toUpperCase() + '</div>';
      (function(p, org) {
        //al hacer clic en una tarjeta se agrega la pieza a la colección y se registra en BD
        card.addEventListener('click', function() {
          State.unlockedIds.push(p.id);
          API.agregarInventario(p.id, org, State.currentNode ? State.currentNode._dbId : null);
          Game.afterDraft();
        });
      })(piece, origen);
      cont.appendChild(card);
    }
  },
};

//eventos
const Events = {
  _currentEvent: null, //evento activo; se guarda en trigger() para usarlo en resolve()

  trigger: function() {
    //omitir si el pool está vacío o el jugador ya usó todos los eventos disponibles
    if (EVENT_POOL.length === 0 || State.eventUses >= EVENT_USES_MAX) {
      Game.afterDraft();
      return;
    }
    const ev = getRandom(EVENT_POOL);
    Events._currentEvent = ev;
    showScreen('screen-event');
    initNpcSprite();
    getId('event-icon').textContent  = ev.icon  || '❓';
    getId('event-title').textContent = ev.title;
    getId('event-text').textContent  = ev.text;

    const ch = getId('event-choices');
    ch.innerHTML = '';
    for (let i = 0; i < ev.choices.length; i++) {
      (function(c) {
        const btn = document.createElement('button');
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
    //mapeo de acciones del frontend al ENUM tipo_efecto de la BD
    const tipoMap = { heal: 'heal', rare: 'draft', dmg: 'damage', skip: 'skip' };
    const ev = Events._currentEvent;
    //solo registrar el evento en BD si el nodo ya tiene _dbId asignado
    //(puede no tenerlo si el jugador entra al nodo antes de que la BD haya respondido)
    if (State.currentNode && State.currentNode._dbId) {
      API.registrarEvento(
        State.currentNode._dbId,
        ev ? ev.title : '',
        tipoMap[c.action] || 'skip',
        c.value  || null,
        c.label  || null
      );
    }
    if      (c.action === 'heal') { State.hp = Math.min(State.maxHp, State.hp + (c.value || 20)); Draft.show(State.zone); }
    else if (c.action === 'rare') { Draft.show(State.zone, 2); }  // solo piezas de rareza ≥ 2
    else if (c.action === 'dmg')  { State.hp -= (c.value || 10); if (State.hp <= 0) Game.gameOver(); else Game.afterDraft(); }
    else                           Game.afterDraft(); //skip o una acción desconocida -> volver al mapa
  },
};

//tienda
const Shop = {
  //la tienda reutiliza la pantalla Draft filtrada a piezas poco-comunes o mejores
  show: function(zone) {
    if (State.shopUses >= SHOP_USES_MAX) { Game.afterDraft(); return; }
    State.shopUses++;
    Draft.show(zone, 1, 'tienda'); //rareza mínima 1 (poco común); origen 'tienda' para BD
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
  const W  = 440;
  const H  = 380;
  const ns = 'http://www.w3.org/2000/svg'; //se utiliza como un identificador único para diferenciar
  //los gráficos vectoriales de otros elementos HTML o XML y para crear elementos SVG con createElementNS
  //que en este caso se usa para construir el mapa del juego con nodos y conexiones entre ellos
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('width',  W);
  svg.setAttribute('height', H);

  const COLOR = { start:'#00E5C8', combat:'#FFD166', elite:'#FF6B9D', shop:'#9B72CF', event:'#56CFB2', boss:'#FF4444' };
  const ICON  = { start:'⬡', combat:'⚔', elite:'💀', shop:'🏪', event:'❓', boss:'☠' };
  const LABEL = { start:'INICIO', combat:'COMBATE', elite:'ÉLITE', shop:'TIENDA', event:'EVENTO', boss:'JEFE' };

  //posición en píxeles de un nodo según su fila y columna en la grilla del mapa
  function pos(n) { return { x: 80 + n.col * 140, y: 45 + n.row * (H / 4.3) }; }

  //dibujar líneas de conexión punteadas entre nodo padre e hijos
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]; if (!n.children) continue;
    for (let j = 0; j < n.children.length; j++) {
      let ch = null;
      for (let k = 0; k < nodes.length; k++) if (nodes[k].id === n.children[j]) { ch = nodes[k]; break; }
      if (!ch) continue;
      const d  = pos(n), h = pos(ch);
      const ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', d.x); ln.setAttribute('y1', d.y);
      ln.setAttribute('x2', h.x); ln.setAttribute('y2', h.y);
      ln.setAttribute('stroke', '#1E3050');
      ln.setAttribute('stroke-width', '2');
      ln.setAttribute('stroke-dasharray', '5 4');
      svg.appendChild(ln);
    }
  }

  //dibujar cada nodo con su círculo, icono y etiqueta
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const p = pos(n);
    const col = COLOR[n.type] || '#888';
    const active = n.accessible && !n.completed;
    //un nodo está bloqueado si su límite de uso fue alcanzado (tienda/evento)
    const bl = (n.type === 'shop'  && State.shopUses  >= SHOP_USES_MAX) ||
               (n.type === 'event' && State.eventUses >= EVENT_USES_MAX);

    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    g.style.cursor = active ? 'pointer' : 'default';

    //halo pulsante para nodos activos
    if (active) {
      const halo = document.createElementNS(ns, 'circle');
      halo.setAttribute('r', '28'); halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', bl ? '#444' : col);
      halo.setAttribute('stroke-width', '1'); halo.setAttribute('opacity', '0.3');
      g.appendChild(halo);
    }

    const circ = document.createElementNS(ns, 'circle');
    circ.setAttribute('r', '22');
    circ.setAttribute('fill',         n.completed ? '#080C18' : bl ? '#1a1a2e' : col + '1A');
    circ.setAttribute('stroke',       n.completed ? '#1E3050' : bl ? '#333'    : col);
    circ.setAttribute('stroke-width', active ? '2.5' : '1.5');
    g.appendChild(circ);

    const ic = document.createElementNS(ns, 'text');
    ic.setAttribute('text-anchor', 'middle'); ic.setAttribute('dominant-baseline', 'middle');
    ic.setAttribute('font-size', '16');
    ic.setAttribute('fill', n.completed ? '#1E3050' : bl ? '#444' : col);
    ic.textContent = n.completed ? '✓' : bl ? '🔒' : ICON[n.type];
    g.appendChild(ic);

    const lbl = document.createElementNS(ns, 'text');
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