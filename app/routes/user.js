var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/User');
var Meeting = require('../models/Meeting');
var utils = require('../../utils/utils');
var isLoggedIn = require('./authMiddleware');

router.get('/', isLoggedIn, function(req, res) {
  User.getUser(req.user.googleEmail, function(err, user_orig) {
    user_orig.populate('meetings', function(err, user) {
    if (err) {
      utils.sendErrResponse(res, 400, 'User meetings do not exist');
    }
    else {
      utils.renderTemplate(res, 'useroverview', {meetings: user.meetings, userName: req.user.fullname});
    }
   });
  });
});

module.exports = router; 


