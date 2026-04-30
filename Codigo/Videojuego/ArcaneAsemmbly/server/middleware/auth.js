//middleware/auth.js
//verifica el token JWT en rutas protegidas
//uso: router.get('/ruta', authMiddleware, handler)

const jwt = require('jsonwebtoken');

//middleware base: valida el token y adjunta los datos del jugador al request
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];

  //el token debe venir en el header como "Bearer <token>"
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //adjuntar datos al request para usarlos en los handlers de las rutas
    req.jugador = {
      jugador_id: decoded.jugador_id,
      rol:        decoded.rol,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

//middleware adicional para rutas exclusivas de administradores
//debe usarse después de authMiddleware: router.use(authMiddleware, adminMiddleware)
function adminMiddleware(req, res, next) {
  if (!req.jugador || req.jugador.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
