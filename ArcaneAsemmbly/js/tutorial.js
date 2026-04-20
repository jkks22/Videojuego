//tutorial.js: tutorial interactivo para nuevos jugadores — RF-04

const Tutorial = {
  _step: 0, //indice del paso actual (0-based)

  _steps: [
    {
      icon: '🎮',
      title: '¡BIENVENIDO AL PLIEGUE!',
      body: '<p>Eres un <strong>Ingeniero Arcano</strong> atrapado en el Pliegue, una dimensión de energía pura.</p>' +
            '<p>Tu misión: sobrevivir <strong>3 zonas</strong> derrotando enemigos con tu tablero de piezas arcanas.</p>' +
            '<p>Cada combate que ganes te dará una <strong>nueva pieza</strong> para fortalecer tu estrategia.</p>',
      showChain: false,
    },
    {
      icon: '🗺',
      title: 'FLUJO DE JUEGO',
      body: '<p><strong>1. MAPA</strong> — Elige qué nodo visitar: combate, evento, tienda o jefe.</p>' +
            '<p><strong>2. COMBATE</strong> — Coloca 5 piezas en tu tablero hexagonal para atacar al enemigo.</p>' +
            '<p><strong>3. RECOMPENSA</strong> — Al ganar, elige una nueva pieza entre tres opciones.</p>' +
            '<p><strong>4. REPITE</strong> — Avanza por el mapa hasta enfrentar al jefe de zona.</p>',
      showChain: false,
    },
    {
      icon: '🧩',
      title: 'LAS 4 CATEGORÍAS',
      body: '<p><span class="hl-gen">⚡ GENERADOR</span> — Produce energía arcana. Es la fuente de todo daño.</p>' +
            '<p><span class="hl-trans">⚙ TRANSFORMADOR</span> — Convierte energía adyacente en daño directo.</p>' +
            '<p><span class="hl-cat">✦ CATALIZADOR</span> — Amplifica el daño total del tablero.</p>' +
            '<p><span class="hl-anch">⬡ ANCLA</span> — Genera escudo para absorber ataques enemigos.</p>',
      showChain: false,
    },
    {
      icon: '🔗',
      title: 'CADENA DE SINERGIA',
      body: '<p>Las piezas generan más daño cuando siguen la <strong>cadena de energía</strong>:</p>' +
            '<p>Un <span class="hl-gen">GENERADOR</span> debe estar junto a un <span class="hl-trans">TRANSFORMADOR</span>.' +
            ' Ambos junto a un <span class="hl-cat">CATALIZADOR</span> activan el <strong>bono de sinergia</strong> (+30% extra).</p>' +
            '<p>Las <span class="hl-anch">ANCLAS</span> al final de la cadena amplifican el escudo generado.</p>',
      showChain: true,
    },
    {
      icon: '✦',
      title: 'CÓMO ACTIVAR SINERGIAS',
      body: '<p>En el tablero hexagonal, las celdas <strong>adyacentes</strong> se conectan con líneas de luz si forman parte de la cadena.</p>' +
            '<p>Un <span class="hl-cat">CATALIZADOR</span> activa el bono cuando tiene un <span class="hl-gen">GENERADOR</span>' +
            ' <strong>y</strong> un <span class="hl-trans">TRANSFORMADOR</span> como vecinos al mismo tiempo.</p>' +
            '<p>¡Cuantas más sinergias actives en una ronda, mayor será tu daño total!</p>',
      showChain: false,
    },
    {
      icon: '🎯',
      title: 'CONTROLES',
      body: '<p><strong>Clic en pieza</strong> → seleccionarla del inventario inferior.</p>' +
            '<p><strong>Clic en celda del tablero</strong> → colocarla en esa posición.</p>' +
            '<p><strong>⚡ IMPULSO</strong> — gasta una carga para recibir una pieza extra en la ronda.</p>' +
            '<p><strong>✕ LIMPIAR</strong> — retira todas las piezas y reinicia la ronda de construcción.</p>' +
            '<p>Al colocar las 5 piezas el combate se resuelve <strong>automáticamente</strong>.</p>',
      showChain: false,
    },
  ],

  //abre el tutorial en el primer paso
  open: function() {
    this._step = 0;
    getId('tutorial-overlay').classList.remove('hidden');
    this.render();
  },

  //cierra el tutorial y marca como visto en localStorage para no molestarlo dos veces
  close: function() {
    getId('tutorial-overlay').classList.add('hidden');
    localStorage.setItem('arcane_tutorial_seen', '1');
  },

  //avanza al siguiente paso; cierra si ya es el último
  next: function() {
    if (this._step < this._steps.length - 1) {
      this._step++;
      this.render();
    } else {
      this.close();
    }
  },

  //retrocede al paso anterior
  prev: function() {
    if (this._step > 0) {
      this._step--;
      this.render();
    }
  },

  //renderiza el contenido del paso actual en el overlay
  render: function() {
    const step  = this._steps[this._step];
    const total = this._steps.length;

    getId('tut-step-num').textContent   = this._step + 1;
    getId('tut-step-total').textContent = total;
    getId('tut-icon').textContent       = step.icon;
    getId('tut-title').textContent      = step.title;
    getId('tut-body').innerHTML         = step.body;

    //mostrar u ocultar la cadena de preview animada
    const chain = getId('tut-chain');
    if (step.showChain) chain.classList.remove('hidden');
    else                chain.classList.add('hidden');

    //deshabilitar "Anterior" en el primer paso
    const prevBtn = getId('tut-prev');
    if (prevBtn) prevBtn.disabled = (this._step === 0);

    //cambiar texto del botón "Siguiente" en el último paso
    const nextBtn = getId('tut-next');
    if (nextBtn) nextBtn.textContent = (this._step === total - 1) ? '¡Empezar! ▶' : 'Siguiente ▶';
  },

  //devuelve true si el tutorial nunca se ha mostrado (primera run del jugador)
  shouldShowOnFirstRun: function() {
    return !localStorage.getItem('arcane_tutorial_seen');
  },

  //resetea el flag para que el tutorial vuelva a aparecer en la próxima run
  reset: function() {
    localStorage.removeItem('arcane_tutorial_seen');
  },
};
