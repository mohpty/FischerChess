const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server, {
  cors:{
    'origin': "http://localhost:5173",
    'methods': ['GET', 'POST']
  },
});

const Chess = require('chess.js');
const rooms = {};
app.set('view engine', 'hbs');
app.use(express.static('public'));


const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min
}

io.on('connection', (socket) => {
  console.log(socket.id, ' is connected');
  
  // Room creation
  socket.on('createRoom', (roomId) => {
    do{
      roomId = Math.round(getRandomNumber(1,1000000));
    }
    while(rooms[roomId])

    if (!rooms[roomId]){
      rooms[roomId] = {players:[], board:null};
      socket.join(roomId);
      rooms[roomId].players.push(socket.id);

      socket.emit('roomCreated', roomId);
      console.log(`Room created: ${roomId}`)
    }
    else{
      socket.emit("roomExists", [roomId, rooms[roomId]]);
    }
    // Room joining
    
  });

  socket.on('joinRoom', (roomId) => {
    console.log("Trying to join", roomId)
    if (rooms[roomId] && rooms[roomId].players.length < 2){
      socket.join(roomId);
      rooms[roomId].players.push(socket.id);
      
      // randomize player colors
      if(Math.round(Math.random())){
        var switched = [rooms[roomId].players[1], rooms[roomId].players[0]]
        rooms[roomId].players = switched;
      }
      socket.emit('joinedRoom', roomId);

      io.emit('startGame', {'roomId': roomId});
      console.log(`Player joined room: ${roomId}`);
    }
    else{
      socket.emit('roomFull', roomId);
    }
  })
  socket.on('pieceMoved', data => {
    io.emit('gameState', data);
  })
  // Handle disconnection
})
io.on('disconnect', (socket)=>console.log(socket.id," Disconnect"))

app.get('/play/computer',(req,res) => {
  res.render('playOffline');
})

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
})
