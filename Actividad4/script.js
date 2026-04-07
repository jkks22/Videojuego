$(document).ready(function () {

  var menuPorDia = {
    lunes: [
      {
        categoria: "Bebida caliente",
        nombre: "Latte de Matcha",
        descripcion: "Espresso con leche vaporizada y polvo de matcha japonés. Lleva un arte de gato.",
        precio: "$85",
        emoji: "🍵",
        img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80"
      },
      {
        categoria: "Pastelería",
        nombre: "Croissant de Almendra",
        descripcion: "Croissant hojaldrado relleno de crema de almendras. Horneado fresco cada mañana.",
        precio: "$65",
        emoji: "🥐",
        img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80"
      },
      {
        categoria: "Bebida fría",
        nombre: "Cold Brew de Lavanda",
        descripcion: "Café negro en frío con infusión de lavanda y miel de abeja.",
        precio: "$90",
        emoji: "☕",
        img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80"
      },
      {
        categoria: "Snack",
        nombre: "Tostada de Aguacate",
        descripcion: "Pan artesanal con aguacate, semillas de sésamo y limón.",
        precio: "$75",
        emoji: "🥑",
        img: "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80"
      }
    ],
    martes: [
      {
        categoria: "Bebida caliente",
        nombre: "Cappuccino Clásico",
        descripcion: "Espresso con leche vaporizada y espuma densa al estilo italiano.",
        precio: "$70",
        emoji: "☕",
        img: "https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=400&q=80"
      },
      {
        categoria: "Desayuno",
        nombre: "Bowl de Granola",
        descripcion: "Yogurt griego, granola casera, frutos rojos y miel de agave.",
        precio: "$80",
        emoji: "🍓",
        img: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80"
      },
      {
        categoria: "Pastelería",
        nombre: "Waffle Felino",
        descripcion: "Waffle en forma de gato con fresas, crema batida y maple.",
        precio: "$95",
        emoji: "🧇",
        img: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80"
      },
      {
        categoria: "Bebida fría",
        nombre: "Agua de Hibisco",
        descripcion: "Agua fresca de jamaica con pétalos de rosa y jengibre.",
        precio: "$55",
        emoji: "🌺",
        img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80"
      }
    ],
    miercoles: [
      {
        categoria: "Bebida caliente",
        nombre: "Café de Olla",
        descripcion: "Receta tradicional mexicana con canela, piloncillo y clavo.",
        precio: "$60",
        emoji: "🫖",
        img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80"
      },
      {
        categoria: "Lunch",
        nombre: "Sándwich Kumo",
        descripcion: "Ciabatta con pesto de albahaca, mozzarella fresca y jitomate cherry.",
        precio: "$110",
        emoji: "🥪",
        img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80"
      },
      {
        categoria: "Pastelería",
        nombre: "Cheesecake de Fresa",
        descripcion: "Base de galleta Graham y crema de queso con coulis de fresa fresca.",
        precio: "$85",
        emoji: "🍰",
        img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80"
      },
      {
        categoria: "Bebida fría",
        nombre: "Smoothie Mochi",
        descripcion: "Plátano, mango, leche de coco y cúrcuma. Energía para toda la tarde.",
        precio: "$75",
        emoji: "🥤",
        img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80"
      }
    ],
    jueves: [
      {
        categoria: "Bebida caliente",
        nombre: "London Fog",
        descripcion: "Earl grey con lavanda, leche de almendra vaporizada y vainilla.",
        precio: "$80",
        emoji: "🫖",
        img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80"
      },
      {
        categoria: "Lunch",
        nombre: "Quiche Lorraine",
        descripcion: "Masa quebrada con tocino, queso gruyere y cebolla caramelizada.",
        precio: "$100",
        emoji: "🥧",
        img: "https://images.unsplash.com/photo-1602106802975-7cfbd741f8b0?w=400&q=80"
      },
      {
        categoria: "Pastelería",
        nombre: "Muffin de Arándano",
        descripcion: "Muffin esponjoso con arándanos frescos y streusel de canela.",
        precio: "$55",
        emoji: "🫐",
        img: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80"
      },
      {
        categoria: "Snack",
        nombre: "Tabla de Quesos",
        descripcion: "Quesos artesanales con mermelada de higo, nueces y crackers.",
        precio: "$130",
        emoji: "🧀",
        img: "https://images.unsplash.com/photo-1505575967455-40e256f73376?w=400&q=80"
      }
    ],
    viernes: [
      {
        categoria: "Bebida caliente",
        nombre: "Mocha de Avellana",
        descripcion: "Espresso, chocolate oscuro belga y crema de avellana tostada.",
        precio: "$95",
        emoji: "🍫",
        img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"
      },
      {
        categoria: "Lunch",
        nombre: "Pasta Pesto",
        descripcion: "Fusilli con pesto de albahaca, piñones y parmesano.",
        precio: "$120",
        emoji: "🍝",
        img: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80"
      },
      {
        categoria: "Pastelería",
        nombre: "Brownie Neko",
        descripcion: "Brownie de chocolate amargo con nueces y ganache.",
        precio: "$75",
        emoji: "🍫",
        img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80"
      },
      {
        categoria: "Bebida fría",
        nombre: "Limonada de Maracuyá",
        descripcion: "Limón real, maracuyá, menta fresca y agua mineral.",
        precio: "$70",
        emoji: "🍋",
        img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80"
      }
    ],
    sabado: [
      {
        categoria: "Especial de fin de semana",
        nombre: "Pancakes Gato 🐱",
        descripcion: "Torre de 3 pancakes en forma de carita de gato con maple y frutos rojos.",
        precio: "$115",
        emoji: "🥞",
        img: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80"
      },
      {
        categoria: "Bebida caliente",
        nombre: "Flat White",
        descripcion: "Doble ristretto con leche de avena y arte latte hecho a mano.",
        precio: "$90",
        emoji: "☕",
        img: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80"
      },
      {
        categoria: "Pastelería",
        nombre: "Éclair de Vainilla",
        descripcion: "Pasta choux rellena de crema de vainilla y glaseado espejo.",
        precio: "$85",
        emoji: "🥖",
        img: "https://images.unsplash.com/photo-1579697096985-41fe1430e5df?w=400&q=80"
      },
      {
        categoria: "Bebida fría",
        nombre: "Frappé de Caramelo",
        descripcion: "Café, hielo, caramelo salado y crema batida artesanal.",
        precio: "$100",
        emoji: "🧋",
        img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"
      }
    ],
    domingo: [
      {
        categoria: "Brunch especial",
        nombre: "Huevos Benedictinos",
        descripcion: "Huevos pochados sobre pan inglés, tocino y salsa holandesa.",
        precio: "$135",
        emoji: "🍳",
        img: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80"
      },
      {
        categoria: "Bebida caliente",
        nombre: "Chai Latte",
        descripcion: "Mezcla de especias indias, té negro, leche y miel de azahar.",
        precio: "$85",
        emoji: "🫖",
        img: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=400&q=80"
      },
      {
        categoria: "Pastelería",
        nombre: "Cinnamon Roll",
        descripcion: "Rollo de canela gigante bañado en queso crema y miel.",
        precio: "$90",
        emoji: "🌀",
        img: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&q=80"
      },
      {
        categoria: "Bebida fría",
        nombre: "Mimosa sin Alcohol",
        descripcion: "Jugo de naranja premium con agua mineral con gas.",
        precio: "$60",
        emoji: "🍊",
        img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80"
      }
    ]
  };


  function mostrarMenu(dia) {
    var items = menuPorDia[dia];
    var contenedor = $('#tarjetas-menu');

    contenedor.fadeOut(200, function () {
      contenedor.empty();

      for (var i = 0; i < items.length; i++) {
        var item = items[i];

        var html = '<div class="col-12 col-sm-6 col-md-3">' +
          '<div class="tarjeta-menu">' +
            '<div class="contenedor-img-menu">' +
              '<span class="emoji-menu">' + item.emoji + '</span>' +
              '<img src="' + item.img + '" alt="' + item.nombre + '" class="img-menu"/>' +
            '</div>' +
            '<div class="cuerpo-tarjeta">' +
              '<div class="categoria-item">' + item.categoria + '</div>' +
              '<div class="nombre-item">' + item.nombre + '</div>' +
              '<p class="desc-item">' + item.descripcion + '</p>' +
              '<span class="precio-item">' + item.precio + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';

        contenedor.append(html);
      }

      contenedor.fadeIn(250);
    });
  }

  var diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  var hoy = new Date().getDay();
  var diaHoy = diasSemana[hoy];

  //activar botón del día actual
  $('.btn-dia[data-dia="' + diaHoy + '"]').addClass('activo');
  mostrarMenu(diaHoy);

  $('.btn-dia').on('click', function () {
    $('.btn-dia').removeClass('activo');
    $(this).addClass('activo');
    var diaSeleccionado = $(this).data('dia');
    mostrarMenu(diaSeleccionado);
  });

  $('a[href^="#"]').on('click', function (e) {
    var destino = $($(this).attr('href'));
    if (destino.length) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: destino.offset().top - 65
      }, 500);
    }
  });

});