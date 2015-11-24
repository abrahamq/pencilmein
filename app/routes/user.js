var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/User');

var Availability = require('../models/Availability');
var Meeting = require('../models/Meeting');

var utils = require('../../utils/utils');
var gcalAvailability = require('../javascripts/gcalAvailability');
var optimeet = require('../javascripts/optimeet');

var auth = require('../../config/auth');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');

var isLoggedIn = require('./authMiddleware');
var logger = require('../../config/log'); 


router.get('/', isLoggedIn, function(req, res) {
  User.getUser(req.user.googleEmail, function(err, user_orig) {
    user_orig.populate('meetings', function(err, user) {
    if (err) {
      utils.sendErrResponse(res, 400, 'User meetings do not exist');
      return;
    }
    else {
      utils.renderTemplate(res, 'useroverview', {meetings: user.meetings, userName: req.user.fullname});
      return;
    }
   });
 });
});


router.get('/calendar/:meetingId', function(req, res, next){
  if (!req.user){
    req.session.redirect_to = '/user/calendar/' + req.params.meetingId; 
    res.redirect('/auth/google'); 
    res.end(); 
    return; 
  }
  Meeting.findById(req.params.meetingId, function(err, result){
    if(err){
      logger.error("Could not find meeting id: " + req.params.meetingId + "error: " + err); 
      //let it 404 
      next();
    }else{
      logger.info("rendering calendar view page"); 
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
  User.getUser(req.user.googleEmail, function(err, user)
  {
    logger.info("Making request with access token ", req.user.googleAccessToken); 
    oAuth2Client.setCredentials({
      access_token : user.googleAccessToken,
      refresh_token : user.googleRefreshToken
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
        return; 
      }
    });
  });
});

// wait for the Availability model to debug before pushing
// gets all availabilities that are still open in meeting 
router.get('/availability/:meetingID', function(req, res) {

  Availability.findByGoogleIdAndMeetingId(req.user.googleID, req.params.meetingID, function(err, availability) {
    if (err) {
      utils.sendErrResponse(res, 400, 'no availability found');
      return;
    } else {
      utils.sendSuccessResponse(res, {availability: availability, userName: req.user.fullname});
      return;
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
  var curEmail = req.user.googleEmail;
  var userEvents = req.body.events;
  var meetingId = req.body.meetingId;

  User.getUser(curEmail, function(err, user) {
    if (err) {
      utils.sendErrResponse(res, 400, "no user found");
      return;
    } else {
        oAuth2Client.setCredentials({
          access_token : user.googleAccessToken,
          refresh_token : user.googleRefreshToken
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

                              var optimal_in = optimeet.getIn(blocksLists, mtg_startDate, duration);
                                var invitee_emails = meeting.invitedMembers;
                                gcalAvailability.addEventToCalendar(calendar, oAuth2Client, invitee_emails, title, location, optimal_in.startDate, optimal_in.endDate, function(err) {
                                  if (err) {
                                    // utils.sendErrResponse(res, 400, "cannot create google calendar event");
                                  } else {
                                    utils.sendSuccessResponse(res, {redirect: '/user'}); 
                                    return;
                                  }
                                });  
                              });  
                              // recordInAndAddEvents(meeting, optimal_in.startDate, optimal_in.endDate);                          
                            });
                          });
                        } else {
                          utils.sendSuccessResponse(res, {redirect: '/user'}); 
                          return;
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
/*
Records the finalized In for a meeting and adds the In to the google calendars of the invited members
@param Meeting meeting: meeting that the In is being scheduled for
@param Date inStartDate: start date/time of the finalized in
@param Date inEndDate: end date/time of the finalized in
@param calendar 
@param oAuth2Client
@param String title
@param cb will be given arg1) error
*/
var recordInAndAddEvents = function(meeting, inStartDate, inEndDate, calendar, oAuth2Client){
  meeting.recordIn(inStartDate, inEndDate, function(err) {
    var invitee_emails = meeting.invitedMembers;
    gcalAvailability.addEventToCalendar(calendar, oAuth2Client, invitee_emails, meeting.title, meeting.location, inStartDate, inEndDate, function(err){
      if (err) {
        // utils.sendErrResponse(res, 400, "cannot create google calendar event");
      } else {
        utils.sendSuccessResponse(res, {redirect: '/user'}); 
      }  
    });
  });    
}


module.exports = router; 
