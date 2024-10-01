const socket = io('http://localhost:3000')
var game = new Chess()
var clr;
var gameId;
// socket.onAny((event, ...args) => {
//   console.log(event, args);
// });
// the board object is "dumb":
// - shows the current position from the game
// - handles input events from users
const boardConfig = {
  draggable: true,
  onDragStart,
  onTouchSquare,
  onDrop,
  onSnapEnd,
  position: game.fen(),
  touchMove: true
}
const board = Chessboard2('myBoard', boardConfig)
updateStatus()
$('#resetButton').click(()=>{
  board.start();
  game = new Chess(); 
  updatePGN();
  updateStatus();
})
let pendingMove = null
// There are 5 outcomes from this action:
// - start a pending move
// - clear a pending move
// - clear a pending move AND start a different pending move
// - make a move (ie: complete their pending move)
// - do nothing
function onTouchSquare (square, piece, boardInfo) {
  // ask chess.js what legal moves are available from this square
  const legalMoves = game.moves({ square, verbose: true })

  // Option 1: start a pending move
  if (!pendingMove && legalMoves.length > 0) {
    pendingMove = square

    // add circles showing where the legal moves are for this piece
    legalMoves.forEach(move => {
      board.addCircle(move.to)
    })

  // Option 2: clear a pending move if the user selects the same square twice
  } else if (pendingMove && pendingMove === square) {
    pendingMove = null
    board.clearCircles()

  // Option 3: clear a pending move and start a new pending move
  } else if (pendingMove) {
    // ask chess.js to make a move
    const moveResult = game.move({
      from: pendingMove,
      to: square,
      promotion: 'q' // always promote to a Queen for example simplicity
    })

    // was this a legal move?
    if (moveResult) {
      // clear circles on the board
      board.clearCircles()
      console.log(moveResult);
      // update to the new position
      board.position(game.fen()).then(() => {
        updatePGN()
        updateStatus()

        // wait a smidge, then make a random move for Black
        // window.setTimeout(makeRandomMove, 250)
        // socket.on('moved', data => {
        //   console.log(data);
        // })

      })

    // if the move was not legal, then start a new pendingMove from this square
    } else if (piece) {
      pendingMove = square

      // remove any previous circles
      board.clearCircles()

      // add circles showing where the legal moves are for this piece
      legalMoves.forEach(m => {
        board.addCircle(m.to)
      })

    // else clear pendingMove
    } else {
      pendingMove = null
      board.clearCircles()
    }
  }
}

function updateStatus () {
  let statusHTML = ''
  const whosTurn = game.turn() === 'w' ? 'White' : 'Black'

  if (!game.game_over()) {
    if (game.in_check()) statusHTML = whosTurn + ' is in check! '
    statusHTML = statusHTML + whosTurn + ' to move.'
  } else if (game.in_checkmate() && game.turn() === 'w') {
    statusHTML = 'Game over: white is in checkmate. Black wins!'
  } else if (game.in_checkmate() && game.turn() === 'b') {
    statusHTML = 'Game over: black is in checkmate. White wins!'
  } else if (game.in_stalemate() && game.turn() === 'w') {
    statusHTML = 'Game is drawn. White is stalemated.'
  } else if (game.in_stalemate() && game.turn() === 'b') {
    statusHTML = 'Game is drawn. Black is stalemated.'
  } else if (game.in_threefold_repetition()) {
    statusHTML = 'Game is drawn by threefold repetition rule.'
  } else if (game.insufficient_material()) {
    statusHTML = 'Game is drawn by insufficient material.'
  } else if (game.in_draw()) {
    statusHTML = 'Game is drawn by fifty-move rule.'
  }

  document.getElementById('gameStatus').innerHTML = statusHTML
}

function updatePGN () {
  const pgnEl = document.getElementById('gamePGN')
  pgnEl.innerHTML = game.pgn({ max_width: 5, newline_char: '<br />' })
}

function onDragStart (dragStartEvt) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for same color
  if (!isWhitePiece(dragStartEvt.piece) != clr) return false

  // what moves are available to White from this square?
  const legalMoves = game.moves({
    square: dragStartEvt.square,
    verbose: true
  })

  // do nothing if there are no legal moves
  if (legalMoves.length === 0) return false

  // place Circles on the possible target squares
  legalMoves.forEach((move) => {
    board.addCircle(move.to)
  })
}

function isWhitePiece (piece) { return /^w/.test(piece) }

// function makeRandomMove () {
//   const possibleMoves = game.moves()

//   // game over
//   if (possibleMoves.length === 0) return

//   const randomIdx = Math.floor(Math.random() * possibleMoves.length)
//   game.move(possibleMoves[randomIdx])
//   board.position(game.fen(), (_positionInfo) => {
//     updateStatus()
//     updatePGN()
//   })
// }


function onDrop (dropEvt) {
  // see if the move is legal
  const move = game.move({
    from: dropEvt.source,
    to: dropEvt.target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // remove all Circles from the board
  board.clearCircles()

  // the move was legal
  if (move) {
    // reset the pending move
    pendingMove = null

    // update the board position
    board.fen(game.fen(), () => {
      updateStatus()
      updatePGN()

      // make a random legal move for black
      // window.setTimeout(makeRandomMove, 250)
      var data = {
        'roomId': gameId,
        'move': move,
        'gameFen': game.fen(),
        'gamePGN': game.pgn(),
        'turn': game.turn(),
        'gameOver': game.game_over()
      };
      socket.emit('pieceMoved', data);
    })
  } else {
    // reset the pending move
    pendingMove = null

    // return the piece to the source square if the move was illegal
    return 'snapback'
  }
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}


// Onlinneeeee
socket.on('roomCreated', id => {
  clr = 0;
  console.log(`A room has been created with id of ${id}`);
  $('.matchMakingStatus').text(`Room Id: ${id}\nWaiting for player to join`);
});

socket.on('roomExists', data => {
  console.log("Room already exists", data[1]);
  $('.matchMakingStatus').text('Game has been created already');
})

socket.on('joinedRoom', data =>{
  clr = 1;
  board.flip();

  $('.matchMakingButtons').remove();
})
socket.on('startGame', data => {
  game = new Chess();
  gameId = data.roomId;
  board.start();
  $('.matchMakingButtons').remove();
  $('#matchMakingStatus').remove();
  updatePGN();
  updateStatus();
})

socket.on('gameState', data => {
  // alert('gameState');
  game.move(data.move);
  board.position(data.gameFen);
  updatePGN();
  updateStatus();
})

$('#createGame').click(()=>{
  socket.emit('createRoom', USER);
})

$('#joinGame').click(()=>{

  socket.emit('joinRoom', $('#gameId').val());
})
