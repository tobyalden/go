const BOARD_SIZE = 19;
const LINE_SPACING = 30;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

var db = new Firebase("https://douggo.firebaseio.com");

var board = new Array(BOARD_SIZE);
for (var i = 0; i < BOARD_SIZE; i++) {
  board[i] = new Array(BOARD_SIZE);
}

for(var x = 0; x < BOARD_SIZE; x++) {
	for(var y = 0; y < BOARD_SIZE; y++) {
		board[x][y] = EMPTY;
	}
}

var isBlacksTurn = true;

var canvas = new fabric.Canvas('canvas', {selection: false});

var lines = new fabric.Group();
for (var x = 0; x < BOARD_SIZE; x++) {
  var line = new fabric.Line([x * LINE_SPACING + LINE_SPACING, LINE_SPACING, x * LINE_SPACING + LINE_SPACING, BOARD_SIZE * LINE_SPACING], {stroke: 'black'});
  line.selectable = false;
  lines.add(line);
}
for (var y = 0; y < BOARD_SIZE; y++) {
  var line = new fabric.Line([LINE_SPACING, y * LINE_SPACING + LINE_SPACING, BOARD_SIZE * LINE_SPACING, y * LINE_SPACING + LINE_SPACING], {stroke: 'black'});
  line.selectable = false;
  lines.add(line);
}

function drawBoard() {
  canvas.clear();
  canvas.add(lines);
  for(var x = 0; x < BOARD_SIZE; x++) {
    for(var y = 0; y < BOARD_SIZE; y++) {
      if(board[x][y] === BLACK) {
        drawStone(x, y, true, false);
      } else if(board[x][y] === WHITE) {
        drawStone(x, y, false, false);
      }
    }
  }
}

function drawStone(x, y, isBlack, isTransparent) {
  var color = "white";
  if(isBlack) {
    color = "black";
  }
  var opacity = 1;
  if(isTransparent) {
    opacity = 0.5;
  }
  var circle = new fabric.Circle({
    radius: LINE_SPACING/2,
    stroke: "black",
    fill: color,
    opacity: opacity,
    left: (x + 1) * LINE_SPACING - LINE_SPACING/2,
    top: (y + 1) * LINE_SPACING - LINE_SPACING/2
  });
  circle.selectable = false;
  canvas.add(circle);
}

var movesRef = db.child("moves");
movesRef.orderByKey().on("child_added", function(snapshot) {
  placeStone(snapshot.val().x, snapshot.val().y, false);
});

function placeStone(x, y) {
  if(isBlacksTurn) {
    board[x][y] = BLACK;
  } else {
    board[x][y] = WHITE;
  }
  isBlacksTurn = !isBlacksTurn;
  drawBoard();
}

function logMove(x, y) {
    var movesRef = db.child("moves");
    movesRef.push({
      x: x,
      y: y
    });
  console.log("Logged stone at " + x + ", " + y + ". isBlacksTurn = " + isBlacksTurn);
}

canvas.on('mouse:down', function(options) {
  var pointer = canvas.getPointer(event.e);
  var x = Math.round(pointer.x / LINE_SPACING) - 1;
  var y = Math.round(pointer.y / LINE_SPACING) - 1;
  logMove(x, y);
});

canvas.on('mouse:move', function(options) {
  drawBoard();
  var pointer = canvas.getPointer(event.e);
  var row = Math.round(pointer.x / LINE_SPACING) - 1;
  var col = Math.round(pointer.y / LINE_SPACING) - 1;
  if(row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === EMPTY) {
    drawStone(row, col, isBlacksTurn, true);
  }
});
