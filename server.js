// index.js
const express = require('express');
const session = require('express-session');
const mySQLStore = require('express-mysql-session');
const app = express();
const http = require('http');
const server = http.createServer(app);
const setupSocket = require('./socket'); // Import the setupSocket function
const routes = require('./routes'); // Import the routes

const Chess = require('chess.js'); // Not used in the provided code snippet, so keep it if needed
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Set up Socket.IO
const io = setupSocket(server); // Call the setupSocket function and pass the server instance

// Use the routes
app.use('/', routes); // Use the imported routes

// DB configuration could go here...

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
