//combat.js: lógica de resolución de combate, gestión de rondas y sistema RoundBuilder de colocación

//módulo Combat
const Combat = {
  
  running: false,//true mientras se está resolviendo una ronda (bloquea interacción)
  buildRound: 1,//número de ronda de construcción actual
  enemyHp: 0,//HP actual del enemigo
  enemyMaxHp: 0,//HP máximo del enemigo (para calcular porcentaje de barra)
  currentEnemy: null,//datos del enemigo activo
  playerShield: 0,//escudo acumulado del jugador en esta ronda

  //configura un nuevo encuentro de combate — HP se escala por zona y tipo de nodo
  init: function(zone, nodeType) {
    let base = 22 + zone * 6;
    if (nodeType === 'elite') base = 45 + zone * 12;
    if (nodeType === 'boss')  base = 90 + zone * 25;

    this.enemyHp         = base;
    this.enemyMaxHp      = base;
    this.playerShield    = 0;
    this.running         = false;
    this.buildRound      = 1;
    //acumuladores de daño y sinergias para reportar al terminar el combate
    this._totalDamage    = 0;
    this._totalSinergias = 0;

    getId('log-entries').innerHTML = '';
    getId('last-event').classList.add('hidden');
    this.updateEnemyUI();
    this.updatePlayerUI();
    this.updateImpulseUI();
  },
  

  /**
   * evalúa el tablero de un lado y retorna todas las salidas de combate
   * orden de resolución: GEN->TRANS->CAT->ANCH
   * {string} side  player o enemy
   * return {{ damage, shield, reflect, synergyCount, catBonus }}
   */
  resolveBoard: function(side) {
    const grid = (side === 'enemy') ? enemyGrid : playerGrid;
    let dmg = 0, shield = 0, reflect = 0;
    const recursos = {}; //mapa "col,row" -> energía producida por generadores

    //fase 1 — recolectar energía de todos los generadores
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++) {
        const p = getPiece(grid[r][c]);
        if (p && p.type === TYPE_GEN) recursos[c + ',' + r] = p.output;
      }

    //fase 2 — los transformadores consumen energía adyacente de generadores y producen daño
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++) {
        const p = getPiece(grid[r][c]);
        if (!p || p.type !== TYPE_TRANS) continue;
        let e = 0;
        hexNeighbors(c, r).forEach(function(v) {
          if (recursos[v.col + ',' + v.row]) e += recursos[v.col + ',' + v.row];
        });
        dmg += e * p.multiplier;
      }

    //fase 3 — los catalizadores amplifican el daño total
    //bonus de sinergia cuando GEN y TRANS son ambos vecinos del catalizador
    let cat = 0, syn = 0;
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++) {
        const p = getPiece(grid[r][c]);
        if (!p || p.type !== TYPE_CAT) continue;
        const vv = hexNeighbors(c, r).filter(function(v) { return grid[v.row][v.col]; });
        cat += p.amplify * vv.length;
        let tg = false, tt = false;
        vv.forEach(function(v) {
          const vp = getPiece(grid[v.row][v.col]);
          if (vp && vp.type === TYPE_GEN)   tg = true;
          if (vp && vp.type === TYPE_TRANS) tt = true;
        });
        if (tg && tt) { cat += 0.3; syn++; } //bono de sinergia
      }
    dmg *= (1 + cat); //aplicar amplificación total al daño

    //fase 4 — las anclas proveen escudo y porcentaje de reflejo
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++) {
        const p = getPiece(grid[r][c]);
        if (!p || p.type !== TYPE_ANCH) continue;
        if (p.shieldVal)  shield  += p.shieldVal;
        if (p.reflectPct) reflect  = Math.max(reflect, p.reflectPct); //se usa el mayor reflejo disponible
      }

    return {
      damage:       Math.round(dmg),
      shield:       shield,
      reflect:      reflect,
      synergyCount: syn,
      catBonus:     Math.round(cat * 100),
    };
  },

  //agrega una entrada estilizada al registro de batalla y actualiza el banner de último evento
  log: function(msg, tipo) {
    const entries = getId('log-entries');

    //quitar .latest de la entrada anterior para que solo haya una destacada
    const prev = entries.querySelector('.log-entry.latest');
    if (prev) prev.classList.remove('latest');

    const div = document.createElement('div');
    div.className   = 'log-entry ' + (tipo || '') + ' fade-in';
    div.textContent = msg;
    entries.appendChild(div);
    div.classList.add('latest');
    entries.parentElement.scrollTop = entries.parentElement.scrollHeight;

    //actualizar el banner de último evento
    const banner = getId('last-event');
    const leText = getId('le-text');
    if (banner && leText) {
      leText.textContent = msg;
      //limpiar variantes de color anteriores y aplicar la del tipo actual
      banner.classList.remove('dmg', 'syn', 'shld', 'vic', 'def', 'info');
      if (tipo) banner.classList.add(tipo);
      banner.classList.remove('hidden');
      //reiniciar la animación: quitar .pulse, forzar reflow, re-agregar .pulse
      banner.classList.remove('pulse');
      void banner.offsetWidth;
      banner.classList.add('pulse');
    }
  },

  //sincroniza la barra de HP del enemigo y el badge del tipo de nodo
  updateEnemyUI: function() {
    const pct  = Math.max(0, this.enemyHp) / this.enemyMaxHp;
    getId('e-hp').textContent     = 'HP: ' + Math.max(0, this.enemyHp);
    getId('e-hp-bar').style.width = (pct * 100) + '%';

    const node = State.currentNode;
    if (node) {
      const nb      = getId('node-badge');
      nb.textContent = node.type === 'boss' ? 'JEFE' : node.type === 'elite' ? 'ÉLITE' : 'COMBATE';
      nb.className   = 'node-badge' + (node.type === 'boss' ? ' boss' : node.type === 'elite' ? ' elite' : '');
    }
    if (this.currentEnemy) getId('enemy-name').textContent = this.currentEnemy.name;
  },

  //sincroniza la barra de HP del jugador
  updatePlayerUI: function() {
    const pct = State.hp / State.maxHp;
    getId('b-hp-bar').style.width  = (pct * 100) + '%';
    getId('b-hp-val').textContent  = State.hp + '/' + State.maxHp;
    updateSpriteHP(pct, Math.max(0, this.enemyHp) / this.enemyMaxHp);
  },

  //sincroniza los indicadores de puntos de impulso y el estado del botón
  updateImpulseUI: function() {
    const dots = getId('b-impulse');
    if (!dots) return;
    dots.innerHTML = '';
    for (let i = 0; i < State.maxImpulse; i++) {
      const d = document.createElement('div');
      d.className = 'impulse-dot' + (i < State.impulse ? '' : ' empty');
      dots.appendChild(d);
    }
    const btn = getId('btn-impulse');
    if (btn) {
      btn.disabled = State.impulse <= 0 || this.running;
      getId('impulse-cost').textContent = '(' + State.impulse + ' restantes)';
    }
  },

  //actualiza la previsualización de daño/escudo bajo el tablero del jugador
  updatePreview: function() {
    const pr  = this.resolveBoard('player');
    getId('p-dmg').textContent  = 'DMG: ' + pr.damage;
    getId('p-shld').textContent = 'ESC: ' + pr.shield;
    const syn = getId('p-syn');
    if (pr.synergyCount > 0) syn.classList.remove('hidden');
    else                     syn.classList.add('hidden');
  },

  //ejecuta una ronda de combate completa de forma asíncrona
  runRound: async function() {
    if (this.running) return;
    if (boardCount('player') === 0) { this.log('⚠ Coloca al menos una pieza.'); return; }

    this.running = true;
    getId('btn-impulse').disabled = true;
    getId('round-badge').classList.remove('hidden');
    getId('round-num').textContent = this.buildRound;
    this.log('━━ RONDA ' + this.buildRound + ' ━━');

    //animar los indicadores de fase para que el jugador pueda seguir la resolución
    const fases = ['FASE 1 — GENERADORES','FASE 2 — TRANSFORMADORES','FASE 3 — CATALIZADORES','FASE 4 — ANCLAS','FASE 5 — DAÑO FINAL'];
    const phEl  = getId('phase-indicator');
    phEl.classList.remove('hidden');
    for (let i = 0; i < fases.length; i++) { phEl.textContent = fases[i]; await waitMs(280); }
    phEl.classList.add('hidden');

    const pr = this.resolveBoard('player');
    this.playerShield    = pr.shield;
    //acumular totales del combate para reportarlos a la BD al finalizar
    this._totalDamage    += pr.damage;
    this._totalSinergias += pr.synergyCount;

    if (pr.damage > 0) this.log('⚡ Tu tablero genera ' + pr.damage + ' de daño', 'dmg');
    if (pr.shield > 0) this.log('🛡 Escudo: ' + pr.shield + ' pts', 'shld');

    //activar efecto de sinergia si hay catalizadores con bonus
    if (pr.synergyCount > 0) {
      this.log('✦ x' + pr.synergyCount + ' Sinergia! +' + pr.catBonus + '% daño extra', 'syn');
      SFX.sinergia();
      const pb = getId('playerBoard');
      if (pb) { const rc = pb.getBoundingClientRect(); fxSynergy(rc.left + rc.width / 2, rc.top + rc.height / 2); }
      await waitMs(500);
    }
    await waitMs(280);

    //resolver el tablero enemigo para calcular el daño entrante
    const er    = this.resolveBoard('enemy');
    let incoming = er.damage;

    //el escudo del jugador absorbe el daño entrante primero
    if (this.playerShield > 0) {
      const bl = Math.min(this.playerShield, incoming);
      incoming -= bl;
      this.log('🛡 Escudo bloquea ' + bl + ' pts', 'shld');
      const ps = getId('sprite-player');
      if (ps) { const rc2 = ps.getBoundingClientRect(); fxShield(rc2.left + rc2.width / 2, rc2.top + rc2.height / 2); }
    }

    //el reflejo devuelve una porción del daño restante al enemigo
    if (pr.reflect > 0 && incoming > 0) {
      const ref = Math.round(incoming * pr.reflect);
      this.enemyHp -= ref;
      this.log('↩ Reflejo: ' + ref + ' al enemigo', 'syn');
      this.updateEnemyUI();
    }

    //ataque del jugador
    await new Promise(function(resolve) { playPlayerAttack(resolve); });

    if (pr.damage > 0) {
      this.enemyHp -= pr.damage;
      spriteHit('enemy');
      SFX.danoEnemigo();

      //los enemigos no-jefe reproducen una animación de daño recibido
      let isBoss = false;
      if (Combat.currentEnemy)
        for (let i = 0; i < ENEMIES.boss.length; i++)
          if (ENEMIES.boss[i].name === Combat.currentEnemy.name) { isBoss = true; break; }

      if (enemyAnim && this.enemyHp > 0 && !isBoss) {
        const hd  = State.zone <= 1 ? SPRITE_DEF.necroHurt  : SPRITE_DEF.golemHurt;
        const id2 = State.zone <= 1 ? SPRITE_DEF.necroIdle  : SPRITE_DEF.golemIdle;
        enemyAnim.changeDef(hd, false, function() {
          setTimeout(function() { if (enemyAnim) enemyAnim.changeDef(id2, true); }, 80);
        });
      }
      showDmgPopup('-' + pr.damage, window.innerWidth * 0.73, window.innerHeight * 0.35);
      this.updateEnemyUI();
    }
    await waitMs(280);

    //ataque del enemigo
    if (incoming > 0) {
      await new Promise(function(resolve) { playEnemyAttack(resolve); });
      State.hp = Math.max(0, State.hp - incoming);
      spriteHit('player');
      SFX.danoJugador();
      if (playerAnim && State.hp > 0)
        playerAnim.changeDef(SPRITE_DEF.damaged, false, function() {
          setTimeout(function() { if (playerAnim) playerAnim.changeDef(SPRITE_DEF.idle, true); }, 100);
        });
      this.log('💥 Enemigo inflige ' + incoming + '. HP: ' + State.hp, 'dmg');
      showDmgPopup('-' + incoming, window.innerWidth * 0.27, window.innerHeight * 0.35);
    }

    this.updateEnemyUI();
    this.updatePlayerUI();
    updateSpriteHP(State.hp / State.maxHp, Math.max(0, this.enemyHp) / this.enemyMaxHp);

    //destellos de las celdas del enemigo para mostrar su ataque, luego restaurar el tablero
    const fp = [];
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++) if (enemyGrid[r][c]) fp.push({ col: c, row: r });
    boardRender('enemyBoard', 'enemy', null, fp);
    await waitMs(200);
    boardRender('enemyBoard', 'enemy');
    boardRender('playerBoard', 'player');
    await waitMs(380);

    this.running = false;
    getId('round-badge').classList.add('hidden');

    //verificar victoria
    if (this.enemyHp <= 0) {
      await new Promise(function(resolve) { playEnemyDeath(resolve); });
      this.log('══ ¡VICTORIA! ══', 'vic');
      SFX.victoria();
      fxVictory(window.innerWidth / 2, window.innerHeight * 0.3);
      API.terminarCombate('victoria', this._totalSinergias, this._totalDamage);
      //las anclas de regeneración curan al jugador tras ganar
      let regen = 0;
      for (let r = 0; r < GRID_ROWS; r++)
        for (let c = 0; c < GRID_COLS; c++) {
          const p = getPiece(playerGrid[r][c]);
          if (p && p.type === TYPE_ANCH && p.regenVal) regen += p.regenVal;
        }
      if (regen > 0) { State.hp = Math.min(State.maxHp, State.hp + regen); this.log('💚 Anclas: +' + regen + ' HP', 'shld'); }
      State.combatsWon++;
      await waitMs(700);
      Game.afterCombatVictory();
      return;
    }

    //verificar derrota
    if (State.hp <= 0) {
      this.log('══ DERROTA ══', 'def');
      SFX.derrota();
      API.terminarCombate('derrota', this._totalSinergias, this._totalDamage);
      if (playerAnim) {
        await new Promise(function(resolve) {
          playerAnim.changeDef(SPRITE_DEF.death, false, function() { setTimeout(resolve, 400); });
        });
      } else { await waitMs(700); }
      Game.gameOver();
      return;
    }

    //ambos sobrevivieron — iniciar la siguiente ronda de construcción
    this.buildRound++;
    this.log('── Enemigo sobrevive (' + Math.max(0, this.enemyHp) + ' HP). Nueva ronda ──', 'info');
    API.avanzarRonda();
    await waitMs(380);

    //el enemigo reconfigura su tablero al inicio de cada nueva ronda
    boardGenerateEnemy(State.zone, State.currentNode.type);
    boardRender('enemyBoard', 'enemy');
    RoundBuilder.startBuildRound();
  },
};


