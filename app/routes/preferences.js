var express = require('express');
var router = express.Router();
var isLoggedIn = require('./authMiddleware');

//Load the Edit Preferences form
router.get('/new', isLoggedIn, function (req, res) {
  res.render('preferences', {_csrf: req.csrfToken()});
});

module.exports = router;