var express = require('express');
var router = express.Router();
var passport = require('passport');
var utils = require('../../utils/utils');
var isLoggedIn = require('./authMiddleware');
var User = require('../models/User');
var Meeting = require('../models/Meeting');

router.get('/', isLoggedIn, function(req, res) 
{
  res.render('meetingcreation', {_csrf: req.csrfToken()}); 
});

router.post('/create', isLoggedIn, function(req, res)
{
  //Meeting components 
  var title = req.body.title;
  var location = req.body.location;
  var duration = req.body.duration;
  var earliestStartTime = req.body.earliestStartTime;
  var latestEndTime = req.body.latestEndTime;
  var invitees = req.body.invitees;

  //create meeting 
  User.getUser(req.user.googleEmail, function(err, meetingCreator) {
    meetingCreator.createMeeting(title, location, duration, earliestStartTime, latestEndTime, 
      function(meetingId)
      {
        //update session 
        req.login(meetingCreator, function(err)
        {
          req.session.save(function()
          {
            //save meeting creator 
            meetingCreator.save(function()
            {
                utils.sendSuccessResponse(res, {redirect : 'user/calendar/' + meetingId});
            });
          });
       });
      });
  });
});



module.exports = router;
