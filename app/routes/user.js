var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/User');
var Availability = require('../models/Availability')
var Meeting = require('../models/Meeting');

var utils = require('../../utils/utils');
var gcalAvailability = require('../javascripts/gcalAvailability');

var auth = require('../../config/auth')
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oAuth2Client = new OAuth2();
var calendar = google.calendar('v3');

router.get('/', function(req, res) {
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


router.get('/availability', function(req, res) {
  oAuth2Client.setCredentials({
    access_token : req.user.googleAccessToken,
    refresh_token : req.user.googleRequestToken
  });
  var mtg_startDate = (new Date()).toISOString();
  var mtg_endDate = '2015-11-25T10:00:00-05:00';
  gcalAvailability.listUpcomingEvents(calendar, oAuth2Client, mtg_startDate, mtg_endDate, function(err, events) {
    if (events) {
     utils.sendSuccessResponse(res, {events: events}); 
    }
  });
});

// wait for the Availability model to debug before pushing
router.get('/availability/:meetingID', function(req, res) {
  Availability.find({'googleID': req.user.googleID, 'meetingId': req.params.meetingID}, function(err, availability) {
    if (err) {
      utils.sendErrResponse(res, 400, 'no availability found');
    } else {
      utils.sendSuccessResponse(res, {availability: availability, userName: req.user.fullname});
    }
  })
})

/*
  POST /availability/submit
  Request body:
    - events [startDate, endDate]
*/
router.post('/availability/submit', function(req, res) {
  var userId = req.user.googleID;
  var userEvents = req.body.events;
  User.find({'googleId': userId}, function(err, user) {
    if (err) {
      utils.sendErrResponse(res, 400, "no user found");
    } else {
      user.setAvailability(userEvents);
    }
  })
})

module.exports = router; 