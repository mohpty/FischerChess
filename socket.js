// socket.js
const { Server } = require("socket.io");

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
        socket.on('createRoom', (roomId) => {
            do {
                roomId = Math.round(getRandomNumber(1, 1000000));
            } while (rooms[roomId]);

            if (!rooms[roomId]) {
                rooms[roomId] = { players: [], board: null };
                socket.join(roomId);
                rooms[roomId].players.push(socket.id);

                socket.emit('roomCreated', roomId);
                console.log(`Room created: ${roomId}`);
            } else {
                socket.emit("roomExists", [roomId, rooms[roomId]]);
            }
        });

        // Room joining
        socket.on('joinRoom', (roomId) => {
            console.log("Trying to join", roomId);
            if (rooms[roomId] && rooms[roomId].players.length < 2) {
                socket.join(roomId);
                rooms[roomId].players.push(socket.id);

                // Randomize player colors
                if (Math.round(Math.random())) {
                    rooms[roomId].players.reverse();
                }
                socket.emit('joinedRoom', roomId);
                io.emit('startGame', { roomId });
                console.log(`Player joined room: ${roomId}`);
            } else {
                socket.emit('roomFull', roomId);
            }
        });

        socket.on('pieceMoved', data => {
            io.emit('gameState', data);
        });

        socket.on('disconnect', () => {
            console.log(socket.id, " Disconnected");
        });
    });

    return io;
}

module.exports = setupSocket;