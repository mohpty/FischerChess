// routes.js
const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    // console.log(req.session)
    res.render('index', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg')});
    if(res.session.error) delete res.session.error;
    // delete res.session.success;
});

router.get('/play', (req, res) => {
    res.render('play', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg')});
    // delete res.session.success;
});

router.get('/login', (req, res) => {
    res.render('login', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg')});
    req.session.error = null;
    console.log(req.session.error)
    // console.log(res.session.error)
    // if(req.session.error) req.session.error = null;
    // delete res.session.success;
});


router.get('/register', (req, res) => {
    res.render('register', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg')});
    
    // if(req.session.error) delete req.session.error;
    // delete req.session.success;
});


// Example route to set session data
router.get('/set-session', (req, res) => {
    req.session.username = 'JohnDoe'; // Set session data
    res.send('Session data set!');
});

// Example route to get session data
router.get('/get-session', (req, res) => {
    res.send(`Username from session: ${req.session.username}`);
});

// Export the router
module.exports = router;