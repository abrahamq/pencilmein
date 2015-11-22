var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/User');
var Availability = require('../models/Availability');
var Meeting = require('../models/Meeting');

var utils = require('../../utils/utils');


var gcalAvailability = require('../javascripts/gcalAvailability');
var auth = require('../../config/auth');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oAuth2Client = new OAuth2();
var calendar = google.calendar('v3');
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

router.get('/calendar/:meetingId', function(req, res, next){
  Meeting.findById(req.params.meetingId, function(err, result){
    if(err){
      //let it 404 
      next();
    }else{
      utils.renderTemplate(res, 'calendar', {meetingId: req.params.meetingId, meetingTitle:result.title, _csrf: req.csrfToken()}); 
    }
  }); 
}); 


//Gives you all events in user's google calendar 
router.get('/availability', function(req, res) {
  var test = { "events": [ {
        title: 'All Day Event',
        start: '2014-11-01'
      },
      {
        title: 'Long Event',
        start: '2014-11-07',
        end: '2014-11-10'
      },
      {
        id: 999,
        title: 'Repeating Event',
        start: '2014-11-09T16:00:00'
      }]
  }; 
  oAuth2Client.setCredentials({
    access_token : req.user.googleAccessToken,
    refresh_token : req.user.googleRequestToken
  });
  var mtg_startDate = (new Date()).toISOString();
  var mtg_endDate = '2015-12-25T10:00:00-05:00';//TODO: make this reasonable 
  gcalAvailability.listUpcomingEvents(calendar, oAuth2Client, mtg_startDate, mtg_endDate, function(err, events) {
    if (events) {
      var stringEvents = JSON.stringify(events); 
      var withTitleInsteadOfSubmit = stringEvents.replace(/summary/g, 'title'); 
      var jsonEvent = JSON.parse(withTitleInsteadOfSubmit); 
      utils.sendSuccessResponse(res, {events: jsonEvent}); 
    }
  });
});

// wait for the Availability model to debug before pushing
// gets all availabilities that are still open in meeting 
router.get('/availability/:meetingID', function(req, res) {
  Availability.find({'googleID': req.user.googleID, 'meetingId': req.params.meetingID}, function(err, availability) {
    if (err) {
      utils.sendErrResponse(res, 400, 'no availability found');
    } else {
      utils.sendSuccessResponse(res, {availability: availability, userName: req.user.fullname});
    }
  });
});

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
      //user.setAvailability(userEvents);
      //now tell the client where to redirect to. 
      utils.sendSuccessResponse(res, {redirect: '/user'}); 
    }
  });
});


module.exports = router; 


