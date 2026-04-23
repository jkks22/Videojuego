//db/connection.js
//conexion a la base de datos de MySQL con mysql2
//leer variables del archivo .env

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arcane_assembly',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit:    10,
});

//verificar conexion al arrancar
pool.getConnection()
  .then(conn => {
    console.log('MySQL conectado correctamente');
    conn.release();
  })
  .catch(err => {
    console.error('Error conectando a MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;