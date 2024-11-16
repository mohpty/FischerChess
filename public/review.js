// const { Chess } = require('chess.js')
const fen = document.getElementById('game_review_board').getAttribute('data-fen');
const pgn = document.getElementById('game_review_board').getAttribute('data-pgn');
const movesLog = pgn.split(" ");
var game = new Chess();
console.log(fen)
game.load_pgn(pgn);

const board = Chessboard2('game_review_board', fen);
var currentPgn = pgn;

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