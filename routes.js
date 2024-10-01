// routes.js
const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    // console.log(req.session)
    res.render('index', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg'),
        session: {user: req.session.user}});
    // delete res.session.success;
});

router.get('/play', (req, res) => {
    res.render('play', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg'),
        session: {user: req.session.user}
    });
    // delete res.session.success;
});

router.get('/login', (req, res) => {
    if (req.session.user){
        req.flash('error_msg', 'User is already logged in')
        res.redirect('/');
    }
    res.render('login', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg'),
        session: {user: req.session.user}});
    req.session.error = null;
    console.log(req.session.error)
    // console.log(res.session.error)
    // if(req.session.error) req.session.error = null;
    // delete res.session.success;
});


router.get('/signup', (req, res) => {
    if (req.session.user){
        req.flash('error_msg', 'User is already logged in')
        res.redirect('/');
    }
    
    res.render('signup', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg'),
        session: {user: req.session.user}});
    
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