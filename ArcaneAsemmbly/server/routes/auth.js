//routes/auth.js
//endpoints de autenticación públicos (no requieren token)
//POST /api/auth/register — crear jugador
//POST /api/auth/login    — iniciar sesión y obtener token JWT

const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../db/connection');

const router = express.Router();
const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = '24h';

//POST /api/auth/register
//body: { nombre, email, password }
//respuesta: { token, jugador_id, nombre, rol }
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son requeridos' });
  }

  try {
    //verificar que el email no esté ya registrado
    const [existentes] = await pool.query(
      'SELECT jugador_id FROM JUGADOR WHERE email = ?',
      [email]
    );
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    //hashear la contraseña antes de almacenar
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    //insertar el nuevo jugador
    const [result] = await pool.query(
      'INSERT INTO JUGADOR (nombre, email, password_hash) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );
    const jugador_id = result.insertId;

    //generar y devolver el token de sesión
    const token = jwt.sign(
      { jugador_id, rol: 'jugador' },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    res.status(201).json({ token, jugador_id, nombre, rol: 'jugador' });

  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//POST /api/auth/login
//body: { email, password }
//respuesta: { token, jugador_id, nombre, rol }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }

  //usar el mismo mensaje genérico para email no encontrado o password incorrecto
  //esto evita que un atacante use el endpoint para descubrir emails registrados
  const ERROR_GENERICO = 'Credenciales incorrectas';

  try {
    const [filas] = await pool.query(
      'SELECT jugador_id, nombre, password_hash, rol FROM JUGADOR WHERE email = ? AND activo = 1',
      [email]
    );

    if (filas.length === 0) {
      return res.status(401).json({ error: ERROR_GENERICO });
    }

    const jugador = filas[0];
    const match = await bcrypt.compare(password, jugador.password_hash);

    if (!match) {
      return res.status(401).json({ error: ERROR_GENERICO });
    }

    //actualizar timestamp de último acceso
    await pool.query(
      'UPDATE JUGADOR SET ultimo_acceso = NOW() WHERE jugador_id = ?',
      [jugador.jugador_id]
    );

    const token = jwt.sign(
      { jugador_id: jugador.jugador_id, rol: jugador.rol },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    res.json({
      token,
      jugador_id: jugador.jugador_id,
      nombre:     jugador.nombre,
      rol:        jugador.rol,
    });

  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
