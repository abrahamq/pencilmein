var express = require('express');
var router = express.Router();
var isLoggedIn = require('./authMiddleware');
var User = require('../models/User');
var logger = require('../../config/log.js');
var utils = require('../../utils/utils');

//Load the Edit Preferences form
router.get('/new', isLoggedIn, function (req, res) {
  res.render('preferences', {_csrf: req.csrfToken(), name : req.user.fullname});
});

router.post('/', isLoggedIn, function (req, res) {
  var preferences = req.body.preferences;
  User.getUser(req.user.googleEmail, function(err, user) {
    if (err) {
      logger.error(err);
      throw err;
    }
    //Update the current user's general preferences
    user.updatePreferences(preferences, function()
    {
      utils.sendSuccessResponse(res, {redirect : '/users'});
    });
  });
});

module.exports = router;