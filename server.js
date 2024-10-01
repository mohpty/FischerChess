// index.js
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const http = require('http');
const setupSocket = require('./socket'); // Import the setupSocket function
const routes = require('./routes'); // Import the routes
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express();
const server = http.createServer(app); // Create the HTTP server
const flash = require('connect-flash');

app.use(expressLayout);
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// MySQL DB configuration
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'FischerChess'
});

// Create MySQL session store
const sessionStore = new MySQLStore({}, mysqlConnection);

// Session configuration
app.use(session({
  key: 'session_cookie_name',
  secret: 'ABC_DEFGHIJKLMNOPQRSTUVWX_YZ', // Change to a strong secret
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Connect to MySQL
mysqlConnection.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('MySQL Connected');
});

// Set up Socket.IO
const io = setupSocket(server); // Call the setupSocket function and pass the server instance

// Use the routes
app.use('/', routes); // Use the imported routes
app.use('/user', userRoutes); // Use the user routes

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
