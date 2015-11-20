var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/User');
var Meeting = require('../models/Meeting')

router.get('/', function(req, res) {

   User.getUser(req.user.googleID, function(err, user_orig) {
     user_orig.populate('meetings').exec(function(err, user) {
      if (err) {
        utils.sendErrResponse(res, 400, 'User meetings do not exist');
      }
      else {
        utils.renderTemplate(res, 'useroverview', {meetings: user.meetings, userName: req.user.fullname});
      }
    })
  });
});

module.exports = router; 
