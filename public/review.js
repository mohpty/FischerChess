// const { Chess } = require('chess.js')
const fen = document.getElementById('game_review_board').getAttribute('data-fen');
const pgn = document.getElementById('game_review_board').getAttribute('data-pgn');
const movesLog = pgn.split(" ");
var game = new Chess();
console.log(fen)
game.load_pgn(pgn);

const board = Chessboard2('game_review_board', fen);
const lastMove = setLastMove(pgn);
const movesArr = setupMovesArr(pgn)
console.log("Moves: ", movesArr)

var currentPgn = pgn;
var currentBoardMove = lastMove;


function setupMovesArr(pgn){
    var splitted = pgn.split(' ')
    var output = []
    for(let i = 0 ; i < splitted.length; i += 3){
        let x = []
        x[0] = splitted[i]
        x[1] = splitted[i+1]
        if(i + 2 < splitted.length)
            x[2] = splitted[i+2]
        output.push(x)
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


$('.moveCard').on('click', function(){
    let selectedMove = $(this).attr('data-move');
    let moveNo,moveColor;
    let lastIdx, spaces;
    
    [moveNo,moveColor] = selectedMove.split(".")
    moveNo += "."
    lastIdx = pgn.lastIndexOf(moveNo)
    console.log(pgn.substring(0,(lastIdx + moveNo.length)))
    if(moveColor === "w"){
        spaces = 2
    }
    else{
        spaces = 3
    }
    for(; lastIdx < pgn.length; lastIdx++){   
        if(pgn[lastIdx] === " "){
            spaces--;
        }
        if(!spaces){
            break;
        }
    }

    currentPgn = pgn.substring(0,lastIdx);
    // console.log(pgn)
    console.log(currentPgn)
    game.load_pgn(currentPgn)
    board.position(game.fen())
})

$('#lastPosition').on('click', function(){
    currentBoardMove = lastMove;
    game.load_pgn(pgn)
    board.position(game.fen())
})

$('#firstPosition').on('click', function(){
    currentBoardMove = pgn.indexOf("1.");
    game.reset()
    board.position(game.fen())
})

$('#nextMove').on('click', function(){
    // for(let i = currentBoardMove)
})