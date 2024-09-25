const express = require('express');
const {Server} = require('socket.io');
const http = require('http');

const Chess = require('chess.js');
const app = express();
const expressServer = http.createServer(app);
const io =  new Server(expressServer);
app.set('view engine', 'hbs');
app.use(express.static('public'));


io.on('connection', (socket) => {
  console.log(socket.id, ' is connected');
  socket.emit('gameObject', data => {
    var x = new Chess();
    return x;
  })
})


app.get('/play/computer',(req,res) => {
  res.render('playOffline');
})

expressServer.listen(3000, () => {
  console.log("Server is listening on port 3000");
})
