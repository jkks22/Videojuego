# Arcane Assembly — schema.sql (VERSIÓN 2)
# Equipo 4 · TC2005B

DROP DATABASE IF EXISTS arcane_assembly;
CREATE DATABASE arcane_assembly
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE arcane_assembly;

# TABLA: JUGADOR
# PK: jugador_id (surrogate AUTO_INCREMENT)
# Atributos: email UNIQUE, password_hash (bcrypt), rol (enum), contadores desnormalizados total_runs y tiempo_total_seg.
# Forma Normal: 3FN — todos los atributos dependen solo de jugador_id.
CREATE TABLE JUGADOR (
  jugador_id       INT           NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(60)   NOT NULL,
  email            VARCHAR(120)  NULL,
  password_hash    VARCHAR(255)  NULL,
  rol              ENUM('jugador','admin') NOT NULL DEFAULT 'jugador',
  fecha_registro   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso    DATETIME      NULL,
  total_runs       INT           NOT NULL DEFAULT 0,
  tiempo_total_seg INT           NOT NULL DEFAULT 0,
  activo           TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (jugador_id),
  UNIQUE KEY uq_jugador_email (email)
) ENGINE=InnoDB;

# TABLA: PIEZA  (catálogo fijo de 15 piezas)
# PK: pieza_id (VARCHAR semántico, ej. 'gen_e', 'tr_b') para mantener consistencia con los IDs usados en constants.js del frontend.
# Los atributos output_base, multiplicador, amplificacion, escudo_val, regen_val, reflejo_pct son NULL según el tipo de pieza — esto evita crear una tabla de atributos polimórficos (EAV) que complicaría las consultas. Está justificado porque el catálogo es estático.
CREATE TABLE PIEZA (
  pieza_id         VARCHAR(20)   NOT NULL,
  nombre           VARCHAR(60)   NOT NULL,
  tipo             ENUM('generator','transformer','catalyst','anchor') NOT NULL,
  rareza           INT           NOT NULL DEFAULT 0,
  descripcion      TEXT          NOT NULL,
  output_base      DECIMAL(4,1)  NULL,
  multiplicador    DECIMAL(4,2)  NULL,
  amplificacion    DECIMAL(4,2)  NULL,
  escudo_val       INT           NULL,
  regen_val        INT           NULL,
  reflejo_pct      DECIMAL(4,2)  NULL,
  PRIMARY KEY (pieza_id),
  CONSTRAINT chk_rareza   CHECK (rareza BETWEEN 0 AND 4),
  CONSTRAINT chk_reflejo  CHECK (reflejo_pct IS NULL OR reflejo_pct BETWEEN 0.00 AND 1.00)
) ENGINE=InnoDB;

# TABLA: ENEMIGO (catálogo base de enemigos del juego)
# PK: enemigo_id (surrogate)
# tipo_nodo determina en qué nodos aparece (combate/élite/boss).
# build define la estrategia del tablero prearmado del enemigo.
CREATE TABLE ENEMIGO (
  enemigo_id       INT           NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(60)   NOT NULL,
  tipo_nodo        ENUM('combat','elite','boss') NOT NULL,
  build            ENUM('aggro','tanky','amplify','mixed','boss') NOT NULL,
  hp_base          INT           NOT NULL,
  flavor_text      TEXT          NULL,
  PRIMARY KEY (enemigo_id),
  CONSTRAINT chk_hp_base CHECK (hp_base > 0)
) ENGINE=InnoDB;

