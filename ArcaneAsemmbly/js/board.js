//board.js: geometría hexagonal, estado del tablero, renderizado y generación del tablero enemigo
//geometría hexagonal

//devuelve el centro en píxeles de la celda (col, row) dentro del canvas
function hexCenter(col, row) {
  // Las filas impares se desplazan para crear el patrón entrelazado de hexágonos
  const offset = (row % 2 === 0) ? 0 : HEX_SIZE * 0.95;
  return {
    x: 50 + col * HEX_SIZE * 1.85 + offset,
    y: 96 + row * HEX_SIZE * 1.6,
  };
}

//dibuja un hexágono sobre ctx con relleno, borde, etiqueta y opcionalmente brillo (glow)
function hexDraw(ctx, cx, cy, size, fill, stroke, label, labelColor, glowColor) {
  ctx.save();
  if (glowColor) { ctx.shadowColor = glowColor; ctx.shadowBlur = 14; }

  //construir el camino del hexágono usando seis vértices
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a  = (Math.PI / 3) * i - Math.PI / 6;
    const px = cx + size * Math.cos(a);
    const py = cy + size * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  //dibujar etiqueta centrada si se proporcionó
  if (label) {
    ctx.fillStyle = labelColor || '#EFF6FF';
    ctx.font = "bold 12px 'Exo 2',sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
  }
}

//retorna la celda de la grilla en la posición de canvas, o null si ninguna coincide
function hexCellAt(px, py) {
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++) {
      const ctr = hexCenter(c, r);
      if (Math.sqrt(Math.pow(px - ctr.x, 2) + Math.pow(py - ctr.y, 2)) < HEX_SIZE * 0.9)
        return { col: c, row: r };
    }
  return null;
}

//retorna las celdas vecinas válidas del hexágono en (col, row)
//las direcciones difieren entre filas pares e impares en coordenadas offset
function hexNeighbors(col, row) {
  const dirs = (row % 2 === 0)
    ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1]]
    : [[-1,0],[1,0],[0,-1],[0,1],[1,-1],[1,1]];
  const res = [];
  for (let i = 0; i < dirs.length; i++) {
    const nc = col + dirs[i][0], nr = row + dirs[i][1];
    if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS)
      res.push({ col: nc, row: nr });
  }
  return res;
}

//estado del tablero
//grills 2D que guardan ids de piezas strings o null para celdas vacías
let playerGrid = [];
let enemyGrid = [];

//inicializa ambas grillas con celdas vacías null
function boardInit() {
  playerGrid = []; enemyGrid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    playerGrid.push([]); enemyGrid.push([]);
    for (let c = 0; c < GRID_COLS; c++) {
      playerGrid[r].push(null);
      enemyGrid[r].push(null);
    }
  }
}

//elimina todas las piezas de la grilla del lado indicado
function boardClear(side) {
  const g = (side === 'enemy') ? enemyGrid : playerGrid;
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++) g[r][c] = null;
}

//coloca un id de pieza en una celda específica
function boardPlace(col, row, pieceId, side) {
  if (side === 'enemy') enemyGrid[row][col] = pieceId;
  else                  playerGrid[row][col] = pieceId;
}

//retorna el id de pieza (o null) en una celda específica
function boardGet(col, row, side) {
  return (side === 'enemy') ? enemyGrid[row][col] : playerGrid[row][col];
}

//cuenta las celdas ocupadas en la grilla del lado indicado
function boardCount(side) {
  const g = (side === 'enemy') ? enemyGrid : playerGrid;
  let n = 0;
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++) if (g[r][c]) n++;
  return n;
}

//rederizado del tablero
/**
 * Renderiza el tablero hexagonal completo de un lado sobre un canvas.
 * {string} canvasId id del canvas destino
 * {string} side player o enemy
 * {object} hoverCell celda a resaltar como previsualización de colocación (opcional)
 * {Array} flashCells celdas a destellar en rojo (retroalimentación de ataque enemigo)
 */
