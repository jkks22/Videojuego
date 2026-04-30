USE arcane_assembly;


# 1. historial de runs por jugador
# muestra todas las runs de un jugador ordenadas por fecha
# cambia el valor de @jugador_id para probar otro jugador

SET @jugador_id = 1;

SELECT
  run_id,
  zona_actual AS zona_final,
  resultado,
  fecha_inicio,
  hp_actual AS hp_final
FROM RUN
WHERE jugador_id = @jugador_id
ORDER BY fecha_inicio DESC;


# 2. top 10 piezas mas usadas globalmente
# cuenta cuantas veces se coloco cada pieza del jugador
# no cuenta piezas colocadas por enemigos
SELECT
  p.nombre,
  p.tipo,
  COUNT(ct.colocacion_id) AS usos
FROM COLOCACION_TABLERO ct
JOIN PIEZA p ON ct.pieza_id = p.pieza_id
WHERE ct.propietario = 'jugador'
GROUP BY p.pieza_id, p.nombre, p.tipo
ORDER BY usos DESC
LIMIT 10;

# 3. tasa de victorias por zona
# agrupa runs terminadas por zona y calcula victorias
# solo considera victoria o derrota
SELECT
  zona_actual AS zona_final,
  COUNT(*) AS total,
  SUM(CASE WHEN resultado = 'victoria' THEN 1 ELSE 0 END) AS victorias,
  ROUND(
    SUM(CASE WHEN resultado = 'victoria' THEN 1 ELSE 0 END) * 100.0 /
    NULLIF(COUNT(*), 0),
    1
  ) AS tasa_victoria_pct
FROM RUN
WHERE resultado IN ('victoria', 'derrota')
GROUP BY zona_actual
ORDER BY zona_actual;


# 4. promedio de rondas por combate
# calcula el promedio de rondas jugadas en combates terminados
# en tu schema se usa ronda_actual como rondas_jugadas
SELECT
  ROUND(AVG(ronda_actual), 1) AS promedio
FROM COMBATE
WHERE resultado IS NOT NULL;

# historial por jugador usando vista
SET @jugador_id = 1;

SELECT
  run_id,
  zona_actual AS zona_final,
  resultado,
  fecha_inicio,
  hp_actual AS hp_final
FROM v_historial_runs
WHERE jugador_id = @jugador_id
ORDER BY fecha_inicio DESC;


# top 10 piezas usando vista
SELECT
  nombre,
  tipo,
  total_usos AS usos
FROM v_piezas_mas_usadas
ORDER BY total_usos DESC
LIMIT 10;


# tasa de victorias por zona usando vista

SELECT
  zona AS zona_final,
  total_runs AS total,
  victorias,
  tasa_victoria_pct
FROM v_tasa_victoria_zona
ORDER BY zona;


# pruebas de rendimiento
# sirven para revisar que mysql use bien los indices
# si tu mysql no soporta explain analyze, usa solo explain

EXPLAIN 
SELECT
  run_id,
  zona_actual AS zona_final,
  resultado,
  fecha_inicio,
  hp_actual AS hp_final
FROM RUN
WHERE jugador_id = @jugador_id
ORDER BY fecha_inicio DESC;

EXPLAIN 
SELECT
  p.nombre,
  p.tipo,
  COUNT(ct.colocacion_id) AS usos
FROM COLOCACION_TABLERO ct
JOIN PIEZA p ON ct.pieza_id = p.pieza_id
WHERE ct.propietario = 'jugador'
GROUP BY p.pieza_id, p.nombre, p.tipo
ORDER BY usos DESC
LIMIT 10;