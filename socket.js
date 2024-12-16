const { Server } = require("socket.io");
const mysql = require('mysql2/promise');

// Create a connection pool to the database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'FischerChess',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Utility function for database queries
const executeQuery = async (query, params) => {
    try {
        const [results] = await db.query(query, params);
        return results;
    } catch (error) {
        throw new Error(error.message);
    }
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

        // Create a room
        socket.on('createRoom', async (data) => {
            try {
                const userId = data.user;

                // Check if the user is already in a game
                const userResult = await executeQuery("SELECT current_game FROM users WHERE id = ?", [userId]);
                if (userResult[0]?.current_game) {
                    return socket.emit('error', { message: "You are already in a game." });
                }

                // Create a new game
                const gameResult = await executeQuery(
                    "INSERT INTO games (player1_id, player2_id, pgn) VALUES (?, ?, ?)",
                    [userId, null, null]
                );
                const roomId = gameResult.insertId;

                // Update the user's current game
                await executeQuery("UPDATE users SET current_game = ? WHERE id = ?", [roomId, userId]);

                // Join the room and notify the client
                socket.join(roomId);
                socket.emit('roomCreated', roomId);
                console.log(`Room created: ${roomId}`);
            } catch (error) {
                console.error("Error in createRoom:", error);
                socket.emit('error', { message: "Failed to create room." });
            }
        });

        // Join a room
        socket.on('joinRoom', async (data) => {
            try {
                const { room_id, user_id } = data;

                // Check if the user is already in a game
                const userResult = await executeQuery("SELECT current_game FROM users WHERE id = ?", [user_id]);
                if (userResult[0]?.current_game) {
                    return socket.emit('error', { message: "You are already in a game." });
                }

                // Check if the room exists and is vacant
                const gameResult = await executeQuery("SELECT * FROM games WHERE id = ?", [room_id]);
                if (gameResult.length === 0 || gameResult[0].started_at) {
                    return socket.emit('error', { message: "Room is unavailable." });
                }
                var opponentId = gameResult[0].player1_id;
                var opponentUsername = await executeQuery("SELECT username FROM users WHERE id = ?", [opponentId])
                const players = {
                    player1: {id:opponentId, username: opponentUsername[0].username}, 
                    player2: {id: socket.request.session.user.id, username:socket.request.session.user.name}}
                // Update user and game records
                await executeQuery("UPDATE users SET current_game = ? WHERE id = ?", [room_id, user_id]);
                await executeQuery(
                    "UPDATE games SET player2_id = ?, started_at = NOW() WHERE id = ?",
                    [user_id, room_id]
                );
                console.log("Opponent username: ",opponentUsername)
                // Notify users
                socket.join(room_id);
                socket.emit('joinedRoom', room_id);
                io.emit('startGame', { room_id: room_id, players: players });
                console.log(`User ${user_id} joined room ${room_id}`);
            } catch (error) {
                console.error("Error in joinRoom:", error);
                socket.emit('error', { message: "Failed to join room." });
            }
        });

        // Handle piece movement
        socket.on('pieceMoved', async (data) => {
            try {
                const gameResult = await executeQuery("SELECT finished_at FROM games WHERE id = ?", [data.room_id]);
                if (gameResult[0]?.finished_at) {
                    return console.log("The game has already ended.");
                }

                await executeQuery("UPDATE games SET pgn = ? WHERE id = ?", [data.gamePGN, data.room_id]);

                if (data.gameOver) {
                    const gameResult = getGameResult(data);
                    await executeQuery("UPDATE games SET final_position = ?, result = ?, finished_at = NOW() WHERE id = ?", 
                        [data.gameFen, gameResult, data.room_id]);
                    await executeQuery("UPDATE users SET current_game = NULL WHERE id = ?", [data.user_id]);
                }

                io.emit('gameState', data);
            } catch (error) {
                console.error("Error in pieceMoved:", error);
            }
        });

        // Handle resignation
        socket.on('resign', async (data) => {
            try {
                const { player_id, game_id, pgn, fen } = data;

                const gameData = await executeQuery("SELECT player1_id, player2_id FROM games WHERE id = ?", [game_id]);
                const { player1_id, player2_id } = gameData[0];

                let result;
                if (player_id === player1_id) {
                    result = "0-1";
                } else if (player_id === player2_id) {
                    result = "1-0";
                } else {
                    return console.log("Invalid player ID for this game.");
                }

                const updatedPgn = `${pgn} ${result}`;

                await executeQuery(
                    "UPDATE games SET pgn = ?, final_position = ?, finished_at = NOW(), result = ? WHERE id = ?",
                    [updatedPgn, fen, result, game_id]
                );

                await executeQuery(
                    "UPDATE users SET current_game = NULL WHERE id = ? OR id = ?",
                    [player1_id, player2_id]
                );

                socket.to(game_id).emit("gameState", { gameId: game_id, resign: player_id });
                socket.leave(game_id);
            } catch (error) {
                console.error("Error in resign:", error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(socket.id, " Disconnected");
        });
    });

    return io;
}

function getGameResult(data) {
    const {
        game_over, in_check, in_checkmate, in_draw,
        in_stalemate, in_threefold_repetition, insufficient_material, turn
    } = data;

    if (in_checkmate) return turn === 'w' ? "0-1" : "1-0";
    if (in_draw || in_stalemate || in_threefold_repetition || insufficient_material) return "½–½";
    return "½–½";
}

module.exports = setupSocket;
