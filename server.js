const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server, {
  cors:{
    'origin': "http://localhost:5173",
    'methods': ['GET', 'POST']
  }
});

const Chess = require('chess.js');
const rooms = {};
app.set('view engine', 'hbs');
app.use(express.static('public'));



io.on('connection', (socket) => {
  console.log(socket.id, ' is connected');
  
  // Room creation
  io.on('createRoom', (roomId) => {
    if (!rooms[roomId]){
      rooms[roomId] = {players:[], board:null};
      socket.join(roomId);
      rooms[roomId].players.push(socket.id);
      socket.emit('roomCreated', roomId);
      console.log(`Room created: ${roomId}`)
    }
    else{
      io.emit("roomExists", roomId);
    }
  });

  // Room joining
  socket.on('joinRoom', (roomId) => {
    if (rooms[roomId] && rooms[roomId].players.length < 2){
      socket.join(roomId);
      rooms[roomId].players.push(socket.id);
      socket.emit('joinedRoom', roomId);
      io.to(roomId).emit('startGame', roomId);
      console.log(`Player joined room: ${roomId}`);
    }
    else{
      socket.emit('roomFull', roomId);
    }
  })

  // Handle disconnection
})


app.get('/play/computer',(req,res) => {
  res.render('playOffline');
})

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
})
