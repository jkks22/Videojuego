CREATE DATABASE IF NOT EXISTS nekonook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nekonook;

-- gatos
CREATE TABLE IF NOT EXISTS gatos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  edad VARCHAR(20) NOT NULL,
  raza VARCHAR(50) NOT NULL,
  caracter TEXT NOT NULL,
  imagen VARCHAR(100) NOT NULL
);

-- menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dia ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  precio VARCHAR(10) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  img_url VARCHAR(255) NOT NULL
);

-- datos de gatos
INSERT INTO gatos (nombre, emoji, edad, raza, caracter, imagen) VALUES
('Matcha','🍵','2 años','Maine Coon','Muy cariñosa y curiosa. Le encanta seguirte por todo el café','imagenes/Matcha.jpg'),
('Kumo','☁️','4 años','Ragdoll','Tranquilo y zen. Se pasa horas mirando por la ventana','imagenes/Kumo.jpg'),
('Mochi','🍡','1 año','Scottish Fold','La bebé del café. Traviesa y muy energética','imagenes/Mochi.jpg'),
('Soba','🍜','6 años','Siamés','El más sabio. Selectivo pero muy leal con quien le gana la confianza','imagenes/Soba.jpg'),
('Yuki','❄️','3 años','Angora Turco','Elegante e independiente. Sabe que es la más guapa del café','imagenes/Yuki.jpg'),
('Tofu','🤍','5 años','Persa','Cara de enojado pero el más abrazable. Ronronea muy fuerte','imagenes/Tofu.jpg');

-- ─── DATOS: menú ─────────────────────────────
INSERT INTO menu_items (dia, categoria, nombre, descripcion, precio, emoji, img_url) VALUES
-- LUNES
('lunes','Bebida caliente','Latte de Matcha','Espresso con leche vaporizada y polvo de matcha japonés. Lleva un arte de gato.','$85','🍵','https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80'),
('lunes','Pastelería','Croissant de Almendra','Croissant hojaldrado relleno de crema de almendras. Horneado fresco cada mañana.','$65','🥐','https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80'),
('lunes','Bebida fría','Cold Brew de Lavanda','Café negro en frío con infusión de lavanda y miel de abeja.','$90','☕','https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80'),
('lunes','Snack','Tostada de Aguacate','Pan artesanal con aguacate, semillas de sésamo y limón.','$75','🥑','https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80'),
-- MARTES
('martes','Bebida caliente','Cappuccino Clásico','Espresso con leche vaporizada y espuma densa al estilo italiano.','$70','☕','https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=400&q=80'),
('martes','Desayuno','Bowl de Granola','Yogurt griego, granola casera, frutos rojos y miel de agave.','$80','🍓','https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80'),
('martes','Pastelería','Waffle Felino','Waffle en forma de gato con fresas, crema batida y maple.','$95','🧇','https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80'),
('martes','Bebida fría','Agua de Hibisco','Agua fresca de jamaica con pétalos de rosa y jengibre.','$55','🌺','https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'),
-- MIÉRCOLES
('miercoles','Bebida caliente','Café de Olla','Receta tradicional mexicana con canela, piloncillo y clavo.','$60','🫖','https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80'),
('miercoles','Lunch','Sándwich Kumo','Ciabatta con pesto de albahaca, mozzarella fresca y jitomate cherry.','$110','🥪','https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80'),
('miercoles','Pastelería','Cheesecake de Fresa','Base de galleta Graham y crema de queso con coulis de fresa fresca.','$85','🍰','https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80'),
('miercoles','Bebida fría','Smoothie Mochi','Plátano, mango, leche de coco y cúrcuma. Energía para toda la tarde.','$75','🥤','https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80'),
-- JUEVES
('jueves','Bebida caliente','London Fog','Earl grey con lavanda, leche de almendra vaporizada y vainilla.','$80','🫖','https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80'),
('jueves','Lunch','Quiche Lorraine','Masa quebrada con tocino, queso gruyere y cebolla caramelizada.','$100','🥧','https://images.unsplash.com/photo-1602106802975-7cfbd741f8b0?w=400&q=80'),
('jueves','Pastelería','Muffin de Arándano','Muffin esponjoso con arándanos frescos y streusel de canela.','$55','🫐','https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80'),
('jueves','Snack','Tabla de Quesos','Quesos artesanales con mermelada de higo, nueces y crackers.','$130','🧀','https://images.unsplash.com/photo-1505575967455-40e256f73376?w=400&q=80'),
-- VIERNES
('viernes','Bebida caliente','Mocha de Avellana','Espresso, chocolate oscuro belga y crema de avellana tostada.','$95','🍫','https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80'),
('viernes','Lunch','Pasta Pesto','Fusilli con pesto de albahaca, piñones y parmesano.','$120','🍝','https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80'),
('viernes','Pastelería','Brownie Neko','Brownie de chocolate amargo con nueces y ganache.','$75','🍫','https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80'),
('viernes','Bebida fría','Limonada de Maracuyá','Limón real, maracuyá, menta fresca y agua mineral.','$70','🍋','https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80'),
-- SÁBADO
('sabado','Especial fin de semana','Pancakes Gato 🐱','Torre de 3 pancakes en forma de carita de gato con maple y frutos rojos.','$115','🥞','https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80'),
('sabado','Bebida caliente','Flat White','Doble ristretto con leche de avena y arte latte hecho a mano.','$90','☕','https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80'),
('sabado','Pastelería','Éclair de Vainilla','Pasta choux rellena de crema de vainilla y glaseado espejo.','$85','🥖','https://images.unsplash.com/photo-1579697096985-41fe1430e5df?w=400&q=80'),
('sabado','Bebida fría','Frappé de Caramelo','Café, hielo, caramelo salado y crema batida artesanal.','$100','🧋','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'),
-- DOMINGO
('domingo','Brunch especial','Huevos Benedictinos','Huevos pochados sobre pan inglés, tocino y salsa holandesa.','$135','🍳','https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80'),
('domingo','Bebida caliente','Chai Latte','Mezcla de especias indias, té negro, leche y miel de azahar.','$85','🫖','https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=400&q=80'),
('domingo','Pastelería','Cinnamon Roll','Rollo de canela gigante bañado en queso crema y miel.','$90','🌀','https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&q=80'),
('domingo','Bebida fría','Mimosa sin Alcohol','Jugo de naranja premium con agua mineral con gas.','$60','🍊','https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80');
