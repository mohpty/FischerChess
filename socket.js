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

                // - If not Create the game and return its id, 
                // add the player as a player1, and the game id as current game
                query = 'INSERT INTO games (player1_id, player2_id, pgn) VALUES (?, ?, ?)';
                db.query(query, [user_id, null, null], (err, results) => {
                    if (err) {
                        console.error('Error saving game data:', err);
                        return;
                    }
                    room_id = results.insertId
                    // console.log('Game data saved with ID:', room_id);
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
            // Check if the user has a game going on
            console.log("Trying to join", room_id);
            // Check if the room is vacant
            query = "select current_game from users where id = ?";
            db.query(query, [user_id], (err, results) => {
                if (err) {
                    console.error('Error finding the player:', err);
                    return;
                }
                if(results[0].current_game){
                    console.error("You are currently in a game.");
                    return;
                }
                else{
                    let query = "select * from games where id = ?"; 
                    db.query(query, [room_id], (err, results)=>{
                        if(err){
                            console.error("An error has occured retrieving the game", err);
                        }
                        if(results[0].started_at){
                            console.error("Game has been started already.")
                            return;
                        }
                        socket.join(room_id);

                        // Adding this game as the current game on the user record
                        query = "UPDATE users SET current_game = ? WHERE id = ?;"
                        db.query(query, [room_id, user_id], (err, results) => {
                            if (err) {
                                console.error('Error changing current game field on user:', err);
                                return;
                            }
                            console.log(`User current game has been updated to: ${room_id}`, results.insertId);
                        });
                        
                        // Add the user id as the second user on the game record
                        query = "UPDATE games SET player2_id = ?, started_at = NOW() WHERE id = ?;"
                        db.query(query, [user_id, room_id], (err, results) => {
                            if (err) {
                                console.error('Error changing current game field on user:', err);
                                return;
                            }
                            console.log(`Game ${room_id} start time has been updated to the current datetime.`);
                            console.log(`Player2_id of the game id ${room_id} has been updated to: ${user_id}`, results.insertId);
                        });
                        
                        
                        // Set the time of start for the game
                        socket.emit('joinedRoom', room_id);
                        io.emit('startGame', { room_id });
                    })                 
                    
                }
            });
        });

        socket.on('pieceMoved', data => {
            db.query('select finished_at from games where id = ?', [Number(data.room_id)],(err, results) => {
                if(err){
                    console.error(err)
                }

                console.log("FINISHED AT",results.finished_at, " | ", results['finished_at'], " $ ", results)
                if(results.finished_at){
                    console.log("The game has already ended");
                    return;
                }
            })
            console.log(data.turn)
            const query = 'UPDATE games SET pgn = ? WHERE id = ?';
            db.query(query, [data.gamePGN, Number(data.room_id)], (err, results) => {
                if (err) {
                    console.error('Error saving game data:', err);
                    return;
                }
                console.log(`Game ${data.room_id} has been updated.`, results.insertId);
                if (data.gameOver){
                    var gameResult = getGameResult(data.game_over, data.in_check, data.in_checkmate, 
                        data.in_draw, data.in_stalemate, 
                        data.in_threefold_repetition,
                        data.insufficient_material, data.turn);
                    
                    db.query("UPDATE users SET current_game = NULL WHERE id = ?", 
                        [data.user_id],(err, results) => {
                            if (err){
                                console.error("Couldn't empty user current_game field", err);
                            }
                            console.log("User current game is null");

                            db.query("UPDATE games SET final_position = ?, result = ?, finished_at = NOW() WHERE id = ?", 
                                [data.gameFen, gameResult, data.room_id],(err, results) => {
                                    if (err){
                                        console.error("Couldn't set final position", err);
                                    }
                                    console.log("Game is over, and the game's final position and result has been set");
                                }
                            )   
                        }
                    )
                }
            });
            
            // Optionally, you can emit an event to notify players that the game is over
            // io.to(data.roomId).emit('gameOver', { message: 'Game Over!' });
            io.emit('gameState', data);
        });

        socket.on('resign', data => {
            // Update pgn
            var resignedPlayer = data.player_id;
            var player1_id, player2_id;
            let pgn = data.pgn;
            let result;
            // Check if the player has the black or white pieces
            
            let query = "select player1_id, player2_id from games where id = ?";
            db.query(query, [data.game_id], (err, results)=>{
                
                if(err){
                    console.error(err);
                }
                // console.log("Results:", results[0])
                player1_id = results[0].player1_id;
                player2_id = results[0].player2_id;
                if(data.player_id === results[0].player1_id){
                    pgn += " 0-1"
                    result = "0-1"
                }
                else if(data.player_id === results[0].player2_id){
                    pgn += " 1-0"
                    result = "1-0"
                }
                else{
                    console.log("Player_id isn't correct")
                    return
                }
                let query = "UPDATE games SET pgn = ? ,final_position = ?, finished_at = NOW(), result = ? WHERE id = ?";
                db.query(query, [pgn, data.fen, result, data.game_id], (err, results)=>{
                    if (err){
                        console.error(err)
                    }
                    // console.log(`p1: ${player1_id}, p2: ${player2_id}`)

                    db.query("UPDATE users SET current_game = NULL WHERE id = ? OR id = ?", 
                        [player1_id, player2_id], (err, results)=>{
                            if(err){console.error(err)}
                            socket.to(data.game_id).emit("gameState", {gameId:data.room_id,resign:resignedPlayer})
                            socket.leave(data.game_id);
                            // console.log(`Player with id ${data.player_id} is saying waaai\n and cannot complete game ${data.game_id}`);
                        }
                    )
                });
            });

            
        })

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