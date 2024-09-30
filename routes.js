// routes.js
const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.render('index');
});

router.get('/play', (req, res) => {
    res.render('play');
});

// Export the router
module.exports = router;