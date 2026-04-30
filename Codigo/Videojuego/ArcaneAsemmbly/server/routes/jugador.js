//routes/jugador.js
//endpoints relacionados con el jugador autenticado
//principalmente para meta-progresion (coleccion permanente de piezas)

const express = require('express');
const pool    = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
//proteger todas las rutas con el middleware de auth
router.use(authMiddleware);

//GET /api/jugador/coleccion
//devuelve todas las piezas que el jugador ha descubierto a lo largo de TODAS sus runs
//el cliente lo llama al iniciar sesion para poblar State.unlockedIds con el progreso permanente
//y al iniciar una nueva run, esas piezas ya estan disponibles en el DeckBuilder
router.get('/coleccion', async (req, res) => {
  const { jugador_id } = req.jugador;
  try {
    //traer detalles completos de cada pieza descubierta
    //hacemos JOIN con PIEZA para devolver datos utiles al cliente (nombre, tipo, rareza)
    const [piezas] = await pool.query(
      `SELECT mjc.pieza_id, p.nombre, p.tipo, p.rareza,
              p.descripcion, mjc.fecha_descubierta
       FROM META_JUGADOR_COLECCION mjc
       JOIN PIEZA p ON mjc.pieza_id = p.pieza_id
       WHERE mjc.jugador_id = ?
       ORDER BY mjc.fecha_descubierta DESC`,
      [jugador_id]
    );

    //resumen de progreso (cuantas piezas tiene de cuantas, porcentaje)
    //usa la vista v_coleccion_jugador creada en schemaV2
    const [[resumen]] = await pool.query(
      'SELECT * FROM v_coleccion_jugador WHERE jugador_id = ?',
      [jugador_id]
    );

    res.json({
      resumen: resumen || {
        jugador_id,
        nombre: '',
        piezas_descubiertas: 0,
        piezas_totales: 0,
        pct_completado: 0,
      },
      piezas,
    });
  } catch (err) {
    console.error('GET /jugador/coleccion error:', err);
    res.status(500).json({ error: 'Error al obtener coleccion' });
  }
});

//GET /api/jugador/perfil
//devuelve datos del jugador autenticado
//util para mostrar info en pantallas como "MI COLECCION" o el chip de sesion
router.get('/perfil', async (req, res) => {
  const { jugador_id } = req.jugador;
  try {
    const [[jugador]] = await pool.query(
      `SELECT jugador_id, nombre, email, rol,
              fecha_registro, ultimo_acceso,
              total_runs, tiempo_total_seg
       FROM JUGADOR
       WHERE jugador_id = ?`,
      [jugador_id]
    );

    if (!jugador) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    //agregamos contador de victorias y derrotas en una sola query
    const [[stats]] = await pool.query(
      `SELECT
        SUM(CASE WHEN resultado='victoria' THEN 1 ELSE 0 END) AS victorias,
        SUM(CASE WHEN resultado='derrota'  THEN 1 ELSE 0 END) AS derrotas
       FROM RUN
       WHERE jugador_id = ?`,
      [jugador_id]
    );

    res.json({
      ...jugador,
      victorias: stats.victorias || 0,
      derrotas:  stats.derrotas  || 0,
    });
  } catch (err) {
    console.error('GET /jugador/perfil error:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

module.exports = router;
