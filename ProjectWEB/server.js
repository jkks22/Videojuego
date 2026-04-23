//importar express para crear el servidor y manejar las rutas
const express = require('express');

//importar mysql2 para conectarse y hacer consultas a la base de datos
const mysql2 = require('mysql2');

//importar cors para permitir que el frontend pueda hacer peticiones al servidor
const cors = require('cors');

//importar path para construir rutas de archivos del sistema
const path = require('path');

//crear la aplicacion de express
const app = express();

//definir el puerto donde va a correr el servidor
const PORT = 3000;

//activar cors para que el navegador no bloquee las peticiones entre el frontend y el servidor
app.use(cors());

//permitir que el servidor entienda json en el cuerpo de las peticiones
app.use(express.json());

//servir los archivos estaticos de la carpeta actual (index.html, style.css, script.js, imagenes)
app.use(express.static(path.join(__dirname)));

//crear la conexion a la base de datos mysql con las credenciales del equipo
const db = mysql2.createConnection({
  host: 'localhost',  //direccion del servidor de mysql (en local siempre es localhost)
  user: 'root',       //usuario de mysql, cambiar si es diferente
  password: 'Sonicmetro799',//contrasena de mysql, poner la que tengan configurada
  database: 'nekonook'    //nombre de la base de datos que creamos con el archivo database.sql
});

//intentar conectarse a la base de datos al iniciar el servidor
db.connect(function (err) {

  //si hubo error al conectar, mostrar el mensaje y detener la ejecucion
  if (err) {
    console.error('error al conectar con mysql:', err.message);
    console.log('revisa que mysql este corriendo y que las credenciales sean correctas');
    return;
  }
  //si la conexion fue exitosa, confirmar en consola
  console.log('conectado a la base de datos nekonook');
});

//ruta get para obtener el menu del dia que el usuario seleccione
//ejemplo de uso: GET http://localhost:3000/api/menu/lunes
app.get('/api/menu/:dia', function (req, res) {

  // obtener el dia de la url y convertirlo a minusculas por si acaso
  var dia = req.params.dia.toLowerCase();

  //lista de dias validos para evitar consultas incorrectas a la base de datos
  var diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  //si el dia no esta en la lista, regresar un error 400 (peticion incorrecta)
  if (!diasValidos.includes(dia)) {
    return res.status(400).json({ error: 'dia no valido' });
  }

  //consulta sql para traer todos los items del menu del dia solicitado
  var query = 'SELECT * FROM menu_items WHERE dia = ? ORDER BY id';

  //ejecutar la consulta pasando el dia como parametro para evitar sql injection
  db.query(query, [dia], function (err, resultados) {

    //si hubo error en la consulta, mostrar en consola y regresar error 500
    if (err) {
      console.error('error en consulta menu:', err);
      return res.status(500).json({ error: 'error al obtener el menu' });
    }

    //regresar los resultados como json al frontend
    res.json(resultados);
  });
});

//ruta get para obtener la lista completa de gatos del cafe
//ejemplo de uso: GET http://localhost:3000/api/gatos
app.get('/api/gatos', function (req, res) {

  //consulta sql para traer todos los gatos ordenados por id
  var query = 'SELECT * FROM gatos ORDER BY id';

  //ejecutar la consulta a la base de datos
  db.query(query, function (err, resultados) {

    //si hubo error en la consulta, mostrar en consola y regresar error 500
    if (err) {
      console.error('error en consulta gatos:', err);
      return res.status(500).json({ error: 'error al obtener los gatos' });
    }

    //regresar los gatos como json al frontend
    res.json(resultados);
  });
});

//iniciar el servidor en el puerto definido y mostrar la direccion en consola
app.listen(PORT, function () {
  console.log('servidor neko nook corriendo en http://localhost:' + PORT);
  console.log('endpoints disponibles:');
  console.log('  http://localhost:' + PORT + '/api/menu/lunes');
  console.log('  http://localhost:' + PORT + '/api/gatos');
});