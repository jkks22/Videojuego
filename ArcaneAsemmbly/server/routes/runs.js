//routes/runs.js
//endpoints para registrar y consultar runs, nodos, combates,
//colocaciones, inventario y eventos. todos requieren token válido.

const express = require('express');
const pool    = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
//proteger todas las rutas de este módulo con el middleware de auth
router.use(authMiddleware);

//POST /api/runs
//crear una nueva run cuando el jugador presiona INICIAR RUN
//llamar desde Game.startRun() en game.js del cliente
router.post('/', async (req, res) => {
  const { jugador_id } = req.jugador;
  try {
    const [result] = await pool.query(
      `INSERT INTO RUN (jugador_id, zona_actual, hp_actual, impulso, usos_tienda, usos_evento, resultado)
       VALUES (?, 1, 100, 3, 0, 0, 'en_progreso')`,
      [jugador_id]
    );
    //el trigger trg_incrementar_total_runs ya actualiza JUGADOR.total_runs
    res.status(201).json({ run_id: result.insertId });
  } catch (err) {
    console.error('POST /runs error:', err);
    res.status(500).json({ error: 'Error al crear run' });
  }
});

//GET /api/runs
//historial de runs del jugador autenticado
//usado por la plataforma web en la sección Historial
router.get('/', async (req, res) => {
  const { jugador_id } = req.jugador;
  try {
    const [filas] = await pool.query(
      `SELECT run_id, fecha_inicio, fecha_fin, zona_actual, hp_actual, resultado,
              TIMESTAMPDIFF(SECOND, fecha_inicio, fecha_fin) AS duracion_seg
       FROM RUN
       WHERE jugador_id = ?
       ORDER BY fecha_inicio DESC`,
      [jugador_id]
    );
    res.json(filas);
  } catch (err) {
    console.error('GET /runs error:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

//PATCH /api/runs/:id
//actualizar el estado de la run (zona, hp, impulso, resultado)
//llamar desde Game.afterCombatVictory(), Game.gameOver() y al avanzar zona
router.patch('/:id', async (req, res) => {
  const { jugador_id } = req.jugador;
  const run_id = parseInt(req.params.id);
  const { zona_actual, hp_actual, impulso, usos_tienda, usos_evento, resultado } = req.body;

  try {
    //verificar que la run pertenece al jugador autenticado
    const [check] = await pool.query(
      'SELECT run_id FROM RUN WHERE run_id = ? AND jugador_id = ?',
      [run_id, jugador_id]
    );
    if (check.length === 0) {
      return res.status(404).json({ error: 'Run no encontrada' });
    }

    //construir el SET dinámicamente solo con los campos enviados
    const campos  = [];
    const valores = [];

    if (zona_actual !== undefined) { campos.push('zona_actual = ?'); valores.push(zona_actual); }
    if (hp_actual   !== undefined) { campos.push('hp_actual = ?');   valores.push(hp_actual); }
    if (impulso     !== undefined) { campos.push('impulso = ?');     valores.push(impulso); }
    if (usos_tienda !== undefined) { campos.push('usos_tienda = ?'); valores.push(usos_tienda); }
    if (usos_evento !== undefined) { campos.push('usos_evento = ?'); valores.push(usos_evento); }
    if (resultado   !== undefined) { campos.push('resultado = ?');   valores.push(resultado); }

    //al cerrar la run, marcar fecha_fin (el trigger acumula tiempo automáticamente)
    if (resultado === 'victoria' || resultado === 'derrota') {
      campos.push('fecha_fin = NOW()');
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    valores.push(run_id);
    await pool.query(
      `UPDATE RUN SET ${campos.join(', ')} WHERE run_id = ?`,
      valores
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /runs/:id error:', err);
    res.status(500).json({ error: 'Error al actualizar run' });
  }
});

//POST /api/runs/:id/nodos
//registrar un nodo del mapa al generarlo
//llamar desde Game.buildMap() por cada nodo del mapa generado
router.post('/:id/nodos', async (req, res) => {
  const { jugador_id } = req.jugador;
  const run_id = parseInt(req.params.id);
  const { tipo, zona, fila_mapa, col_mapa, completado, accesible, enemigo_id } = req.body;

  try {
    //verificar ownership de la run
    const [check] = await pool.query(
      'SELECT run_id FROM RUN WHERE run_id = ? AND jugador_id = ?',
      [run_id, jugador_id]
    );
    if (check.length === 0) {
      return res.status(404).json({ error: 'Run no encontrada' });
    }

    const [result] = await pool.query(
      `INSERT INTO NODO (run_id, tipo, zona, fila_mapa, col_mapa, completado, accesible, enemigo_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [run_id, tipo, zona, fila_mapa, col_mapa,
       completado || false, accesible || false, enemigo_id || null]
    );
    res.status(201).json({ nodo_id: result.insertId });
  } catch (err) {
    console.error('POST /nodos error:', err);
    res.status(500).json({ error: 'Error al crear nodo' });
  }
});

//PATCH /api/runs/:id/nodos/:nid
//marcar nodo como completado o accesible
//llamar desde Game.afterCombatVictory() al desbloquear nodos hijos del mapa
router.patch('/:id/nodos/:nid', async (req, res) => {
  const nodo_id = parseInt(req.params.nid);
  const { completado, accesible } = req.body;
  try {
    const campos  = [];
    const valores = [];
    if (completado !== undefined) { campos.push('completado = ?'); valores.push(completado); }
    if (accesible  !== undefined) { campos.push('accesible = ?');  valores.push(accesible); }
    if (campos.length === 0) {
      return res.status(400).json({ error: 'Nada que actualizar' });
    }
    valores.push(nodo_id);
    await pool.query(
      `UPDATE NODO SET ${campos.join(', ')} WHERE nodo_id = ?`,
      valores
    );
    //si el nodo es boss y se marca completado, el trigger trg_avanzar_zona_boss
    //ya avanza RUN.zona_actual automáticamente
    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /nodos/:nid error:', err);
    res.status(500).json({ error: 'Error al actualizar nodo' });
  }
});

//POST /api/runs/:id/nodos/:nid/combate
//crear el combate al entrar a un nodo combat/elite/boss
//llamar desde BattleUI.setup() en ui.js del cliente
router.post('/:id/nodos/:nid/combate', async (req, res) => {
  const nodo_id = parseInt(req.params.nid);
  const { hp_enemigo } = req.body;

  try {
    //relación 1:1 con NODO: si ya existe el combate, devolverlo en lugar de crear duplicado
    const [existente] = await pool.query(
      'SELECT combate_id FROM COMBATE WHERE nodo_id = ?',
      [nodo_id]
    );
    if (existente.length > 0) {
      return res.json({ combate_id: existente[0].combate_id });
    }

    const [result] = await pool.query(
      `INSERT INTO COMBATE (nodo_id, hp_enemigo, ronda_actual, sinergias_activadas, resultado, danio_total_infligido)
       VALUES (?, ?, 1, 0, NULL, 0)`,
      [nodo_id, hp_enemigo]
    );
    res.status(201).json({ combate_id: result.insertId });
  } catch (err) {
    console.error('POST /combate error:', err);
    res.status(500).json({ error: 'Error al crear combate' });
  }
});

//PATCH /api/runs/:id/nodos/:nid/combate/:cid
//actualizar resultado del combate al terminar la ronda final
//llamar desde Combat.runRound() al final en victoria/derrota
router.patch('/:id/nodos/:nid/combate/:cid', async (req, res) => {
  const combate_id = parseInt(req.params.cid);
  const { resultado, ronda_actual, sinergias_activadas, danio_total_infligido } = req.body;
  try {
    const campos  = [];
    const valores = [];
    if (resultado             !== undefined) { campos.push('resultado = ?');             valores.push(resultado); }
    if (ronda_actual          !== undefined) { campos.push('ronda_actual = ?');          valores.push(ronda_actual); }
    if (sinergias_activadas   !== undefined) { campos.push('sinergias_activadas = ?');   valores.push(sinergias_activadas); }
    if (danio_total_infligido !== undefined) { campos.push('danio_total_infligido = ?'); valores.push(danio_total_infligido); }
    if (campos.length === 0) {
      return res.status(400).json({ error: 'Nada que actualizar' });
    }
    valores.push(combate_id);
    await pool.query(
      `UPDATE COMBATE SET ${campos.join(', ')} WHERE combate_id = ?`,
      valores
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /combate/:cid error:', err);
    res.status(500).json({ error: 'Error al actualizar combate' });
  }
});

//POST /api/runs/:id/nodos/:nid/combate/:cid/colocaciones
//registrar una pieza colocada en el tablero
//llamar desde BattleUI.attachCanvasClick() al colocar pieza
router.post('/:id/nodos/:nid/combate/:cid/colocaciones', async (req, res) => {
  const combate_id = parseInt(req.params.cid);
  const { pieza_id, col_hex, fila_hex, propietario, ronda } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO COLOCACION_TABLERO (combate_id, pieza_id, col_hex, fila_hex, propietario, ronda)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [combate_id, pieza_id, col_hex, fila_hex,
       propietario || 'jugador', ronda || 1]
    );
    //el trigger trg_actualizar_danio_combate suma el daño automáticamente
    res.status(201).json({ colocacion_id: result.insertId });
  } catch (err) {
    console.error('POST /colocaciones error:', err);
    res.status(500).json({ error: 'Error al registrar colocación' });
  }
});

//POST /api/runs/:id/inventario
//agregar pieza al inventario de la run
//llamar desde Draft.show() al elegir pieza, o al iniciar run con piezas iniciales
router.post('/:id/inventario', async (req, res) => {
  const run_id = parseInt(req.params.id);
  const { pieza_id, cantidad, origen, nodo_adquirido_id } = req.body;
  try {
    //si la pieza con el mismo origen ya existe en el inventario, sumamos cantidad
    //(la PK compuesta de INVENTARIO_RUN es run_id + pieza_id + origen)
    const [existe] = await pool.query(
      `SELECT cantidad FROM INVENTARIO_RUN
       WHERE run_id = ? AND pieza_id = ? AND origen = ?`,
      [run_id, pieza_id, origen]
    );
    if (existe.length > 0) {
      await pool.query(
        `UPDATE INVENTARIO_RUN SET cantidad = cantidad + ?
         WHERE run_id = ? AND pieza_id = ? AND origen = ?`,
        [cantidad || 1, run_id, pieza_id, origen]
      );
    } else {
      await pool.query(
        `INSERT INTO INVENTARIO_RUN (run_id, pieza_id, cantidad, origen, nodo_adquirido_id)
         VALUES (?, ?, ?, ?, ?)`,
        [run_id, pieza_id, cantidad || 1, origen, nodo_adquirido_id || null]
      );
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /inventario error:', err);
    res.status(500).json({ error: 'Error al actualizar inventario' });
  }
});

//POST /api/runs/:id/nodos/:nid/evento
//registrar un evento al visitar un nodo de tipo event
//llamar desde Events.trigger() y Events.resolve()
router.post('/:id/nodos/:nid/evento', async (req, res) => {
  const nodo_id = parseInt(req.params.nid);
  const { titulo, tipo_efecto, valor_efecto, eleccion_jugador } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO EVENTO_NODO (nodo_id, titulo, tipo_efecto, valor_efecto, eleccion_jugador, fecha_resuelto)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [nodo_id, titulo, tipo_efecto,
       valor_efecto || null, eleccion_jugador || null]
    );
    res.status(201).json({ evento_id: result.insertId });
  } catch (err) {
    console.error('POST /evento error:', err);
    res.status(500).json({ error: 'Error al registrar evento' });
  }
});

module.exports = router;
