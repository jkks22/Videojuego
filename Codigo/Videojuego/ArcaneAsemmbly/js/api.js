//api.js: módulo de comunicación entre el cliente del juego y la API REST del servidor.
//todas las llamadas son opcionales: si el jugador no está autenticado, se omiten

const API = (function () {

  const BASE = '/api'; //ruta base de la API
  let _token    = null; //JWT del usuario autenticado
  let _nombre   = null; //nombre del jugador autenticado
  let _rol      = null; //rol del jugador: 'jugador' o 'admin'
  let _coleccion = null; //coleccion permanente de piezas (cargada al login)
  let _runId    = null; //ID de la run activa en base de datos
  let _nodoId   = null; //ID del nodo actual en base de datos
  let _combateId = null; //ID del combate activo en base de datos
  let _ronda    = 1; //contador de ronda para el registro de colocaciones

  //construye los headers HTTP, incluyendo el token si el usuario está autenticado
  function headers() {
    const h = { 'Content-Type': 'application/json' };
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
    _token  = localStorage.getItem('aa_token')  || null;
    _nombre = localStorage.getItem('aa_nombre') || null;
    _rol    = localStorage.getItem('aa_rol')    || null;
  }

  function isLoggedIn() { return !!_token; }
  function isAdmin()    { return _rol === 'admin'; }

  function register(nombre, email, password) {
    return post('/auth/register', { nombre, email, password })
      .then(function (data) {
        if (data && data.token) {
          _token  = data.token;
          _nombre = data.nombre;
          _rol    = data.rol || 'jugador';
          localStorage.setItem('aa_token',  _token);
          localStorage.setItem('aa_nombre', _nombre);
          localStorage.setItem('aa_rol',    _rol);
        }
        return data;
      });
  }

  function login(email, password) {
    return post('/auth/login', { email, password })
      .then(function (data) {
        if (data && data.token) {
          _token  = data.token;
          _nombre = data.nombre;
          _rol    = data.rol || 'jugador';
          localStorage.setItem('aa_token',  _token);
          localStorage.setItem('aa_nombre', _nombre);
          localStorage.setItem('aa_rol',    _rol);
        }
        return data;
      });
  }

  function logout() {
    _token = null; _nombre = null; _rol = null; _coleccion = null;
    _runId = null; _nodoId = null; _combateId = null;
    localStorage.removeItem('aa_token');
    localStorage.removeItem('aa_nombre');
    localStorage.removeItem('aa_rol');
  }

  //meta-progresion: cargar la coleccion permanente del jugador autenticado
  //devuelve { resumen, piezas } donde piezas es array de objetos pieza
  //llamar tras login para que startRun pueda usar las piezas descubiertas
  function cargarColeccion() {
    if (!isLoggedIn()) return Promise.resolve(null);
    return get('/jugador/coleccion').then(function(data) {
      if (data && data.piezas) _coleccion = data;
      return data;
    });
  }

  //devuelve la coleccion en cache (sin volver a llamar al servidor)
  function getColeccion() { return _coleccion; }

  //devuelve solo los IDs de piezas descubiertas (util para State.unlockedIds)
  function getColeccionIds() {
    if (!_coleccion || !_coleccion.piezas) return [];
    return _coleccion.piezas.map(function(p) { return p.pieza_id; });
  }

  //datos del perfil del jugador autenticado (victorias, derrotas, total runs)
  function cargarPerfil() {
    if (!isLoggedIn()) return Promise.resolve(null);
    return get('/jugador/perfil');
  }

  //solo admins: estadisticas globales para el panel
  function cargarGlobalStats() {
    if (!isLoggedIn() || !isAdmin()) return Promise.resolve(null);
    return get('/admin/global-stats');
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
    isAdmin,
    register,
    login,
    logout,
    //meta-progresion
    cargarColeccion,
    getColeccion,
    getColeccionIds,
    cargarPerfil,
    cargarGlobalStats,
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
    getNombre:    function () { return _nombre; },
    getRol:       function () { return _rol; },
  };
})();

//inicializar al cargar la pagina (leer token guardado y actualizar chip)
document.addEventListener('DOMContentLoaded', function () {
  API.init();
  Auth.updateChip();
  //si hay sesion activa, cargar la coleccion permanente del jugador
  //asi al iniciar una run, las piezas descubiertas ya estan disponibles
  if (API.isLoggedIn()) {
    API.cargarColeccion();
  }
});

