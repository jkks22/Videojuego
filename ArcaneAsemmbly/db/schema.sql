#schema.sql
#ejecutar antes que seed.sql

CREATE DATABASE IF NOT EXISTS arcane_assembly
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE arcane_assembly;

#jugador
#perfil persistente
CREATE TABLE JUGADOR (
  jugador_id       INT           NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(60)   NOT NULL,
  email            VARCHAR(120)  NULL,
  password_hash    VARCHAR(255)  NULL,
  rol              ENUM('jugador','admin') NOT NULL DEFAULT 'jugador',
  fecha_registro   DATETIME      NOT NULL DEFAULT NOW(),
  total_runs       INT           NOT NULL DEFAULT 0,
  tiempo_total_seg INT           NOT NULL DEFAULT 0,
  PRIMARY KEY (jugador_id),
  UNIQUE KEY uq_email (email)
);

#pieza
#catalogo fijo (15 piezas)
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
  CONSTRAINT chk_rareza  CHECK (rareza BETWEEN 0 AND 4),
  CONSTRAINT chk_reflejo CHECK (reflejo_pct IS NULL OR reflejo_pct BETWEEN 0.00 AND 1.00)
);

#enemigo
#catalogo base
CREATE TABLE ENEMIGO (
  enemigo_id       INT           NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(60)   NOT NULL,
  tipo_nodo        ENUM('combat','elite','boss') NOT NULL,
  build            ENUM('aggro','tanky','amplify','mixed','boss') NOT NULL,
  hp_base          INT           NOT NULL,
  flavor_text      TEXT          NULL,
  PRIMARY KEY (enemigo_id)
);

#run
#partida completa
CREATE TABLE RUN (
  run_id           INT           NOT NULL AUTO_INCREMENT,
  jugador_id       INT           NOT NULL,
  fecha_inicio     DATETIME      NOT NULL DEFAULT NOW(),
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
  CONSTRAINT chk_zona_run    CHECK (zona_actual BETWEEN 1 AND 3),
  CONSTRAINT chk_usos_tienda CHECK (usos_tienda BETWEEN 0 AND 2),
  CONSTRAINT chk_usos_evento CHECK (usos_evento BETWEEN 0 AND 3)
);

#nodo
#casilla del mapa
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
);

#combate
#1:1 con nodo
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
    REFERENCES NODO(nodo_id) ON DELETE CASCADE ON UPDATE CASCADE
);

#colocacion_tablero
#piezas en el tablero
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
);

# inventario_run
# piezas dentro de una run
CREATE TABLE INVENTARIO_RUN (
  run_id              INT          NOT NULL,
  pieza_id            VARCHAR(20)  NOT NULL,
  cantidad            INT          NOT NULL DEFAULT 1,
  origen              ENUM('inicial','draft','evento','tienda') NOT NULL,
  nodo_adquirido_id   INT          NULL,
  PRIMARY KEY (run_id, pieza_id, origen),
  CONSTRAINT fk_inv_run FOREIGN KEY (run_id)
    REFERENCES RUN(run_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inv_pieza FOREIGN KEY (pieza_id)
    REFERENCES PIEZA(pieza_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inv_nodo FOREIGN KEY (nodo_adquirido_id)
    REFERENCES NODO(nodo_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_cantidad CHECK (cantidad >= 1)
);

# evento_nodo
# efectos de eventos
CREATE TABLE EVENTO_NODO (
  evento_id        INT           NOT NULL AUTO_INCREMENT,
  nodo_id          INT           NOT NULL,
  titulo           VARCHAR(60)   NOT NULL,
  tipo_efecto      ENUM('draft','heal','damage','impulse','skip') NOT NULL,
  valor_efecto     INT           NULL,
  eleccion_jugador VARCHAR(60)   NULL,
  PRIMARY KEY (evento_id),
  CONSTRAINT fk_evento_nodo FOREIGN KEY (nodo_id)
    REFERENCES NODO(nodo_id) ON DELETE CASCADE ON UPDATE CASCADE
);