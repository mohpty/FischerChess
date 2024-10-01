// routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const router = express.Router();

// MySQL DB configuration (make sure to replace with your connection details)
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'root',
  database: 'FischerChess'
});

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  mysqlConnection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err){
      req.flash('error_msg', 'Database error');
      // res.locals.message = req.flash();
      return res.status(500).redirect('signup')
    };
    if (results.length > 0){
      req.flash('error_msg', 'Username already exists');
      return res.status(400).redirect('signup');
    } 
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    mysqlConnection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err){
        req.flash('error_msg', 'Database error');
        return res.status(500).redirect('signup')
      };
      req.flash('success_msg', 'User created successfully');
      res.status(201).redirect('/login');
    });
  });
});

// Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find user in the database
  mysqlConnection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err){
      req.flash('error_msg', 'Database error');
      return res.status(500).redirect('/login');
    }
    if (results.length === 0){
      req.flash('error_msg', 'Invalid username or password');
      return res.status(400).redirect('/login');
    };

    const user = results[0];

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid username or password');
      return res.status(400).redirect('/login');
    }

    // Set session data
    req.session.user = user.username; // Store username in session
    req.flash('success_msg', 'Logged in successfully');
    res.redirect('/play');
  });
});

// Logout Route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      req.flash('error_msg', 'Could not log out');
      return res.status(500).redirect('index');
    }
    
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('index');
  });
});

module.exports = router;
