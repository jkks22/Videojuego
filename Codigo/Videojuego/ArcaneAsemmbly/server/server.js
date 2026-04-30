//server.js
//se requiere ejecutar node server.js

const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//archivos estáticos del juego (index.html, js/, style.css, assets/)
//apuntan a la raíz del proyecto (un nivel arriba de server/)
app.use(express.static(path.join(__dirname, '..')));

//rutas API
const authRoutes = require('./routes/auth');
const runsRoutes = require('./routes/runs');
const adminRoutes = require('./routes/admin');
const jugadorRoutes = require('./routes/jugador');

app.use('/api/auth',    authRoutes);
app.use('/api/runs',    runsRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/jugador', jugadorRoutes);

//ruta raiz para que sirva el juego
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

//arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Arcane Assembly corriendo en http://localhost:${PORT}`);
});