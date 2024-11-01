// socket.js
const { Server } = require("socket.io");
const mysql = require('mysql2');

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'FischerChess'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
});

const rooms = {};
const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
};

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ['GET', 'POST']
        },
    });

    io.on('connection', (socket) => {
        console.log(socket.id, ' is connected');

        // Room creation
        socket.on('createRoom', (data) => {
            /*
            Will create an issue when implementing matchmaking
            The current situation is that if you created a game you can't create another,
            or join another, but it should be modified so that you can join, but not create
            KEEP THAT IN MIND
            */
            console.log(data);
            const user_id = data.user;
            var query;
            var room_id;

            // - Check if the user is on another room -> current_game == null
            query = "SELECT current_game from users WHERE id = ?";
            db.query(query, [user_id], (err,results) => {
                if (err){
                    console.error("Error Checking current game of the user, ", err);
                    return;
                }
                // if(results.current_game){
                //     // - If yes then return error "You're already in a game."
                //     // console.error("User already in a game.");
                //     // return;
                //     // I'm not even sure what is supposed to be done here
                // }

                // - If not Create the game and return its id, 
                // add the player as a player1, and the game id as current game
                query = 'INSERT INTO games (player1_id, player2_id, pgn) VALUES (?, ?, ?)';
                db.query(query, [user_id, null, null], (err, results) => {
                    if (err) {
                        console.error('Error saving game data:', err);
                        return;
                    }
                    room_id = results.insertId
                    console.log('Game data saved with ID:', room_id);
                    socket.join(room_id);
                    query = "UPDATE users SET current_game = ? WHERE id = ?;"
                    db.query(query, [room_id, user_id], (err, results) => {
                        if (err) {
                            console.error('Error changing current game field on user:', err);
                            return;
                        }
                        console.log(`User current game has been updated to: ${room_id}`, results.insertId);
                    });                
                    socket.emit('roomCreated', room_id);
                    console.log(`Room created: ${room_id}`);

                });
            })
            
            


            // socket.emit("roomExists", [roomId, rooms[roomId]]);

        });

        // Room joining
        socket.on('joinRoom', (data) => {
            var room_id = data.room_id;
            var user_id = data.user_id;
            var query;

            console.log("Trying to join", room_id);
            // Check if the room is vacant
            query = "select player2_id from games where id = ?";
            db.query(query, [room_id], (err, results) => {
                console.log("The room you are trying to join is ", room_id)
                if (err) {
                    console.error('Error joining game:', err);
                    return;
                }
                if(!results.current_game){
                    socket.join(room_id);
                    
                    // Adding this game as the current game on the user record
                    let query = "UPDATE users SET current_game = ? WHERE id = ?;"
                    db.query(query, [user_id, room_id], (err, results) => {
                        if (err) {
                            console.error('Error changing current game field on user:', err);
                            return;
                        }
                        console.log(`User current game has been updated to: ${room_id}`, results.insertId);
                    });

                    // Add the user id as the second user on the game record
                    query = "UPDATE games SET player2_id = ? WHERE id = ?;"
                    db.query(query, [user_id, room_id], (err, results) => {
                        if (err) {
                            console.error('Error changing current game field on user:', err);
                            return;
                        }
                        console.log(`Player2_id of the game id ${room_id} has been updated to: ${user_id}`, results.insertId);
                    });

                    // Update started_at field to current datetime
                    const updateQuery = "UPDATE games SET started_at = NOW() WHERE id = ?";
                    db.query(updateQuery, [room_id], (err, updateResults) => {
                        if (err) {
                            console.error('Error updating game start time:', err);
                            return;
                        }
                        console.log(`Game ${room_id} start time has been updated to the current datetime.`);
                    });

                    // Set the time of start for the game
                    socket.emit('joinedRoom', room_id);
                    io.emit('startGame', { room_id });
                }
                else{
                    console.log("Game is full");
                    return;
                }
            });
        });

        socket.on('pieceMoved', data => {
            
            const query = 'UPDATE games SET pgn = ? WHERE id = ?';
            db.query(query, [data.gamePGN, Number(data.room_id)], (err, results) => {
                if (err) {
                    console.error('Error saving game data:', err);
                    return;
                }
                console.log(`Game ${data.room_id} has been updated.`, results.insertId);
                if (data.gameOver){
                    var gameResult = getGameResult(data.game_over, data.in_check, data.in_checkmate, data.in_draw, data.in_stalemate, 
                                               data.in_threefold_repetition, data.insufficient_material, data.turn);
                    db.query("UPDATE games SET final_position = ?, result = ?, finished_at = NOW() WHERE id = ?", 
                        [data.gameFen, gameResult, data.room_id],(err, results) => {
                            if (err){
                                console.error("Couldn't set final position", err);
                            }
                            console.log("Game is over, and the game's final position and result has been set");
                        }
                    )   
                }
            });
            
            // Optionally, you can emit an event to notify players that the game is over
            // io.to(data.roomId).emit('gameOver', { message: 'Game Over!' });
            io.emit('gameState', data);
        });

        socket.on('disconnect', () => {
            console.log(socket.id, " Disconnected");
        });
    });

    return io;
}

function getGameResult(game_over, in_check, in_checkmate, in_draw, in_stalemate, in_threefold_repetition, insufficient_material, turn){
      if (in_checkmate && turn === 'w') {
        return "0-1";
      }
      else if (in_checkmate && turn === 'b') {
        return "1-0";
      }
      else if (in_stalemate && turn === 'w') {
        // white is stalemated
        return "½–½";
      }
      else if (in_stalemate && turn === 'b') {
        // Black is stalemated
        return "½–½";
      }
      else if (in_threefold_repetition) {
        return "½–½";
      }
      else if (insufficient_material) {
        return "½–½"
      }
      else if (in_draw){
        // Fifty move rule
        return "½–½";
      }
}

module.exports = setupSocket;