# TABLA: RUN (partida individual del jugador, N:1 con JUGADOR)
# PK: run_id (surrogate)
# FK: jugador_id → JUGADOR (ON DELETE RESTRICT: no borrar jugador con runs registradas, conservar historial)
# resultado usa ENUM en lugar de booleano porque hay 3 estados
# posibles: victoria, derrota, en_progreso.
CREATE TABLE RUN (
  run_id           INT           NOT NULL AUTO_INCREMENT,
  jugador_id       INT           NOT NULL,
  fecha_inicio     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_fin        DATETIME      NULL,
  zona_actual      INT           NOT NULL DEFAULT 1,
  hp_actual        INT           NOT NULL DEFAULT 100,
  impulso          INT           NOT NULL DEFAULT 3,
  usos_tienda      INT           NOT NULL DEFAULT 0,
  usos_evento      INT           NOT NULL DEFAULT 0,
  resultado        ENUM('victoria','derrota','en_progreso') NOT NULL DEFAULT 'en_progreso',
  PRIMARY KEY (run_id),
  CONSTRAINT fk_run_jugador FOREIGN KEY (jugador_id)
    REFERENCES JUGADOR(jugador_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_zona_run     CHECK (zona_actual BETWEEN 1 AND 3),
  CONSTRAINT chk_hp_run       CHECK (hp_actual >= 0 AND hp_actual <= 100),
  CONSTRAINT chk_impulso_run  CHECK (impulso BETWEEN 0 AND 3),
  CONSTRAINT chk_usos_tienda  CHECK (usos_tienda BETWEEN 0 AND 2),
  CONSTRAINT chk_usos_evento  CHECK (usos_evento BETWEEN 0 AND 3)
) ENGINE=InnoDB;

# TABLA: NODO (casillas del mapa generado en cada run)
# PK: nodo_id (surrogate)
# FK: run_id → RUN (CASCADE: al eliminar una run, eliminar sus nodos)
# FK: enemigo_id → ENEMIGO (SET NULL: eliminar enemigo mantiene nodos)
CREATE TABLE NODO (
  nodo_id          INT           NOT NULL AUTO_INCREMENT,
  run_id           INT           NOT NULL,
  tipo             ENUM('start','combat','elite','boss','shop','event') NOT NULL,
  zona             INT           NOT NULL,
  fila_mapa        INT           NOT NULL,
  col_mapa         INT           NOT NULL,
  completado       BOOLEAN       NOT NULL DEFAULT FALSE,
  accesible        BOOLEAN       NOT NULL DEFAULT FALSE,
  enemigo_id       INT           NULL,
  PRIMARY KEY (nodo_id),
  CONSTRAINT fk_nodo_run FOREIGN KEY (run_id)
    REFERENCES RUN(run_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_nodo_enemigo FOREIGN KEY (enemigo_id)
    REFERENCES ENEMIGO(enemigo_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_zona_nodo CHECK (zona BETWEEN 1 AND 3)
) ENGINE=InnoDB;

# TABLA: COMBATE (encuentro contra un enemigo, relación 1:1 con NODO)
# PK: combate_id (surrogate)
# FK: nodo_id → NODO (UNIQUE obliga la relación 1:1)
# danio_total_infligido es un contador desnormalizado justificado como cache (evita SUM() sobre COLOCACION_TABLERO en el panel admin).
CREATE TABLE COMBATE (
  combate_id            INT      NOT NULL AUTO_INCREMENT,
  nodo_id               INT      NOT NULL,
  ronda_actual          INT      NOT NULL DEFAULT 1,
  hp_enemigo            INT      NOT NULL,
  sinergias_activadas   INT      NOT NULL DEFAULT 0,
  resultado             ENUM('victoria','derrota') NULL,
  danio_total_infligido INT      NOT NULL DEFAULT 0,
  PRIMARY KEY (combate_id),
  UNIQUE KEY uq_combate_nodo (nodo_id),
  CONSTRAINT fk_combate_nodo FOREIGN KEY (nodo_id)
    REFERENCES NODO(nodo_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_ronda_actual CHECK (ronda_actual >= 1)
) ENGINE=InnoDB;

# TABLA: COLOCACION_TABLERO (piezas puestas en el tablero hex)
# PK: colocacion_id (surrogate)
# UNIQUE compuesto: impide dos piezas en la misma celda/ronda/propietario.
# propietario distingue tablero del jugador del tablero del enemigo, crítico para consultas de estadísticas (solo piezas del jugador).
CREATE TABLE COLOCACION_TABLERO (
  colocacion_id    INT           NOT NULL AUTO_INCREMENT,
  combate_id       INT           NOT NULL,
  pieza_id         VARCHAR(20)   NOT NULL,
  col_hex          INT           NOT NULL,
  fila_hex         INT           NOT NULL,
  propietario      ENUM('jugador','enemigo') NOT NULL,
  ronda            INT           NOT NULL,
  PRIMARY KEY (colocacion_id),
  UNIQUE KEY uq_celda_ronda (combate_id, col_hex, fila_hex, propietario, ronda),
  CONSTRAINT fk_col_combate FOREIGN KEY (combate_id)
    REFERENCES COMBATE(combate_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_col_pieza FOREIGN KEY (pieza_id)
    REFERENCES PIEZA(pieza_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_col_hex   CHECK (col_hex BETWEEN 0 AND 4),
  CONSTRAINT chk_fila_hex  CHECK (fila_hex BETWEEN 0 AND 4),
  CONSTRAINT chk_ronda_col CHECK (ronda >= 1)
) ENGINE=InnoDB;

# TABLA: INVENTARIO_RUN (piezas poseídas dentro de una run específica)
# PK compuesta: (run_id, pieza_id, origen) porque una misma pieza puede aparecer en el inventario desde distintas fuentes (draft, shop) y cada origen es una entrada separada. cantidad acumula duplicados del mismo origen.
CREATE TABLE INVENTARIO_RUN (
  run_id              INT          NOT NULL,
  pieza_id            VARCHAR(20)  NOT NULL,
  cantidad            INT          NOT NULL DEFAULT 1,
  origen              ENUM('inicial','draft','evento','tienda') NOT NULL,
  nodo_adquirido_id   INT          NULL,
  fecha_adquisicion   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (run_id, pieza_id, origen),
  CONSTRAINT fk_inv_run FOREIGN KEY (run_id)
    REFERENCES RUN(run_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inv_pieza FOREIGN KEY (pieza_id)
    REFERENCES PIEZA(pieza_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inv_nodo FOREIGN KEY (nodo_adquirido_id)
    REFERENCES NODO(nodo_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_cantidad CHECK (cantidad >= 1)
) ENGINE=InnoDB;

# TABLA: EVENTO_NODO (eventos aleatorios en nodos tipo 'event')
# PK: evento_id (surrogate)
# FK: nodo_id → NODO (CASCADE)
# Separada de NODO para evitar NULLs: solo los nodos tipo 'event' generan un evento. Mantener 3FN sin atributos vacíos en NODO.
CREATE TABLE EVENTO_NODO (
  evento_id        INT           NOT NULL AUTO_INCREMENT,
  nodo_id          INT           NOT NULL,
  titulo           VARCHAR(60)   NOT NULL,
  tipo_efecto      ENUM('draft','heal','damage','impulse','skip') NOT NULL,
  valor_efecto     INT           NULL,
  eleccion_jugador VARCHAR(60)   NULL,
  fecha_resuelto   DATETIME      NULL,
  PRIMARY KEY (evento_id),
  CONSTRAINT fk_evento_nodo FOREIGN KEY (nodo_id)
    REFERENCES NODO(nodo_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

# TABLA: META_JUGADOR_COLECCION (meta-progresion entre runs)
# PK compuesta: (jugador_id, pieza_id) — un jugador descubre cada pieza una sola vez en su historia
# Atributos: fecha_descubierta para saber cuando consiguio la pieza por primera vez
# Forma Normal: 3FN — fecha_descubierta depende solo de la PK compuesta
# Esta tabla habilita la meta-progresion: las piezas descubiertas en runs pasadas
# se quedan disponibles en futuras runs del mismo jugador, dando sensacion de progreso permanente
CREATE TABLE META_JUGADOR_COLECCION (
  jugador_id        INT           NOT NULL,
  pieza_id          VARCHAR(20)   NOT NULL,
  fecha_descubierta DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (jugador_id, pieza_id),
  CONSTRAINT fk_meta_jugador FOREIGN KEY (jugador_id)
    REFERENCES JUGADOR(jugador_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_meta_pieza FOREIGN KEY (pieza_id)
    REFERENCES PIEZA(pieza_id) ON UPDATE CASCADE
) ENGINE=InnoDB;

# VISTAS (12)

# Vista 1: ranking global de jugadores por victorias
CREATE OR REPLACE VIEW v_ranking_jugadores AS
SELECT
  j.jugador_id,
  j.nombre,
  j.total_runs,
  COUNT(CASE WHEN r.resultado='victoria' THEN 1 END) AS victorias,
  COUNT(CASE WHEN r.resultado='derrota'  THEN 1 END) AS derrotas,
  ROUND(
    COUNT(CASE WHEN r.resultado='victoria' THEN 1 END) * 100.0 /
    NULLIF(COUNT(CASE WHEN r.resultado IN ('victoria','derrota') THEN 1 END), 0),
    1
  ) AS tasa_victoria_pct,
  j.tiempo_total_seg
FROM JUGADOR j
LEFT JOIN RUN r ON r.jugador_id = j.jugador_id
WHERE j.rol = 'jugador' AND j.activo = 1
GROUP BY j.jugador_id, j.nombre, j.total_runs, j.tiempo_total_seg
ORDER BY victorias DESC, tasa_victoria_pct DESC;

# Vista 2: historial detallado de runs por jugador
CREATE OR REPLACE VIEW v_historial_runs AS
SELECT
  r.run_id,
  r.jugador_id,
  j.nombre AS jugador_nombre,
  r.fecha_inicio,
  r.fecha_fin,
  TIMESTAMPDIFF(SECOND, r.fecha_inicio, r.fecha_fin) AS duracion_seg,
  r.zona_actual,
  r.hp_actual,
  r.resultado
FROM RUN r
JOIN JUGADOR j ON j.jugador_id = r.jugador_id
ORDER BY r.fecha_inicio DESC;

# Vista 3: piezas más usadas globalmente
CREATE OR REPLACE VIEW v_piezas_mas_usadas AS
SELECT
  p.pieza_id,
  p.nombre,
  p.tipo,
  p.rareza,
  COUNT(ct.colocacion_id) AS total_usos,
  COUNT(DISTINCT c.combate_id) AS combates_usada
FROM PIEZA p
LEFT JOIN COLOCACION_TABLERO ct ON ct.pieza_id = p.pieza_id AND ct.propietario = 'jugador'
LEFT JOIN COMBATE c ON c.combate_id = ct.combate_id
GROUP BY p.pieza_id, p.nombre, p.tipo, p.rareza
ORDER BY total_usos DESC;

# Vista 4: tasa de victorias por zona
CREATE OR REPLACE VIEW v_tasa_victoria_zona AS
SELECT
  r.zona_actual AS zona,
  COUNT(*) AS total_runs,
  COUNT(CASE WHEN r.resultado='victoria' THEN 1 END) AS victorias,
  ROUND(
    COUNT(CASE WHEN r.resultado='victoria' THEN 1 END) * 100.0 /
    NULLIF(COUNT(*), 0),
    1
  ) AS tasa_victoria_pct
FROM RUN r
WHERE r.resultado IN ('victoria','derrota')
GROUP BY r.zona_actual
ORDER BY r.zona_actual;

# Vista 5: inventario actual de cada run en progreso
CREATE OR REPLACE VIEW v_inventario_activo AS
SELECT
  ir.run_id,
  r.jugador_id,
  j.nombre AS jugador_nombre,
  p.nombre AS pieza_nombre,
  p.tipo,
  SUM(ir.cantidad) AS total_cantidad,
  GROUP_CONCAT(DISTINCT ir.origen) AS origenes
FROM INVENTARIO_RUN ir
JOIN RUN r     ON r.run_id     = ir.run_id
JOIN JUGADOR j ON j.jugador_id = r.jugador_id
JOIN PIEZA p   ON p.pieza_id   = ir.pieza_id
WHERE r.resultado = 'en_progreso'
GROUP BY ir.run_id, r.jugador_id, j.nombre, p.nombre, p.tipo
ORDER BY ir.run_id, p.tipo;

# Vista 6: enemigos más difíciles (mayor tasa de derrota del jugador)
CREATE OR REPLACE VIEW v_enemigos_dificultad AS
SELECT
  e.enemigo_id,
  e.nombre,
  e.tipo_nodo,
  e.build,
  COUNT(c.combate_id) AS total_encuentros,
  COUNT(CASE WHEN c.resultado='derrota' THEN 1 END) AS derrotas_jugador,
  ROUND(
    COUNT(CASE WHEN c.resultado='derrota' THEN 1 END) * 100.0 /
    NULLIF(COUNT(c.combate_id), 0),
    1
  ) AS tasa_derrota_pct
FROM ENEMIGO e
LEFT JOIN NODO n    ON n.enemigo_id = e.enemigo_id
LEFT JOIN COMBATE c ON c.nodo_id    = n.nodo_id
GROUP BY e.enemigo_id, e.nombre, e.tipo_nodo, e.build
ORDER BY tasa_derrota_pct DESC;

# Vista 7: combates con más sinergias activadas
CREATE OR REPLACE VIEW v_top_combates_sinergia AS
SELECT
  c.combate_id,
  r.jugador_id,
  j.nombre AS jugador,
  e.nombre AS enemigo,
  c.sinergias_activadas,
  c.danio_total_infligido,
  c.ronda_actual,
  c.resultado
FROM COMBATE c
JOIN NODO n     ON n.nodo_id     = c.nodo_id
JOIN RUN r      ON r.run_id      = n.run_id
JOIN JUGADOR j  ON j.jugador_id  = r.jugador_id
LEFT JOIN ENEMIGO e ON e.enemigo_id = n.enemigo_id
ORDER BY c.sinergias_activadas DESC, c.danio_total_infligido DESC
LIMIT 20;

# Vista 8: distribución de tipos de nodo por run (balance del mapa)
CREATE OR REPLACE VIEW v_distribucion_nodos AS
SELECT
  n.zona,
  n.tipo,
  COUNT(*) AS total,
  COUNT(CASE WHEN n.completado = TRUE THEN 1 END) AS completados
FROM NODO n
GROUP BY n.zona, n.tipo
ORDER BY n.zona, n.tipo;

# Vista 9: eventos más elegidos por los jugadores
CREATE OR REPLACE VIEW v_eventos_populares AS
SELECT
  ev.titulo,
  ev.tipo_efecto,
  ev.eleccion_jugador,
  COUNT(*) AS veces_elegido,
  AVG(ev.valor_efecto) AS valor_promedio
FROM EVENTO_NODO ev
WHERE ev.eleccion_jugador IS NOT NULL
GROUP BY ev.titulo, ev.tipo_efecto, ev.eleccion_jugador
ORDER BY veces_elegido DESC;

# Vista 10: catálogo completo de piezas con estadísticas de uso
CREATE OR REPLACE VIEW v_catalogo_piezas AS
SELECT
  p.pieza_id,
  p.nombre,
  p.tipo,
  CASE p.rareza
    WHEN 0 THEN 'común'
    WHEN 1 THEN 'poco común'
    WHEN 2 THEN 'rara'
    WHEN 3 THEN 'épica'
    WHEN 4 THEN 'legendaria'
  END AS rareza_nombre,
  COALESCE(p.output_base, p.multiplicador, p.amplificacion,
           p.escudo_val, p.regen_val, p.reflejo_pct) AS stat_principal,
  p.descripcion,
  (SELECT COUNT(*) FROM COLOCACION_TABLERO
   WHERE pieza_id = p.pieza_id AND propietario='jugador') AS usos_totales
FROM PIEZA p
ORDER BY p.tipo, p.rareza;

# Vista 11: panel admin — resumen general del sistema
CREATE OR REPLACE VIEW v_admin_resumen AS
SELECT
  (SELECT COUNT(*) FROM JUGADOR WHERE rol='jugador' AND activo=1) AS jugadores_activos,
  (SELECT COUNT(*) FROM JUGADOR WHERE rol='jugador')              AS jugadores_totales,
  (SELECT COUNT(*) FROM RUN)                                      AS runs_totales,
  (SELECT COUNT(*) FROM RUN WHERE resultado='en_progreso')        AS runs_en_progreso,
  (SELECT COUNT(*) FROM RUN WHERE resultado='victoria')           AS victorias_totales,
  (SELECT COUNT(*) FROM COMBATE)                                  AS combates_totales,
  (SELECT COUNT(*) FROM COLOCACION_TABLERO WHERE propietario='jugador') AS colocaciones_jugador,
  (SELECT ROUND(AVG(sinergias_activadas), 2) FROM COMBATE)        AS promedio_sinergias_por_combate;

# Vista 12: jugadores con última actividad reciente (filtro activo/inactivo)
CREATE OR REPLACE VIEW v_jugadores_actividad AS
SELECT
  j.jugador_id,
  j.nombre,
  j.email,
  j.fecha_registro,
  j.ultimo_acceso,
  (SELECT MAX(fecha_inicio) FROM RUN WHERE jugador_id = j.jugador_id) AS ultima_run,
  (SELECT MAX(zona_actual)  FROM RUN WHERE jugador_id = j.jugador_id) AS zona_maxima,
  CASE
    WHEN (SELECT MAX(fecha_inicio) FROM RUN WHERE jugador_id = j.jugador_id)
         >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'activo'
    ELSE 'inactivo'
  END AS estado_actividad
FROM JUGADOR j
WHERE j.rol = 'jugador'
ORDER BY ultima_run DESC;

# Vista 13: coleccion permanente de piezas por jugador con porcentaje de completado
# Calcula cuantas piezas distintas ha descubierto cada jugador a lo largo de todas sus runs
# y compara contra el total del catalogo para mostrar progreso de meta-progresion
CREATE OR REPLACE VIEW v_coleccion_jugador AS
SELECT
  j.jugador_id,
  j.nombre,
  COUNT(mjc.pieza_id) AS piezas_descubiertas,
  (SELECT COUNT(*) FROM PIEZA) AS piezas_totales,
  ROUND(COUNT(mjc.pieza_id) / (SELECT COUNT(*) FROM PIEZA) * 100, 1) AS pct_completado
FROM JUGADOR j
LEFT JOIN META_JUGADOR_COLECCION mjc ON j.jugador_id = mjc.jugador_id
WHERE j.rol = 'jugador'
GROUP BY j.jugador_id, j.nombre;

# Vista 14: estadisticas globales del sistema para el panel de admin
# Reune todas las metricas que el panel administrativo muestra en una sola query
# Incluye totales, tasas de victoria, tiempo total y promedios
CREATE OR REPLACE VIEW v_estadisticas_globales AS
SELECT
  (SELECT COUNT(*) FROM JUGADOR WHERE rol='jugador')                  AS total_jugadores,
  (SELECT COUNT(*) FROM JUGADOR WHERE rol='jugador' AND activo=1)     AS jugadores_activos,
  (SELECT COUNT(*) FROM RUN)                                          AS total_runs,
  (SELECT COUNT(*) FROM RUN WHERE resultado='victoria')               AS total_victorias,
  (SELECT COUNT(*) FROM RUN WHERE resultado='derrota')                AS total_derrotas,
  (SELECT COUNT(*) FROM RUN WHERE resultado='en_progreso')            AS runs_en_progreso,
  (SELECT ROUND(SUM(tiempo_total_seg) / 3600, 1) FROM JUGADOR)        AS horas_totales_jugadas,
  (SELECT COUNT(*) FROM COMBATE)                                      AS combates_totales,
  (SELECT ROUND(AVG(sinergias_activadas), 2) FROM COMBATE)            AS promedio_sinergias_combate,
  (SELECT ROUND(AVG(danio_total_infligido), 0) FROM COMBATE
   WHERE resultado='victoria')                                         AS danio_promedio_victoria,
  ROUND(
    (SELECT COUNT(*) FROM RUN WHERE resultado='victoria') * 100.0 /
    NULLIF((SELECT COUNT(*) FROM RUN WHERE resultado IN ('victoria','derrota')), 0)
  , 1) AS tasa_victoria_pct;

# TRIGGERS (4)

DELIMITER $$

# Trigger 1: incrementar total_runs del jugador al iniciar una nueva run
CREATE TRIGGER trg_incrementar_total_runs
AFTER INSERT ON RUN
FOR EACH ROW
BEGIN
  UPDATE JUGADOR
  SET total_runs = total_runs + 1
  WHERE jugador_id = NEW.jugador_id;
END$$

# Trigger 2: al cerrar una run (victoria/derrota), acumular el tiempo jugado
CREATE TRIGGER trg_acumular_tiempo_run
AFTER UPDATE ON RUN
FOR EACH ROW
BEGIN
  IF OLD.resultado = 'en_progreso'
     AND NEW.resultado IN ('victoria','derrota')
     AND NEW.fecha_fin IS NOT NULL THEN
    UPDATE JUGADOR
    SET tiempo_total_seg = tiempo_total_seg
        + TIMESTAMPDIFF(SECOND, NEW.fecha_inicio, NEW.fecha_fin)
    WHERE jugador_id = NEW.jugador_id;
  END IF;
END$$

# Trigger 3: al insertar colocación de jugador, sumar daño estimado al combate
CREATE TRIGGER trg_actualizar_danio_combate
AFTER INSERT ON COLOCACION_TABLERO
FOR EACH ROW
BEGIN
  DECLARE v_danio INT DEFAULT 0;
  IF NEW.propietario = 'jugador' THEN
    SELECT COALESCE(
             CEIL(output_base * multiplicador * (1 + COALESCE(amplificacion, 0))),
             CEIL(output_base * multiplicador),
             CEIL(output_base),
             0
           ) INTO v_danio
    FROM PIEZA WHERE pieza_id = NEW.pieza_id;
    UPDATE COMBATE
    SET danio_total_infligido = danio_total_infligido + v_danio
    WHERE combate_id = NEW.combate_id;
  END IF;
END$$

# Trigger 4: al marcar nodo como completado, si es boss, avanzar zona de la run
CREATE TRIGGER trg_avanzar_zona_boss
AFTER UPDATE ON NODO
FOR EACH ROW
BEGIN
  IF OLD.completado = FALSE
     AND NEW.completado = TRUE
     AND NEW.tipo = 'boss' THEN
    UPDATE RUN
    SET zona_actual = LEAST(zona_actual + 1, 3)
    WHERE run_id = NEW.run_id;
  END IF;
END$$

# Trigger 5: descubrir pieza permanentemente al agregarla al inventario de una run
# Cada vez que el jugador obtiene una pieza (origen 'inicial', 'draft', 'tienda', 'evento')
# se registra en META_JUGADOR_COLECCION para que aparezca en futuras runs (meta-progresion).
# Usa INSERT IGNORE: si ya descubrio la pieza antes, no duplica el registro
CREATE TRIGGER trg_descubrir_pieza
AFTER INSERT ON INVENTARIO_RUN
FOR EACH ROW
BEGIN
  DECLARE v_jugador_id INT;
  SELECT jugador_id INTO v_jugador_id
  FROM RUN
  WHERE run_id = NEW.run_id;

  INSERT IGNORE INTO META_JUGADOR_COLECCION (jugador_id, pieza_id)
  VALUES (v_jugador_id, NEW.pieza_id);
END$$


# STORED PROCEDURES (4) 

# SP 1: registrar jugador (valida email único, hashea debe hacerse en Node)
CREATE PROCEDURE sp_registrar_jugador(
  IN p_nombre        VARCHAR(60),
  IN p_email         VARCHAR(120),
  IN p_password_hash VARCHAR(255),
  OUT p_jugador_id   INT
)
BEGIN
  DECLARE v_existe INT DEFAULT 0;
  SELECT COUNT(*) INTO v_existe FROM JUGADOR WHERE email = p_email;
  IF v_existe > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Email ya registrado';
  ELSE
    INSERT INTO JUGADOR (nombre, email, password_hash, rol)
    VALUES (p_nombre, p_email, p_password_hash, 'jugador');
    SET p_jugador_id = LAST_INSERT_ID();
  END IF;
END$$

# SP 2: iniciar una nueva run con inventario inicial
CREATE PROCEDURE sp_iniciar_run(
  IN  p_jugador_id INT,
  OUT p_run_id     INT
)
BEGIN
  INSERT INTO RUN (jugador_id) VALUES (p_jugador_id);
  SET p_run_id = LAST_INSERT_ID();
  # Inventario inicial: 2x Cristal de Energía + 1x Cámara de Corte + 1x Ancla de Escudo
  INSERT INTO INVENTARIO_RUN (run_id, pieza_id, cantidad, origen)
  VALUES (p_run_id, 'gen_e', 2, 'inicial'),
         (p_run_id, 'tr_b',  1, 'inicial'),
         (p_run_id, 'anc_s', 1, 'inicial');
END$$

# SP 3: finalizar combate (victoria o derrota) y actualizar run
CREATE PROCEDURE sp_finalizar_combate(
  IN p_combate_id INT,
  IN p_resultado  ENUM('victoria','derrota')
)
BEGIN
  DECLARE v_nodo_id INT;
  DECLARE v_run_id  INT;
  UPDATE COMBATE
  SET resultado = p_resultado
  WHERE combate_id = p_combate_id;
  SELECT nodo_id INTO v_nodo_id FROM COMBATE WHERE combate_id = p_combate_id;
  SELECT run_id  INTO v_run_id  FROM NODO    WHERE nodo_id    = v_nodo_id;
  IF p_resultado = 'victoria' THEN
    UPDATE NODO SET completado = TRUE WHERE nodo_id = v_nodo_id;
  ELSE
    UPDATE RUN
    SET resultado = 'derrota', fecha_fin = NOW()
    WHERE run_id = v_run_id;
  END IF;
END$$

# SP 4: obtener estadísticas completas de un jugador en un solo llamado
CREATE PROCEDURE sp_stats_jugador(IN p_jugador_id INT)
BEGIN
  SELECT j.jugador_id, j.nombre, j.email, j.total_runs, j.tiempo_total_seg,
         COUNT(CASE WHEN r.resultado='victoria' THEN 1 END) AS victorias,
         COUNT(CASE WHEN r.resultado='derrota'  THEN 1 END) AS derrotas,
         MAX(r.zona_actual) AS zona_maxima,
         (SELECT p.nombre
          FROM COLOCACION_TABLERO ct
          JOIN COMBATE  co ON co.combate_id = ct.combate_id
          JOIN NODO     n  ON n.nodo_id     = co.nodo_id
          JOIN RUN      r2 ON r2.run_id     = n.run_id
          JOIN PIEZA    p  ON p.pieza_id    = ct.pieza_id
          WHERE r2.jugador_id = p_jugador_id AND ct.propietario='jugador'
          GROUP BY p.pieza_id, p.nombre
          ORDER BY COUNT(*) DESC LIMIT 1) AS pieza_favorita
  FROM JUGADOR j
  LEFT JOIN RUN r ON r.jugador_id = j.jugador_id
  WHERE j.jugador_id = p_jugador_id
  GROUP BY j.jugador_id, j.nombre, j.email, j.total_runs, j.tiempo_total_seg;
END$$

DELIMITER ;

# MIGRACION DE DATOS EXISTENTES
# Si ya hay runs jugadas con piezas en INVENTARIO_RUN, las pasamos a META_JUGADOR_COLECCION
# para que los jugadores existentes ya tengan su coleccion poblada con lo que descubrieron antes.
# INSERT IGNORE evita duplicar si la migracion se corre dos veces.
# La fecha_descubierta toma la primera vez que el jugador obtuvo la pieza.
INSERT IGNORE INTO META_JUGADOR_COLECCION (jugador_id, pieza_id, fecha_descubierta)
SELECT
  r.jugador_id,
  ir.pieza_id,
  MIN(r.fecha_inicio) AS fecha_descubierta
FROM RUN r
JOIN INVENTARIO_RUN ir ON r.run_id = ir.run_id
GROUP BY r.jugador_id, ir.pieza_id;