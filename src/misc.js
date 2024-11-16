function pgnToMoves(pgn){
    /*
        Convert the pgn text to array of moves, and ignoring the comments
    */
    var comment = false;
    var moves = pgn.split(' ')
    var modMoves = []
    var move = [];
    var output = [];
    for(let i = 0; i < moves.length; i++){
        if(moves[i] === "{"){
            comment = true;
            continue;
        }
        else if(moves[i] === "}"){
            comment = false;
            continue;
        }
        if(comment){
            continue;
        }

        modMoves.push(moves[i])
    }

    move.push(modMoves[0],modMoves[1],modMoves[2])
    for(let i = 3; i < modMoves.length; i++){
        if(modMoves[i][modMoves[i].length-1] === "."){
            output.push(move)
            move = []
        }
        move.push(modMoves[i])
    }
    output.push(move)
    return output;
}

module.exports = pgnToMoves;