//controlador de la UI de autenticación (modal login / registro)
const Auth = (function () {

  //bandera interna: si es true, después de un login/registro exitoso se inicia la run automáticamente
  //se usa cuando el jugador presiona "Iniciar Run" sin sesión activa
  let _pendingStartRun = false;
  function setPendingStartRun(v) { _pendingStartRun = v; }

  function open(tab) {
    getId('auth-modal').classList.remove('hidden');
    switchTab(tab || 'login');
  }

  function close() {
    getId('auth-modal').classList.add('hidden');
    _clearErrors();
  }

  function switchTab(tab) {
    getId('form-login').classList.toggle('hidden',    tab !== 'login');
    getId('form-register').classList.toggle('hidden', tab !== 'register');
    getId('tab-login').classList.toggle('active',     tab === 'login');
    getId('tab-register').classList.toggle('active',  tab === 'register');
    _clearErrors();
  }

  //actualiza el chip de la pantalla de título según el estado de sesión
  function updateChip() {
  const nombre   = API.getNombre();
  const chipName = getId('auth-chip-name');
  const chipBtn  = getId('auth-chip-btn');
  const adminBtn = getId('btn-admin-panel');

  if (!chipName || !chipBtn) return;

  if (API.isLoggedIn() && nombre) {
    chipName.textContent = '👤 ' + nombre.toUpperCase();
    chipName.classList.remove('hidden');

    chipBtn.textContent = 'SALIR';
    chipBtn.onclick = function () {
      API.logout();
      Auth.updateChip();
    };

    //mostrar u ocultar el botón del panel admin al cargar, volver al menú o cerrar sesión
    if (adminBtn) {
      if (API.isAdmin()) {
        adminBtn.classList.remove('hidden');
      } else {
        adminBtn.classList.add('hidden');
      }
    }

  } else {
    chipName.classList.add('hidden');

    chipBtn.textContent = '🔑 ENTRAR';
    chipBtn.onclick = function () {
      Auth.open('login');
    };

    //si no hay sesión, siempre ocultar panel admin
    if (adminBtn) {
      adminBtn.classList.add('hidden');
    }
  }
  }
  function submitLogin() {
    const email    = getId('login-email').value.trim();
    const password = getId('login-password').value;
    if (!email || !password) { _setError('login', 'Completa todos los campos.'); return; }

    API.login(email, password).then(function (data) {
      if (!data || data.error) {
        _setError('login', data ? data.error : 'Error de conexión.');
      } else {
        close();
        updateChip();
        //cargar la coleccion permanente del jugador en background
        API.cargarColeccion().then(function() {
          _refreshAdminButton();
        });
        //si el modal se abrió desde "Iniciar Run", arrancar la run automáticamente
        if (_pendingStartRun) {
          _pendingStartRun = false;
          Game.startRun();
        }
      }
    });
  }

  function submitRegister() {
    const nombre   = getId('reg-nombre').value.trim();
    const email    = getId('reg-email').value.trim();
    const password = getId('reg-password').value;
    if (!nombre || !email || !password) { _setError('register', 'Completa todos los campos.'); return; }

    API.register(nombre, email, password).then(function (data) {
      if (!data || data.error) {
        _setError('register', data ? data.error : 'Error de conexión.');
      } else {
        close();
        updateChip();
        //cargar coleccion (estara vacia para usuarios nuevos pero la inicializa)
        API.cargarColeccion().then(function() {
          _refreshAdminButton();
        });
        //si el modal se abrió desde "Iniciar Run", arrancar la run automáticamente
        if (_pendingStartRun) {
          _pendingStartRun = false;
          Game.startRun();
        }
      }
    });
  }

  //muestra u oculta el boton del panel admin segun el rol
  //solo aparece si el usuario logueado es admin
  function _refreshAdminButton() {
    const btn = getId('btn-admin-panel');
    if (!btn) return;
    if (API.isAdmin()) btn.classList.remove('hidden');
    else                btn.classList.add('hidden');
  }

  function _setError(form, msg) {
    const el = getId(form === 'login' ? 'login-error' : 'reg-error');
    el.textContent = msg;
    el.classList.remove('hidden');
    el.classList.remove('auth-info'); //limpiar la clase informativa si la había
  }

  function _clearErrors() {
    const le = getId('login-error');
    const re = getId('reg-error');
    if (le) { le.classList.add('hidden'); le.classList.remove('auth-info'); }
    if (re) { re.classList.add('hidden'); re.classList.remove('auth-info'); }
  }

  return { open, close, switchTab, updateChip, submitLogin, submitRegister, setPendingStartRun };
})();