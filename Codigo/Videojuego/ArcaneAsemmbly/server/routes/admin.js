//routes/admin.js
//endpoints exclusivos del panel de administrador
//requieren token con rol = 'admin'

const express = require('express');
const pool    = require('../db/connection');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
//doble protección: primero validar token, luego validar rol admin
router.use(authMiddleware, adminMiddleware);

//GET /api/admin/players
//lista todos los jugadores con filtros opcionales
//query params:
//   ?estado=activo|inactivo  (activo si tuvo run en los últimos 7 días)
//   ?zona=1|2|3              (filtrar por zona máxima alcanzada)
router.get('/players', async (req, res) => {
  const { estado, zona } = req.query;

  const where   = [];
  const valores = [];

  if (estado === 'activo') {
    where.push(
      `(SELECT MAX(fecha_inicio) FROM RUN
        WHERE jugador_id = j.jugador_id) >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
  } else if (estado === 'inactivo') {
    where.push(
      `(SELECT MAX(fecha_inicio) FROM RUN
        WHERE jugador_id = j.jugador_id) < DATE_SUB(NOW(), INTERVAL 7 DAY)
        OR (SELECT COUNT(*) FROM RUN WHERE jugador_id = j.jugador_id) = 0`
    );
  }

  if (zona) {
    where.push(
      `(SELECT MAX(zona_actual) FROM RUN
        WHERE jugador_id = j.jugador_id) = ?`
    );
    valores.push(parseInt(zona));
  }

  //solo mostrar jugadores normales, no admins
  where.push("j.rol = 'jugador'");

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const [filas] = await pool.query(
      `SELECT j.jugador_id, j.nombre, j.email,
              j.fecha_registro, j.ultimo_acceso,
              j.total_runs, j.tiempo_total_seg,
              (SELECT COUNT(*) FROM RUN
               WHERE jugador_id = j.jugador_id
               AND resultado = 'victoria') AS total_victorias,
              (SELECT MAX(zona_actual) FROM RUN
               WHERE jugador_id = j.jugador_id) AS zona_maxima_global
       FROM JUGADOR j
       ${whereClause}
       ORDER BY j.fecha_registro DESC`,
      valores
    );
    res.json(filas);
  } catch (err) {
    console.error('GET /admin/players error:', err);
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
});

//GET /api/admin/players/:id
//detalle completo de un jugador con sus últimas 20 runs
router.get('/players/:id', async (req, res) => {
  const jugador_id = parseInt(req.params.id);
  try {
    //datos del jugador con estadísticas agregadas
    const [jugador] = await pool.query(
      `SELECT j.jugador_id, j.nombre, j.email,
              j.fecha_registro, j.ultimo_acceso,
              j.total_runs, j.tiempo_total_seg,
              (SELECT COUNT(*) FROM RUN r2
               WHERE r2.jugador_id = j.jugador_id
               AND r2.resultado = 'victoria') AS total_victorias,
              (SELECT COUNT(*) FROM RUN r3
               WHERE r3.jugador_id = j.jugador_id
               AND r3.resultado = 'derrota') AS total_derrotas,
              (SELECT p.nombre
               FROM COLOCACION_TABLERO ct
               JOIN COMBATE cb ON ct.combate_id = cb.combate_id
               JOIN NODO nd    ON cb.nodo_id    = nd.nodo_id
               JOIN RUN r4     ON nd.run_id     = r4.run_id
               JOIN PIEZA p    ON ct.pieza_id   = p.pieza_id
               WHERE r4.jugador_id = j.jugador_id
               AND ct.propietario = 'jugador'
               GROUP BY ct.pieza_id, p.nombre
               ORDER BY COUNT(*) DESC LIMIT 1) AS pieza_favorita
       FROM JUGADOR j
       WHERE j.jugador_id = ?`,
      [jugador_id]
    );

    if (jugador.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    //últimas 20 runs del jugador
    const [runs] = await pool.query(
      `SELECT run_id, fecha_inicio, fecha_fin,
              zona_actual, hp_actual, resultado,
              TIMESTAMPDIFF(SECOND, fecha_inicio, fecha_fin) AS duracion_seg
       FROM RUN
       WHERE jugador_id = ?
       ORDER BY fecha_inicio DESC LIMIT 20`,
      [jugador_id]
    );

    res.json({ ...jugador[0], runs });
  } catch (err) {
    console.error('GET /admin/players/:id error:', err);
    res.status(500).json({ error: 'Error al obtener jugador' });
  }
});

//GET /api/admin/stats
//estadísticas globales del sistema para el dashboard
router.get('/stats', async (req, res) => {
  try {
    //usar la vista v_admin_resumen creada en schema.sql para los totales
    const [[totales]] = await pool.query('SELECT * FROM v_admin_resumen');

    //top 5 piezas más usadas por jugadores
    const [piezas_top] = await pool.query(
      `SELECT p.pieza_id, p.nombre, p.tipo, COUNT(*) AS veces_usada
       FROM COLOCACION_TABLERO ct
       JOIN PIEZA p ON ct.pieza_id = p.pieza_id
       WHERE ct.propietario = 'jugador'
       GROUP BY p.pieza_id, p.nombre, p.tipo
       ORDER BY veces_usada DESC LIMIT 5`
    );

    //distribución de runs por zona alcanzada
    const [zona_stats] = await pool.query('SELECT * FROM v_tasa_victoria_zona');

    //ranking de los 10 mejores jugadores
    const [ranking] = await pool.query(
      'SELECT * FROM v_ranking_jugadores LIMIT 10'
    );

    res.json({ totales, piezas_top, zona_stats, ranking });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

//GET /api/admin/global-stats
//estadisticas globales del sistema usando la vista v_estadisticas_globales
//incluye totales, tasas de victoria, tiempo total y promedios
//mas detallado que /stats: agrega top 10 jugadores y top 10 piezas
router.get('/global-stats', async (req, res) => {
  try {
    //metricas globales en una sola query
    const [[stats]] = await pool.query('SELECT * FROM v_estadisticas_globales');

    //top 10 jugadores por victorias usando la vista existente
    const [top_jugadores] = await pool.query(
      'SELECT * FROM v_ranking_jugadores LIMIT 10'
    );

    //top 10 piezas mas usadas
    const [top_piezas] = await pool.query(
      `SELECT p.pieza_id, p.nombre, p.tipo, p.rareza,
              COUNT(*) AS veces_usada
       FROM COLOCACION_TABLERO ct
       JOIN PIEZA p ON ct.pieza_id = p.pieza_id
       WHERE ct.propietario = 'jugador'
       GROUP BY p.pieza_id, p.nombre, p.tipo, p.rareza
       ORDER BY veces_usada DESC LIMIT 10`
    );

    //distribucion de runs por zona
    const [por_zona] = await pool.query('SELECT * FROM v_tasa_victoria_zona');

    //progreso de coleccion de todos los jugadores (de la vista nueva)
    const [colecciones] = await pool.query(
      `SELECT * FROM v_coleccion_jugador
       ORDER BY piezas_descubiertas DESC LIMIT 10`
    );

    res.json({
      stats,
      top_jugadores,
      top_piezas,
      por_zona,
      colecciones,
    });
  } catch (err) {
    console.error('GET /admin/global-stats error:', err);
    res.status(500).json({ error: 'Error al obtener estadisticas globales' });
  }
});

//GET /api/admin/coleccion-jugador/:id
//ver la coleccion completa de piezas descubiertas por un jugador especifico
//util para el panel admin al revisar el progreso de un jugador
router.get('/coleccion-jugador/:id', async (req, res) => {
  const jugador_id = parseInt(req.params.id);
  if (!jugador_id || isNaN(jugador_id)) {
    return res.status(400).json({ error: 'jugador_id invalido' });
  }
  try {
    const [piezas] = await pool.query(
      `SELECT mjc.pieza_id, p.nombre, p.tipo, p.rareza,
              p.descripcion, mjc.fecha_descubierta
       FROM META_JUGADOR_COLECCION mjc
       JOIN PIEZA p ON mjc.pieza_id = p.pieza_id
       WHERE mjc.jugador_id = ?
       ORDER BY mjc.fecha_descubierta DESC`,
      [jugador_id]
    );

    //resumen de progreso de coleccion del jugador
    const [[resumen]] = await pool.query(
      'SELECT * FROM v_coleccion_jugador WHERE jugador_id = ?',
      [jugador_id]
    );

    res.json({ resumen, piezas });
  } catch (err) {
    console.error('GET /admin/coleccion-jugador/:id error:', err);
    res.status(500).json({ error: 'Error al obtener coleccion del jugador' });
  }
});

module.exports = router;