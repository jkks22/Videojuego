//board.js: geometria hexagonal, tablero y renderizado (RF-01)

//geometria hex
function hexCenter(col, row) {
  var offset = (row % 2 === 0) ? 0 : HEX_SIZE * 0.95;
  return {
    x: 36 + col * HEX_SIZE * 1.85 + offset,
    y: 36 + row * HEX_SIZE * 1.6,
  };
}

function hexDraw(ctx, cx, cy, size, fill, stroke, label, labelColor, glowColor) {
  ctx.save();
  if (glowColor) { ctx.shadowColor = glowColor; ctx.shadowBlur = 14; }
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    var a  = (Math.PI / 3) * i - Math.PI / 6;
    var px = cx + size * Math.cos(a);
    var py = cy + size * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();

  if (label) {
    ctx.fillStyle    = labelColor || '#EFF6FF';
    ctx.font         = "bold 12px 'Exo 2',sans-serif";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
  }
}

function hexCellAt(px, py) {
  for (var r = 0; r < GRID_ROWS; r++)
    for (var c = 0; c < GRID_COLS; c++) {
      var ctr = hexCenter(c, r);
      if (Math.sqrt(Math.pow(px - ctr.x, 2) + Math.pow(py - ctr.y, 2)) < HEX_SIZE * 0.9)
        return { col: c, row: r };
    }
  return null;
}

function hexNeighbors(col, row) {
  var dirs = (row % 2 === 0)
    ? [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1]]
    : [[-1,0],[1,0],[0,-1],[0,1],[1,-1],[1,1]];
  var res = [];
  for (var i = 0; i < dirs.length; i++) {
    var nc = col + dirs[i][0], nr = row + dirs[i][1];
    if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS)
      res.push({ col: nc, row: nr });
  }
  return res;
}

//tablero
var playerGrid = [];
var enemyGrid  = [];

function boardInit() {
  playerGrid = []; enemyGrid = [];
  for (var r = 0; r < GRID_ROWS; r++) {
    playerGrid.push([]); enemyGrid.push([]);
    for (var c = 0; c < GRID_COLS; c++) {
      playerGrid[r].push(null);
      enemyGrid[r].push(null);
    }
  }
}

function boardClear(side) {
  var g = (side === 'enemy') ? enemyGrid : playerGrid;
  for (var r = 0; r < GRID_ROWS; r++)
    for (var c = 0; c < GRID_COLS; c++) g[r][c] = null;
}

function boardPlace(col, row, pieceId, side) {
  if (side === 'enemy') enemyGrid[row][col] = pieceId;
  else                  playerGrid[row][col] = pieceId;
}

function boardGet(col, row, side) {
  return (side === 'enemy') ? enemyGrid[row][col] : playerGrid[row][col];
}

function boardCount(side) {
  var g = (side === 'enemy') ? enemyGrid : playerGrid, n = 0;
  for (var r = 0; r < GRID_ROWS; r++)
    for (var c = 0; c < GRID_COLS; c++) if (g[r][c]) n++;
  return n;
}

//renderizado del tablero (RF-01)
function boardRender(canvasId, side, hoverCell, flashCells) {
  var canvas = getId(canvasId);
  if (!canvas) return;
  var ctx  = canvas.getContext('2d');
  var grid = (side === 'enemy') ? enemyGrid : playerGrid;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#050810';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //conexiones luminosas entre piezas compatibles
  for (var r = 0; r < GRID_ROWS; r++)
    for (var c = 0; c < GRID_COLS; c++) {
      var pA = getPiece(grid[r][c]);
      if (!pA) continue;
      hexNeighbors(c, r).forEach(function(v) {
        var pB = getPiece(grid[v.row][v.col]);
        if (!pB) return;
        var ok =
          (pA.type === TYPE_GEN   && pB.type === TYPE_TRANS) ||
          (pA.type === TYPE_TRANS && pB.type === TYPE_GEN)   ||
          (pA.type === TYPE_TRANS && pB.type === TYPE_CAT)   ||
          (pA.type === TYPE_CAT   && pB.type === TYPE_TRANS) ||
          (pA.type === TYPE_CAT   && pB.type === TYPE_ANCH)  ||
          (pA.type === TYPE_ANCH  && pB.type === TYPE_CAT);
        if (!ok) return;
        var d = hexCenter(c, r), h = hexCenter(v.col, v.row);
        ctx.save();
        ctx.strokeStyle = TYPE_COLORS[pA.type]; ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.shadowColor = TYPE_COLORS[pA.type]; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(h.x, h.y); ctx.stroke();
        ctx.restore();
      });
    }

  //hexagonos
  for (var r = 0; r < GRID_ROWS; r++)
    for (var c = 0; c < GRID_COLS; c++) {
      var ctr   = hexCenter(c, r);
      var pieza = getPiece(grid[r][c]);

      var esFlash = false;
      if (flashCells)
        for (var fi = 0; fi < flashCells.length; fi++)
          if (flashCells[fi].col === c && flashCells[fi].row === r) { esFlash = true; break; }

      var esHover = hoverCell && hoverCell.col === c && hoverCell.row === r && !pieza;
      var fill    = pieza ? TYPE_COLORS[pieza.type] + '1A' : (esHover ? '#00E5C822' : '#050810');
      var stroke  = pieza ? TYPE_COLORS[pieza.type]       : (esHover ? '#00E5C855' : '#1E3050');
      var glow    = esFlash ? '#FF6B9D' : (pieza ? TYPE_COLORS[pieza.type] : null);

      hexDraw(ctx, ctr.x, ctr.y, HEX_SIZE - 2, fill, stroke,
        pieza ? TYPE_ICONS[pieza.type] : null,
        pieza ? TYPE_COLORS[pieza.type] : null,
        glow);

      if (esFlash) {
        ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI / 3) * i - Math.PI / 6;
          var px = ctr.x + (HEX_SIZE - 2) * Math.cos(a);
          var py = ctr.y + (HEX_SIZE - 2) * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
}

//generacion del tablero enemigo
function boardGenerateEnemy(zone, nodeType) {
  boardClear('enemy');
  var cantidad = nodeType === 'boss' ? 14 : nodeType === 'elite' ? 10 : 6;
  var pool = CATALOG
    .filter(function(p) { return p.rarity <= Math.min(zone, 3); })
    .map(function(p) { return p.id; });

  var celdas = [];
  for (var r = 0; r < GRID_ROWS; r++)
    for (var c = 0; c < GRID_COLS; c++) celdas.push({ col: c, row: r });
  celdas.sort(function() { return Math.random() - 0.5; });

  for (var i = 0; i < Math.min(cantidad, celdas.length); i++)
    boardPlace(celdas[i].col, celdas[i].row, pool[Math.floor(Math.random() * pool.length)], 'enemy');
}
