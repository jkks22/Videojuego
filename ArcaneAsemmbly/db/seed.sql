# seed.sql
# ejecutar despues de schema.sql
# datos iniciales desde constants.js

USE arcane_assembly;

# pieza
# catalogo (15 piezas)
INSERT INTO PIEZA (pieza_id, nombre, tipo, rareza, descripcion, output_base, multiplicador, amplificacion, escudo_val, regen_val, reflejo_pct) VALUES
# generadores
('gen_e','Cristal de Energía','generator',0, 'Genera 2 unidades de energía base.',2.0,  NULL, NULL, NULL, NULL, NULL),
('gen_h','Núcleo Térmico','generator',1, 'Genera 3 unidades de calor arcano.',3.0,  NULL, NULL, NULL, NULL, NULL),
('gen_p','Emisor de Pulso','generator',2, 'Genera 4 unidades de pulso arcano.',4.0,  NULL, NULL, NULL, NULL, NULL),
('gen_v','Grieta del Vacío','generator',3, 'Genera 6 unidades de energía pura.',6.0,  NULL, NULL, NULL, NULL, NULL),

# transformadores
('tr_b','Cámara de Corte','transformer', 0, 'Convierte recursos vecinos x1.5 en daño.',NULL, 1.50, NULL, NULL, NULL, NULL),
('tr_f','Fragua Arcana','transformer', 1, 'Convierte recursos vecinos x2.0 en daño.',NULL, 2.00, NULL, NULL, NULL, NULL),
('tr_s','Condensador de Tormenta','transformer', 2, 'Convierte recursos vecinos x2.8.',NULL, 2.80, NULL, NULL, NULL, NULL),
('tr_v','Aniquilador','transformer', 3, 'Convierte recursos vecinos x3.5.',NULL, 3.50, NULL, NULL, NULL, NULL),

# catalizadores
('cat_r','Resonador','catalyst',0,'Amplifica vecinos +25%. Bonus si hay GEN+TRANS adyacentes.', NULL, NULL, 0.25, NULL, NULL, NULL),
('cat_p','Prisma Arcano', 'catalyst',2,'Amplifica vecinos +45%.',NULL, NULL, 0.45, NULL, NULL, NULL),
('cat_n','Nodo Nexo','catalyst',3,'Amplifica TODOS los vecinos +75%.',NULL, NULL, 0.75, NULL, NULL, NULL),

# anclas
('anc_s', 'Ancla de Escudo','anchor',0,'Genera 10 puntos de escudo cada ronda.',NULL,NULL,NULL,10,NULL,NULL),
('anc_r', 'Ancla de Regeneración','anchor',1,'Recupera 6 HP al ganar el combate.',NULL,NULL,NULL,NULL,6,NULL),
('anc_x', 'Ancla Reflectora','anchor',2,'Refleja el 25% del daño entrante.',NULL,NULL,NULL,NULL,NULL,0.25),
('anc_f', 'Ancla Fortaleza','anchor',3,'Genera 18 puntos de escudo.',NULL,NULL,NULL,18,NULL,NULL);

# enemigo
# catalogo base
INSERT INTO ENEMIGO (nombre, tipo_nodo, build, hp_base, flavor_text) VALUES
# combate normal
('Guardián Arcano',       'combat', 'mixed',   28, 'Sus redes de energía pulsan en sintonía.'),
('Autómata de Cobre',     'combat', 'tanky',   28, 'Cubierto de anclas, difícil de penetrar.'),
('Tejedor de Grietas',    'combat', 'aggro',   28, 'Ataca antes de que puedas reaccionar.'),
('Resonador Errante',     'combat', 'amplify', 28, 'Sus catalizadores multiplican cada golpe.'),

# elite
('Arquitecto del Vacío',  'elite',  'aggro',   57, 'Ha perfeccionado el arte de la destrucción.'),
('Forjador Maldito',      'elite',  'mixed',   57, 'Combina fuego y oscuridad en cada pieza.'),

# boss
('El Colapso',            'boss',   'boss',   115, 'El fin de todas las construcciones.'),
('Fractalis, el Primero', 'boss',   'boss',   140, 'La primera pieza colocada en el tablero arcano.'),
('Nodo Supremo',          'boss',   'boss',   165, 'Control absoluto del tablero.');

# jugador
# admin de prueba
INSERT INTO JUGADOR (nombre, email, password_hash, rol)
VALUES ('Admin', 'admin@arcane.local', '$2b$10$CambiarEsteHashConBcryptReal', 'admin');