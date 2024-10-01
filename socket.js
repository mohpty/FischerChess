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
            do {
                roomId = Math.round(getRandomNumber(1, 1000000));
            } while (rooms[roomId]);

            if (!rooms[roomId]) {
                rooms[roomId] = { players: [], board: null };
                socket.join(roomId);
                console.log("PLAYAAA 1", data.user)
                rooms[roomId].players.push(data.user);

                socket.emit('roomCreated', roomId);
                console.log(`Room created: ${roomId}`);
            } else {
                socket.emit("roomExists", [roomId, rooms[roomId]]);
            }
        });

        // Room joining
        socket.on('joinRoom', (data) => {
            var roomId = data.roomId;
            console.log("Trying to join", roomId);
            if (rooms[roomId] && rooms[roomId].players.length < 2) {
                socket.join(roomId);
                rooms[roomId].players.push(data.user);

                // Randomize player colors
                if (Math.round(Math.random())) {
                    rooms[roomId].players.reverse();
                }
                socket.emit('joinedRoom', roomId);
                console.log("Shabaraboonda", rooms[data.roomId])
                io.emit('startGame', { roomId });
                console.log(`Player joined room: ${roomId}`);
            } else {
                socket.emit('roomFull', roomId);
            }
        });

        socket.on('pieceMoved', data => {
            if (data.gameOver) {
                const player1Id = rooms[data.roomId].players[0]; // Assuming player IDs are their socket IDs
                const player2Id = rooms[data.roomId].players[1];
        
                const query = 'INSERT INTO games (player1_id, player2_id, pgn) VALUES (?, ?, ?)';
                db.query(query, [player1Id, player2Id, data.gamePGN], (err, results) => {
                    if (err) {
                        console.error('Error saving game data:', err);
                        return;
                    }
                    console.log('Game data saved with ID:', results.insertId);
                });
        
                // Optionally, you can emit an event to notify players that the game is over
                io.to(data.roomId).emit('gameOver', { message: 'Game Over!' });
            }
            io.emit('gameState', data);
        });

        socket.on('disconnect', () => {
            console.log(socket.id, " Disconnected");
        });
    });

    return io;
}

module.exports = setupSocket;