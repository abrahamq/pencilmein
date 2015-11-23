var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/User');

var Availability = require('../models/Availability')
var Meeting = require('../models/Meeting');

var utils = require('../../utils/utils');
var gcalAvailability = require('../javascripts/gcalAvailability');
var optimeet = require('../javascripts/optimeet');

var auth = require('../../config/auth');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
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


router.get('/calendar/:meetingId', function(req, res){
  if (!req.user){
    req.session.redirect_to = '/user/calendar/' + req.params.meetingId; 
    res.redirect('/auth/google'); 
  }
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
  var oAuth2Client = new OAuth2();
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
  console.log("Making request with access token ", req.user.googleAccessToken);
  oAuth2Client.setCredentials({
    access_token : req.user.googleAccessToken,
    refresh_token : req.user.googleRefreshToken
  });
  var mtg_startDate = (new Date());
  var mtg_endDate = new Date('2015-12-25T10:00:00-05:00');//TODO: make this reasonable 
  gcalAvailability.listUpcomingEvents(calendar, oAuth2Client, mtg_startDate, mtg_endDate, function(err, events) {
    if (events) {
      var stringEvents = JSON.stringify(events); 
      var withTitleInsteadOfSubmit = stringEvents.replace(/summary/g, 'title'); 
      var jsonEvent = JSON.parse(withTitleInsteadOfSubmit); 
      //

      utils.sendSuccessResponse(res, {events: jsonEvent}); 
    }
  });
});

// wait for the Availability model to debug before pushing
// gets all availabilities that are still open in meeting 
router.get('/availability/:meetingID', function(req, res) {

  Availability.findByGoogleIdAndMeetingId(req.user.googleID, req.params.meetingID, function(err, availability) {
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
  var oAuth2Client = new OAuth2();
  var userId = req.user.googleID;
  var userEvents = req.body.events;
  var meetingId = req.body.meetingId;

  User.find({'googleId': userId}, function(err, user) {
    if (err) {
      utils.sendErrResponse(res, 400, "no user found");
    } else {
        oAuth2Client.setCredentials({
          access_token : req.user.googleAccessToken,
          refresh_token : req.user.googleRefreshToken
        });
        Meeting.findById(meetingId,function(err,meeting){

          var mtg_startDate = meeting.earliestStartDate;
          var mtg_endDate = meeting.latestEndDate;
          var duration = meeting.duration;
          var location = meeting.location;
          var title = meeting.title;
          var availability = new Availability();

          availability.googleId = userId;
          availability.meetingId = meetingId;
          availability.initializeTimeBlocks(mtg_startDate, mtg_endDate, function(err, blockIds){
            availability.save(function(){
              gcalAvailability.listUpcomingEvents(calendar, oAuth2Client, mtg_startDate, mtg_endDate, function(err, events) {
                if (events) {
                  var stringEvents = JSON.stringify(events); 
                  var withTitleInsteadOfSubmit = stringEvents.replace(/summary/g, 'title'); 
                  var jsonEvent = JSON.parse(withTitleInsteadOfSubmit);
                  var timeRanges = [];
                  jsonEvent.forEach(function(a){
                    timeRanges.push([new Date(a.start),new Date(a.end)]);
                  });
                  availability.setBlocksInTimeRangesColorAndCreationType(timeRanges,'red','calendar',function(e,allIds){
                    availability.save(function(){
                      meeting.recordMemberResponse(userId, function(err, found_meeting) {

                        if (found_meeting.isClosed()){
                          Availability.findByMeetingId(meetingId, function(err, availabilities) {
                            Availability.getTimeBlocksListsForAvailabilities(availabilities, function(err, blocksLists) {
                              var optimal_in = optimeet.getIn(availabilities, mtg_startDate, duration);
                              meeting.recordIn(optimal_in.startDate, optimal_in.endDate, function(err) {
                                // meeting.getInviteeEmailList(function(err, invitee_emails) {
                                  var invitee_emails = meeting.invitedMembers;
                                  gcalAvailability.addEventToCalendar(calendar, oAuth2Client, invitee_emails, title, location, optimal_in.startDate, optimal_in.endDate, function(err) {
                                    if (err) {
                                      // utils.sendErrResponse(res, 400, "cannot create google calendar event");
                                    } else {
                                      utils.sendSuccessResponse(res, {redirect: '/user'}); 
                                    }
                                  });  
                              });                            
                            });
                          });
                        } else {
                          utils.sendSuccessResponse(res, {redirect: '/user'}); 
                        }
                      });

                    });
                  });
                }
              });
            });
          });
        });
    }
  });
});

module.exports = router; 
