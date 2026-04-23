//esperar a que el html termine de cargar antes de ejecutar cualquier codigo jquery
$(document).ready(function () {

  //direccion base del servidor donde estan los endpoints de la api
  var API = 'http://localhost:3000/api';

  //funcion que recibe un dia de la semana, hace una peticion get al servidor,
  //y reemplaza las tarjetas del menu con los platillos disponibles para ese dia
  function mostrarMenu(dia) {

    //seleccionar el div donde se van a poner las tarjetas del menu
    var contenedor = $('#tarjetas-menu');

    //mostrar un mensaje de cargando mientras llega la respuesta del servidor
    contenedor.fadeOut(150, function () {
      contenedor.html('<div class="col-12 text-center py-4"><p class="texto-gris">Cargando menú...</p></div>');
      contenedor.fadeIn(150);
    });

    //hacer la peticion get al servidor pidiendo el menu del dia recibido
    $.ajax({
      url: API + '/menu/' + dia,
      method: 'GET',

      //si el servidor responde bien, construir y mostrar las tarjetas
      success: function (items) {
        contenedor.fadeOut(200, function () {

          //limpiar el contenedor antes de poner las nuevas tarjetas
          contenedor.empty();

          //si no hay items para ese dia, mostrar un mensaje y salir
          if (items.length === 0) {
            contenedor.html('<div class="col-12 text-center"><p class="texto-gris">No hay menú disponible para este día.</p></div>');
            contenedor.fadeIn(200);
            return;
          }

          //recorrer cada item del menu y crear su tarjeta en html
          for (var i = 0; i < items.length; i++) {
            var item = items[i];

            //armar el html de la tarjeta con los datos que llegaron del servidor
            var html =
              '<div class="col-12 col-sm-6 col-md-3">' +
                '<div class="tarjeta-menu">' +
                  '<div class="contenedor-img-menu">' +
                    //el emoji se ve por defecto y la imagen aparece al hacer hover
                    '<span class="emoji-menu">' + item.emoji + '</span>' +
                    '<img src="' + item.img_url + '" alt="' + item.nombre + '" class="img-menu"/>' +
                  '</div>' +
                  '<div class="cuerpo-tarjeta">' +
                    '<div class="categoria-item">' + item.categoria + '</div>' +
                    '<div class="nombre-item">' + item.nombre + '</div>' +
                    '<p class="desc-item">' + item.descripcion + '</p>' +
                    '<span class="precio-item">' + item.precio + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>';

            //agregar la tarjeta al contenedor del menu
            contenedor.append(html);
          }

          //mostrar el contenedor con animacion despues de agregar todas las tarjetas
          contenedor.fadeIn(250);
        });
      },

      //si el servidor falla o no esta corriendo, mostrar mensaje de error
      error: function () {
        contenedor.fadeOut(150, function () {
          contenedor.html(
            '<div class="col-12 text-center py-3">' +
              '<p class="texto-gris">No se pudo conectar con el servidor.<br>Asegurate de que <strong>server.js</strong> este corriendo.</p>' +
            '</div>'
          );
          contenedor.fadeIn(150);
        });
      }
    });
  }

  //funcion que hace una peticion get al servidor para obtener todos los gatos registrados
  //y construye una tarjeta por cada uno con su nombre, imagen, edad, raza y caracter
  function cargarGatos() {

    //seleccionar el div donde se van a poner las tarjetas de los gatos
    var contenedor = $('#contenedor-gatos');

    //hacer la peticion get al servidor para obtener todos los gatos
    $.ajax({
      url: API + '/gatos',
      method: 'GET',

      //si el servidor responde bien, construir y mostrar las tarjetas de los gatos
      success: function (gatos) {

        //limpiar el mensaje de cargando antes de poner las tarjetas
        contenedor.empty();

        //recorrer cada gato y crear su tarjeta con la informacion que llego del servidor
        for (var i = 0; i < gatos.length; i++) {
          var g = gatos[i];

          //armar el html de la tarjeta con nombre, imagen, edad, raza y caracter
          var html =
            '<div class="col-12 col-sm-6 col-md-4">' +
              '<div class="tarjeta-gato">' +
                '<div class="gato-img-wrap">' +
                  //la imagen viene de la ruta guardada en la base de datos
                  '<img src="' + g.imagen + '" alt="' + g.nombre + '" class="img-gato"/>' +
                '</div>' +
                '<div class="info-gato">' +
                  '<h3>' + g.nombre + ' ' + g.emoji + '</h3>' +
                  '<p><strong>Edad:</strong> ' + g.edad + '</p>' +
                  '<p><strong>Raza:</strong> ' + g.raza + '</p>' +
                  '<p><strong>Caracter:</strong> ' + g.caracter + '</p>' +
                '</div>' +
              '</div>' +
            '</div>';

          //agregar la tarjeta del gato al contenedor
          contenedor.append(html);
        }
      },

      //si el servidor falla, mostrar un mensaje de error en la seccion de gatos
      error: function () {
        contenedor.html(
          '<div class="col-12 text-center py-3">' +
            '<p class="texto-gris">No se pudo cargar la informacion de los gatos.<br>Asegurate de que <strong>server.js</strong> este corriendo.</p>' +
          '</div>'
        );
      }
    });
  }

  //arreglo con los nombres de los dias en el mismo orden que los devuelve javascript (0=domingo)
  var diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

  //obtener el numero del dia de hoy (0 al 6) y convertirlo al nombre del dia
  var hoy = new Date().getDay();
  var diaHoy = diasSemana[hoy];

  //marcar el boton del dia de hoy como activo al cargar la pagina
  $('.btn-dia[data-dia="' + diaHoy + '"]').addClass('activo');

  //mostrar el menu del dia de hoy automaticamente al cargar la pagina
  mostrarMenu(diaHoy);

  //detectar cuando el usuario hace click en un boton de dia y cambiar el menu
  $('.btn-dia').on('click', function () {

    //quitar la clase activo de todos los botones
    $('.btn-dia').removeClass('activo');

    //poner la clase activo solo en el boton que se hizo click
    $(this).addClass('activo');

    //obtener el dia del atributo data-dia del boton y mostrar ese menu
    mostrarMenu($(this).data('dia'));
  });

  //hacer que los links del navbar hagan scroll suave hacia la seccion correspondiente
  $('a[href^="#"]').on('click', function (e) {

    //obtener la seccion a la que apunta el link
    var destino = $($(this).attr('href'));

    if (destino.length) {
      //cancelar el comportamiento normal del link (salto instantaneo)
      e.preventDefault();

      //animar el scroll hasta la seccion, dejando 65px de espacio por el navbar fijo
      $('html, body').animate({ scrollTop: destino.offset().top - 65 }, 500);
    }
  });

  //llamar a la funcion para cargar los gatos cuando se carga la pagina
  cargarGatos();

});
