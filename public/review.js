const fen = document.getElementById('game_review_board').getAttribute('data-fen');
const pgn = document.getElementById('game_review_board').getAttribute('data-pgn');
const moveCards = document.getElementsByTagName('moveCard');
const movesLog = pgn.split(" ");
var game = new Chess();
game.load_pgn(pgn);

const board = Chessboard2('game_review_board', fen);
const movesArr = setupMovesArr(pgn)
const LASTMOVE = movesArr[movesArr.length-1][1].move ? (movesArr.length) * -1 : (movesArr.length); 

var currentPgn = pgn;
var lastMove = LASTMOVE;
console.log("Moves:", movesArr)
console.log("Last move:", LASTMOVE)



$('.moveCard').on('click', function(){
    $('.moveCard').removeClass('highlightedMove')
    $(this).addClass('highlightedMove');
    let selectedMove = $(this).attr('data-move');
    let moveNo,moveColor;

    // [TBD] check if the move number is valid
    lastMove = Number(selectedMove);
    moveNo = Math.abs(lastMove);
    moveColor = lastMove > 0 ? 'w' : 'b';
    let movePgn = moveColor === 'w' ? movesArr[moveNo - 1][0].pgn : movesArr[moveNo - 1][1].pgn;
    currentPgn = movePgn
    game.load_pgn(movePgn)
    board.position(game.fen())
})

$('#lastPosition').on('click', function(){
    $(".moveCard").removeClass('highlightedMove');
    $(".moveCard:last").addClass('highlightedMove');
    lastMove = LASTMOVE;
    currentPgn = pgn;
    game.load_pgn(pgn)
    board.position(game.fen())
})

$('#firstPosition').on('click', function(){
    $(".moveCard").removeClass('highlightedMove');
    $(".moveCard:first").addClass('highlightedMove');
    lastMove = 0;
    game.reset()
    currentPgn = game.pgn();
    board.position(game.fen())
})

$('#nextMove').on('click', function(){
    if(lastMove === movesArr.length){
        return false
    }
    
    // Get the number of the last move
    var number, color;
    number = Math.abs(lastMove);
    
    // Determine the number and color of the previous one
    if(lastMove === 0){
        number = 1;
        color = 'w';
    }
    else if(lastMove > 0){
        color = 'b';
    }
    else{
        number += 1;
        color = 'w';
    }

    // // Get the associated pgn of that move
    var movePgn = movesArr[number-1][color === 'w' ? 0 : 1].pgn


    // // Some logging tests
    // console.log("Next move no.", number)
    // console.log("Next move color.", color)
    // console.log("Next move PGN", movePgn)

    // // Update the board
    currentPgn = movePgn
    game.load_pgn(movePgn)
    board.position(game.fen())

    // // Update the last move
    if(color === 'b')
        lastMove = number * -1
    else
        lastMove = number
})

$("#prevMove").on('click', function (){
    console.log(lastMove)
    if(lastMove === 0){
        return false;
    }

    if(lastMove === 1){
        lastMove = 0;
        game.reset()
        currentPgn = game.pgn();
        board.position(game.fen())
        return;
    }
    
    // Get the number of the last move
    var number, color;
    number = Math.abs(lastMove);
    
    // Determine the number and color of the previous one
    if(lastMove > 0){
        number -= 1;
        color = 'b';
    }
    else{
        color = 'w';
    }

    // Get the associated pgn of that move
    var movePgn = movesArr[number-1][color === 'w' ? 0 : 1].pgn


    // Some logging tests
    console.log("Prev move no.", number)
    console.log("Prev move color.", color)
    console.log("Prev move PGN", movePgn)

    // Update the board
    currentPgn = movePgn
    game.load_pgn(movePgn)
    board.position(game.fen())

    // Update the last move
    lastMove = (color === 'w') ? number : number * -1;
    console.log("Last move updated to:", lastMove);
})


function setupMovesArr(pgn){
    var splitted = pgn.split(' ')
    var output = []
    // Accumelated pgn
    var accPgn = ""
    for(let i = 0 ; i < splitted.length; i += 3){
        let move = [{},{}]
        move[0].move = splitted[i+1]
        accPgn += splitted[i] + " " + splitted[i+1] + " "
        move[0].pgn = accPgn
        if(i + 2 < splitted.length)
            move[1].move = splitted[i+2]
            accPgn += splitted[i+2]? (splitted[i+2] + " ") : ''

        output.push(move)
        move[1].pgn = accPgn
    }

    return output
}


function setLastMove(pgn){
    let lastDot = pgn.lastIndexOf(".");
    let lastSpc = lastDot;
    for(;pgn[lastSpc] != ' '; lastSpc--){
        ;
    }

    return lastSpc + 1;
}
