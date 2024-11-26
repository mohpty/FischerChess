const socket = io('http://localhost:3000')
var game = new Chess()
var end;
var clr;
var gameId;

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
let pendingMove = null;
let promotionMove = null;
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
  if (game.game_over() || end) return false

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

function promotionChoice(piece){
  console.log(`Promotion choice ${piece}`, promotionMove)
  promotionMove['piece'] = piece;
  onDrop(promotionMove)
}

function onDrop (dropEvt) {
  
  if (!promotionMove && (dropEvt.piece[1] === "P" && (dropEvt.target[1] === "1" || dropEvt.target[1] === "8"))){
    if (dropEvt.orientation == 'black') {
      $('.blackPromPiece').fadeIn('fast', () => {
        $('#promotion').fadeIn('fast');
      });
    } else {
      $('.whitePromPiece').fadeIn('fast', () => {
        $('#promotion').fadeIn('fast');
      });
    }
    promotionMove = dropEvt;
    pendingMove = null;
    return 'snapback';
  }

  var move;
  if(promotionMove){
    move = game.move({
      from: promotionMove.source,
      to: promotionMove.target,
      promotion: promotionMove.piece // NOTE: always promote to a queen for example simplicity
    })
    promotionMove = null;
  }
  else{
    // see if the move is legal
    move = game.move({
      from: dropEvt.source,
      to: dropEvt.target
    })
  }

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
        'room_id': gameId,
        'user_id': parseInt(USER),
        'move': move,
        'gameFen': game.fen(),
        'gamePGN': game.pgn(),
        'turn': game.turn(),
        'gameOver': game.game_over(),
        'in_check': game.in_check(),
        'in_checkmate': game.in_checkmate(),
        'in_draw': game.in_draw(),
        'in_stalemate': game.in_stalemate(),
        'in_threefold_repetition': game.in_threefold_repetition(),
        'insufficient_material': game.insufficient_material()
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

socket.on('gameOver', data => {
  socket.leave(gameId)
  console.log("Do stuff with the interface after the game ends")
})

function resign(){
  var data = {
    pgn: game.pgn(),
    fen: game.fen(),
    player_id: parseInt(USER),
    game_id: parseInt(gameId)
  }
  socket.emit('resign', data);
}
function eventsSetup(){
  // Promotion events
  $(document).click(()=>{
    $('#promotion').css('visibility', 'hidden', ()=>{
      $('.blackPromPiece').css('visibility', 'hidden');
      $('.whitePromPiece').css('visibility', 'hidden');
    });
  })
  
  $('#promotion-bQ, #promotion-wQ').on("click", ()=>{
    promotionChoice('q');
    $('#promotion').fadeOut('fast', ()=>{
      $('.blackPromPiece').fadeOut('fast')
      $('.whitePromPiece').fadeOut('fast')
    })
  })
  
  $('#promotion-bR, #promotion-wR').on("click", ()=>{
    promotionChoice('r');
    $('#promotion').fadeOut('fast', ()=>{
      $('.blackPromPiece').fadeOut('fast')
      $('.whitePromPiece').fadeOut('fast')
    })
  })
  
  $('#promotion-bN, #promotion-wN').on("click", ()=>{
    promotionChoice('n');
    $('#promotion').fadeOut('fast', ()=>{
      $('.blackPromPiece').fadeOut('fast')
      $('.whitePromPiece').fadeOut('fast')
    })
  })
  
  $('#promotion-bB, #promotion-wB').on("click", ()=>{
    promotionChoice('b');
    $('#promotion').fadeOut('fast', ()=>{
      $('.blackPromPiece').fadeOut('fast')
      $('.whitePromPiece').fadeOut('fast')
    })
  })

  // Resignation button
  $('#resignationButton').on('click', ()=>{
    resign();
  })
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}


// Onlinneeeee
socket.on('roomCreated', room_id => {
  clr = 0;
  console.log(`A room has been created with id of ${room_id}`);
  alert(`A room has been created with id of ${room_id}`);
  $('.matchMakingButtons').fadeOut(250, ()=>{
    $('#matchMakingStatus').text(`Room Id: ${room_id}\nWaiting for player to join`);
  });
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
  gameId = data.room_id;
  board.start();
  eventsSetup();
  $('#gameStatus').show();
  $("#gameControls").show();
  $('.matchMakingButtons').fadeOut(250);
  $('#matchMakingStatus').fadeOut(250);
  updatePGN();
  updateStatus();
})

socket.on('gameState', data => {
  // alert('gameState');
  console.log("Got a new one!!")
  if(data.resign){
    end = true;
    $("#resignationButton").hide(()=>{
      if(data.resign != USER){
        document.getElementById("#gameStatus").innerHTML = "Your opponent resigned, You win!";
      }
      else{
        document.getElementById("#gameStatus").innerHTML = "You resigned the game";
      }
    })

    socket.leave(data.gameId);
  }
  game.move(data.move);
  board.position(data.gameFen);
  updatePGN();
  updateStatus();
})

socket.on("gameOver", data => {

  console.log("$$$$$$ Game has been done, because of player resignation")
  document.getElementById('gameStatus').innerHTML = `Player ${data.player_id} has resigned`;
  alert(`Player ${data.player_id} has resigned`)
})

$('#createGame').click(()=>{
  socket.emit('createRoom', {user:parseInt(USER)});
})

$('#joinGame').click(()=>{

  socket.emit('joinRoom', {room_id:$('#gameId').val(), user_id:parseInt(USER)});
})