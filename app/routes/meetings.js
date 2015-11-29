var express = require('express');
var router = express.Router();
var passport = require('passport');
var utils = require('../../utils/utils');
var isLoggedIn = require('./authMiddleware');
var User = require('../models/User');
var Meeting = require('../models/Meeting');
var logger = require('../../config/log.js')

router.get('/new', isLoggedIn, function(req, res) 
{
  res.render('meetingcreation', {_csrf: req.csrfToken()}); 
});

router.post('/', isLoggedIn, function(req, res)
{
  //Meeting components 
  var meetingInfo = req.body.meetingInfo;
  //create meeting 
  User.getUser(req.user.googleEmail, function(err, meetingCreator) {
    meetingCreator.createMeeting(meetingInfo, 
      function(meetingId)
      {
      //update session 
        req.session.save(function()
        {
          //save meeting creator 
          meetingCreator.save(function()
          {
              utils.sendSuccessResponse(res, {redirect : '/users/calendars/' + meetingId});
              return;
          });
        });
      });
  });
});



module.exports = router;
