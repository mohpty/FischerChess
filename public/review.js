const fen = document.getElementById('game_review_board').getAttribute('data-fen');
const pgn = document.getElementById('game_review_board').getAttribute('data-pgn');
const moveCards = document.getElementsByTagName('moveCard');
const movesLog = pgn.split(" ");
var game = new Chess();
game.load_pgn(pgn);

const board = Chessboard2('game_review_board', fen);
const movesArr = setupMovesArr(pgn)
const LASTMOVE = String(movesArr.length ) + "." + (movesArr[movesArr.length-1][1].move ? 'b' : 'w'); 

var currentPgn = pgn;
var lastMove = LASTMOVE;
console.log("Moves:", movesArr)
console.log("Last move:", LASTMOVE)

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


$('.moveCard').on('click', function(){
    $('.moveCard').removeClass('highlightedMove')
    $(this).addClass('highlightedMove');
    let selectedMove = $(this).attr('data-move');
    let moveNo,moveColor;
    let lastIdx, spaces;
    
    [moveNo,moveColor] = selectedMove.split(".")
    lastMove = selectedMove;
    // [TBD] check if the move number is valid
    let movePgn = moveColor === "w" ? movesArr[Number(moveNo) - 1][0].pgn : movesArr[Number(moveNo) - 1][1].pgn;
    // moveNo += "."
    // lastIdx = pgn.lastIndexOf(moveNo)
    // console.log(pgn.substring(0,(lastIdx + moveNo.length)))
    // if(moveColor === "w"){
    //     spaces = 2
    // }
    // else{
    //     spaces = 3
    // }
    // for(; lastIdx < pgn.length; lastIdx++){   
    //     if(pgn[lastIdx] === " "){
    //         spaces--;
    //     }
    //     if(!spaces){
    //         break;
    //     }
    // }

    // currentPgn = pgn.substring(0,lastIdx);
    // console.log(pgn)
    // console.log(currentPgn)
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
    lastMove = "1.w";
    game.reset()
    currentPgn = game.pgn();
    board.position(game.fen())
})

$('#nextMove').on('click', function(){
    // for(let i = currentBoardMove)
})

$("#prevMove").on('click', function (){
    if(lastMove === "1.w"){
        return false;
    }
    let number,color;
    [number,color] = lastMove.split(".");
    number = Number(number)
    if(number < 1){
        console.error("Wrong move index")
        return false
    }
    if(color === "b"){
        currentPgn = movesArr[number-1][0].pgn
        lastMove = `${number}.w`
        game.load_pgn(currentPgn)
        board.position(game.fen())
    }
    else{
        currentPgn = movesArr[number-1][1].pgn
        lastMove = `${number-1}.b`
        game.load_pgn(currentPgn)
        board.position(game.fen())
    }
    console.log(color)
    console.log($(this),"Current PGN: ", currentPgn)
    console.log("Last move: ", lastMove)
})