// módulo RoundBuilder
const RoundBuilder = {
  roundPieces: [], //piezas disponibles para colocar en esta ronda
  placed:      0,  //cuántas piezas ha colocado el jugador hasta ahora

  //configura una nueva ronda de construcción: limpia el tablero y reparte piezas nuevas
  startBuildRound: function() {
    boardClear('player');
    this.placed = 0;

    //pool = catálogo filtrado por rareza de zona + colección desbloqueada del jugador
    const pool = [];
    for (let i = 0; i < CATALOG.length; i++)
      if (CATALOG[i].rarity <= Math.min(State.zone, 3)) pool.push(CATALOG[i]);
    for (let i = 0; i < State.unlockedIds.length; i++) {
      const p = getPiece(State.unlockedIds[i]);
      if (p) pool.push(p);
    }
    this.roundPieces = [];
    for (let i = 0; i < PIECES_PER_ROUND; i++)
      this.roundPieces.push(pool[Math.floor(Math.random() * pool.length)]);

    this.renderPieces();
    this.updateLabels();
    Combat.updatePreview();
    BattleUI.attachCanvasClick();
    Combat.updateImpulseUI();
  },

  //renderiza la grilla de tarjetas de pieza en el panel de inventario
  renderPieces: function() {
    const grid = getId('piece-grid');
    grid.innerHTML = '';
    for (let i = 0; i < this.roundPieces.length; i++) {
      const p    = this.roundPieces[i];
      const card = document.createElement('div');
      card.className = 'piece-card';
      card.innerHTML =
        '<span class="pc-icon" style="color:' + TYPE_COLORS[p.type] + '">' + TYPE_ICONS[p.type] + '</span>' +
        '<div class="pc-info"><span class="pc-name">' + p.name + '</span>' +
        '<span class="pc-type ' + p.type + '">' + TYPE_LABELS[p.type] + '</span></div>' +
        '<span class="pc-rarity">' + RARITIES[p.rarity] + '</span>';
      (function(idx, piece, c) {
        c.addEventListener('click', function() { BattleUI.selectPiece(idx, c); });
        c.addEventListener('mouseenter', function(e) { Tooltip.show(e, piece); });
        c.addEventListener('mouseleave', function() { Tooltip.hide(); });
      })(i, p, card);
      grid.appendChild(card);
    }
  },

  //actualiza la etiqueta de ronda y el contador de piezas restantes
  updateLabels: function() {
    getId('build-lbl').textContent   = 'Ronda ' + Combat.buildRound + ' — Coloca tus ' + PIECES_PER_ROUND + ' piezas';
    getId('pieces-left').textContent = (PIECES_PER_ROUND - this.placed) + ' restantes';
  },

  //se llama cuando una pieza es colocada exitosamente en el tablero
  markPlaced: function(index) {
    this.placed++;
    const cards = getId('piece-grid').querySelectorAll('.piece-card');
    if (cards[index]) cards[index].classList.add('used');
    this.updateLabels();
    Combat.updatePreview();
    //resolver automáticamente cuando todas las piezas han sido colocadas
    if (this.placed >= PIECES_PER_ROUND) {
      Combat.log('✓ 5 piezas — resolviendo...', 'info');
      setTimeout(function() { Combat.runRound(); }, 500);
    }
  },

  //agrega una pieza extra a la mano (se activa al gastar una carga de impulso)
  addExtraPiece: function() {
    const pool  = CATALOG.filter(function(p) { return p.rarity <= Math.min(State.zone, 3); });
    const extra = pool[Math.floor(Math.random() * pool.length)];
    this.roundPieces.push(extra);
    const grid  = getId('piece-grid');
    const card  = document.createElement('div');
    const idx   = this.roundPieces.length - 1;
    card.className = 'piece-card fade-in';
    card.innerHTML =
      '<span class="pc-icon" style="color:' + TYPE_COLORS[extra.type] + '">' + TYPE_ICONS[extra.type] + '</span>' +
      '<div class="pc-info"><span class="pc-name">' + extra.name + '</span></div>';
    (function(i, p, c) {
      c.addEventListener('click',      function() { BattleUI.selectPiece(i, c); });
      c.addEventListener('mouseenter', function(e) { Tooltip.show(e, p); });
      c.addEventListener('mouseleave', function() { Tooltip.hide(); });
    })(idx, extra, card);
    grid.appendChild(card);
    Combat.log('⚡ Pieza extra por impulso', 'syn');
  },
};
