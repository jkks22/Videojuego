//server.js
//punto de entrada del servidor. ejecuta con: npm run dev (desarrollo) o npm start (producción)

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

//importar la conexión aquí garantiza que si la BD falla, el proceso muere al arrancar
//en lugar de fallar en la primera petición
require('./db/connection');

const app = express();

//middleware global
app.use(cors());
app.use(express.json());

//archivos estáticos del juego (index.html, css, js, assets)
//el cliente está en la carpeta hermana ArcaneAsemmbly (subiendo un nivel desde server/)
app.use(express.static(path.join(__dirname, '..'))); 

//rutas de la api
const authRoutes  = require('./routes/auth');
const runsRoutes  = require('./routes/runs');
const adminRoutes = require('./routes/admin');

app.use('/api/auth',  authRoutes);
app.use('/api/runs',  runsRoutes);
app.use('/api/admin', adminRoutes);

//ruta raíz: servir el index del juego
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html')); 
});

//manejador de errores global (último middleware)
app.use((err, req, res, next) => {
  console.error('error no capturado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Arcane Assembly corriendo en http://localhost:${PORT}`);
});