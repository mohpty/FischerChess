// const { Chess } = require('chess.js')

const fen = document.getElementById('game_review_board').getAttribute('data-fen');
const pgn = document.getElementById('game_review_board').getAttribute('data-pgn');
var game = new Chess();
console.log(fen)
game.load_pgn(pgn);

const board = Chessboard2('game_review_board', fen);