function boardRender(canvasId, side, hoverCell, flashCells) {
  const canvas = getId(canvasId);
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const grid = (side === 'enemy') ? enemyGrid : playerGrid;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#050810';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //dibujar líneas de conexión luminosas entre piezas compatibles adyacentes
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++) {
      const pA = getPiece(grid[r][c]);
      if (!pA) continue;
      hexNeighbors(c, r).forEach(function(v) {
        const pB = getPiece(grid[v.row][v.col]);
        if (!pB) return;
        //solo dibujar conexión si el par forma parte de la cadena de energía
        const vinculados =
          (pA.type === TYPE_GEN   && pB.type === TYPE_TRANS) ||
          (pA.type === TYPE_TRANS && pB.type === TYPE_GEN)   ||
          (pA.type === TYPE_TRANS && pB.type === TYPE_CAT)   ||
          (pA.type === TYPE_CAT   && pB.type === TYPE_TRANS) ||
          (pA.type === TYPE_CAT   && pB.type === TYPE_ANCH)  ||
          (pA.type === TYPE_ANCH  && pB.type === TYPE_CAT);
        if (!vinculados) return;

        const d = hexCenter(c, r), h = hexCenter(v.col, v.row);
        ctx.save();
        ctx.strokeStyle = TYPE_COLORS[pA.type];
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.shadowColor = TYPE_COLORS[pA.type];
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(h.x, h.y);
        ctx.stroke();
        ctx.restore();
      });
    }

  //dibujar cada celda hexagonal
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++) {
      const ctr   = hexCenter(c, r);
      const pieza = getPiece(grid[r][c]);

      //verificar si esta celda debe destellar (retroalimentación de ataque enemigo)
      let esFlash = false;
      if (flashCells)
        for (let fi = 0; fi < flashCells.length; fi++)
          if (flashCells[fi].col === c && flashCells[fi].row === r) { esFlash = true; break; }

      const esHover = hoverCell && hoverCell.col === c && hoverCell.row === r && !pieza;
      const fill   = pieza ? TYPE_COLORS[pieza.type] + '1A' : (esHover ? '#00E5C822' : '#050810');
      const stroke = pieza ? TYPE_COLORS[pieza.type] : (esHover ? '#00E5C855' : '#1E3050');
      const glow   = esFlash ? '#FF6B9D' : (pieza ? TYPE_COLORS[pieza.type] : null);

      hexDraw(ctx, ctr.x, ctr.y, HEX_SIZE - 2, fill, stroke,
        pieza ? TYPE_ICONS[pieza.type] : null,
        pieza ? TYPE_COLORS[pieza.type] : null,
        glow);

      //superponer un relleno rojo semitransparente en celdas que destellan
      if (esFlash) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a  = (Math.PI / 3) * i - Math.PI / 6;
          const px = ctr.x + (HEX_SIZE - 2) * Math.cos(a);
          const py = ctr.y + (HEX_SIZE - 2) * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
}

//generación del tablero enemigo
//rellena aleatoriamente la grill enemiga según el tipo de nodo y la zona actual
function boardGenerateEnemy(zone, nodeType) {
  boardClear('enemy');

  //los jefes reciben un tablero más lleno; los nodos de élite tienen más piezas de combate normal
  const cantidad = nodeType === 'boss' ? 14 : nodeType === 'elite' ? 10 : 6;
  const pool = CATALOG
    .filter(function(p) { return p.rarity <= Math.min(zone, 3); })
    .map(function(p) { return p.id; });

  //mezclar todas las celdas y llenar las primeras cantidad con piezas aleatorias
  const celdas = [];
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++) celdas.push({ col: c, row: r });
  celdas.sort(function() { return Math.random() - 0.5; });

  for (let i = 0; i < Math.min(cantidad, celdas.length); i++)
    boardPlace(celdas[i].col, celdas[i].row, pool[Math.floor(Math.random() * pool.length)], 'enemy');
}
