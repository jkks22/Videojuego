
//api.js: módulo de comunicación entre el cliente del juego y la API REST del servidor.
//todas las llamadas son opcionales: si el jugador no está autenticado, se omiten

var API = (function () {

  var BASE = '/api'; //ruta base de la API
  var _token = null; //JWT del usuario autenticado
  var _runId  = null; //ID de la run activa en base de datos
  var _nodoId = null; //ID del nodo actual en base de datos
  var _combateId = null; //ID del combate activo en base de datos
  var _ronda = 1; //contador de ronda para el registro de colocaciones

  //construye los headers HTTP, incluyendo el token si el usuario está autenticado
  function headers() {
    var h = { 'Content-Type': 'application/json' };
    if (_token) h['Authorization'] = 'Bearer ' + _token;
    return h;
  }

  function post(url, data) {
    return fetch(BASE + url, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data),
    }).then(function (r) { return r.json(); }).catch(function () { return null; });
  }

  function patch(url, data) {
    return fetch(BASE + url, {
      method:  'PATCH',
      headers: headers(),
      body:    JSON.stringify(data),
    }).then(function (r) { return r.json(); }).catch(function () { return null; });
  }

  function get(url) {
    return fetch(BASE + url, { headers: headers() })
      .then(function (r) { return r.json(); }).catch(function () { return []; });
  }

  //Auth
  function init() {
    _token = localStorage.getItem('aa_token') || null;
  }

  function isLoggedIn() { return !!_token; }

  function register(nombre, email, password) {
    return post('/auth/register', { nombre, email, password })
      .then(function (data) {
        if (data && data.token) {
          _token = data.token;
          localStorage.setItem('aa_token', _token);
        }
        return data;
      });
  }

  function login(email, password) {
    return post('/auth/login', { email, password })
      .then(function (data) {
        if (data && data.token) {
          _token = data.token;
          localStorage.setItem('aa_token', _token);
        }
        return data;
      });
  }

  function logout() {
    _token = null; _runId = null; _nodoId = null; _combateId = null;
    localStorage.removeItem('aa_token');
  }

  //Runs
  //llamar en Game.startRun()
  function iniciarRun() {
    if (!isLoggedIn()) return Promise.resolve(null);
    return post('/runs', {}).then(function (data) {
      if (data && data.run_id) _runId = data.run_id;
      return data;
    });
  }

  //llamar en Game.afterCombatVictory() al avanzar zona y en gameOver/victoria
  function actualizarRun(datos) {
    if (!isLoggedIn() || !_runId) return Promise.resolve(null);
    return patch('/runs/' + _runId, datos);
  }

  function getHistorial() {
    if (!isLoggedIn()) return Promise.resolve([]);
    return get('/runs');
  }

  //Nodos
  //llamar en Game.buildMap() por cada nodo del mapa generado
  //nodo: { tipo, zona, fila_mapa, col_mapa, completado, accesible, enemigo_id }
  function registrarNodo(nodo) {
    if (!isLoggedIn() || !_runId) return Promise.resolve(null);
    return post('/runs/' + _runId + '/nodos', nodo)
      .then(function (data) {
        return data;
      });
  }

  //llamar en Game.afterCombatVictory() al marcar nodo completado y al desbloquear nodos hijos (accesible = true)
  function actualizarNodo(nodo_id, datos) {
    if (!isLoggedIn() || !_runId) return Promise.resolve(null);
    return patch('/runs/' + _runId + '/nodos/' + nodo_id, datos);
  }

  //combates
  //llamar en BattleUI.setup() al entrar al nodo
  //nodo_id: el id devuelto por registrarNodo()
  //hp_enemigo: Combat.enemyMaxHp calculado en Combat.init()
  function iniciarCombate(nodo_id, hp_enemigo) {
    if (!isLoggedIn() || !_runId) return Promise.resolve(null);
    _nodoId = nodo_id;
    _ronda  = 1;
    return post('/runs/' + _runId + '/nodos/' + nodo_id + '/combate',
      { hp_enemigo })
      .then(function (data) {
        if (data && data.combate_id) _combateId = data.combate_id;
        return data;
      });
  }

  //llamar al final de Combat.runRound() cuando termina (victoria/derrota)
  function terminarCombate(resultado, sinergias, danioTotal) {
    if (!isLoggedIn() || !_runId || !_nodoId || !_combateId) {
      return Promise.resolve(null);
    }
    return patch(
      '/runs/' + _runId + '/nodos/' + _nodoId + '/combate/' + _combateId,
      {
        resultado,
        ronda_actual:          _ronda,
        sinergias_activadas:   sinergias   || 0,
        danio_total_infligido: danioTotal  || 0,
      }
    );
  }

  //avanzar ronda al empezar RoundBuilder.startBuildRound()
  function avanzarRonda() { _ronda++; }

  //colocaciones
  //llamar en BattleUI.attachCanvasClick() al colocar una pieza
  //pieza_id: el codigo de la pieza (gen_e, tr_b, etc.)
  function registrarColocacion(pieza_id, col_hex, fila_hex, propietario) {
    if (!isLoggedIn() || !_runId || !_nodoId || !_combateId) {
      return Promise.resolve(null);
    }
    return post(
      '/runs/' + _runId + '/nodos/' + _nodoId +
      '/combate/' + _combateId + '/colocaciones',
      {
        pieza_id,
        col_hex,
        fila_hex,
        propietario: propietario || 'jugador',
        ronda: _ronda,
      }
    );
  }

  //inventario
  //llamar al inicio de cada run con las piezas iniciales (origen='inicial') y cada vez que el jugador elige una pieza en Draft.show() (origen='draft')
  function agregarInventario(pieza_id, origen, nodo_adquirido_id) {
    if (!isLoggedIn() || !_runId) return Promise.resolve(null);
    return post('/runs/' + _runId + '/inventario', {
      pieza_id,
      cantidad: 1,
      origen,
      nodo_adquirido_id: nodo_adquirido_id || null,
    });
  }

  //eventos
  //llamar en Events.resolve() al terminar el evento
  //nodo_id: el id del nodo de tipo event
  function registrarEvento(nodo_id, titulo, tipo_efecto, valor_efecto, eleccion) {
    if (!isLoggedIn() || !_runId) return Promise.resolve(null);
    return post('/runs/' + _runId + '/nodos/' + nodo_id + '/evento', {
      titulo,
      tipo_efecto,
      valor_efecto:     valor_efecto || null,
      eleccion_jugador: eleccion     || null,
    });
  }

  //exponer API publica
  return {
    init,
    isLoggedIn,
    register,
    login,
    logout,
    //runs
    iniciarRun,
    actualizarRun,
    getHistorial,
    //nodos
    registrarNodo,
    actualizarNodo,
    //combates
    iniciarCombate,
    terminarCombate,
    avanzarRonda,
    //colocaciones
    registrarColocacion,
    //inventario
    agregarInventario,
    //eventos
    registrarEvento,
    //getters de estado interno
    getRunId:     function () { return _runId; },
    getNodoId:    function () { return _nodoId; },
    getCombateId: function () { return _combateId; },
  };
})();

//inicializar al cargar la pagina (leer token guardado)
document.addEventListener('DOMContentLoaded', function () {
  API.init();
});
