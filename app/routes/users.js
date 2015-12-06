var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/User');

var Availability = require('../models/Availability');
var Meeting = require('../models/Meeting');

var utils = require('../../utils/utils');
var schedulingUtils = require('../../utils/schedulingUtils');
var gcalAvailability = require('../javascripts/gcalAvailability');
var optimeet = require('../javascripts/optimeet');

var auth = require('../../config/auth');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');
var refresh = require('passport-oauth2-refresh');

var isLoggedIn = require('./authMiddleware');
var logger = require('../../config/log');

var MILISECONDS_IN_MINUTES = 60000;

router.get('/', isLoggedIn, function(req, res) {
  //Get the user from the current session and look up user object
  User.getUser(req.user.googleEmail, function(err, user_orig) {
    user_orig.populate('meetings', function(err, user) {
      if (err) {
        utils.sendErrResponse(res, 400, 'User meetings do not exist');
        return;
      }
      else {
        //Render user overview page
        //maintain pending and scheduled meetings
        var scheduledMeetings = [];
        var pendingMeetings = user.meetings.filter(function (meeting) {
          var scheduled = meeting.InStartDate !== undefined;
          if (scheduled)
          {
            scheduledMeetings.push(meeting);
          }
          return !scheduled;
        });
        utils.renderTemplate(res, 'useroverview', {pendingMtgs : pendingMeetings, scheduledMtgs : scheduledMeetings, userName: req.user.fullname});
        return;
      }
   });
 });
});



//Load the calendar view for a particular meeting
router.get('/calendars/:meetingId', function(req, res, next){
  //Since unauthorized user's will be entering the application through this point, authenticate
  if (!req.user){
    req.session.redirect_to = '/users/calendars/' + req.params.meetingId;
    res.redirect('/auth/google');
    res.end();
    return;
  }
  //Look up meeting object and render calendar on front end 
  Meeting.findById(req.params.meetingId, function(err, result){
    if(err){
      logger.error("Could not find meeting id: " + req.params.meetingId + "error: " + err);
      //let it 404
      next();
    }else{
      logger.info("rendering calendar view page");
      var token = req.csrfToken();
      utils.renderTemplate(res, 'calendar', {meetingId: req.params.meetingId, meetingTitle:result.title, _csrf: token});
    }
  });
}); 

//Gives you all events in user's google calendar 
router.get('/availabilities/:meetingId', function(req, res) {
  var oAuth2Client = new OAuth2();
  var meetingId = req.params.meetingId; 
  logger.info("getting view page for meeting: ", meetingId); 
  Meeting.findById(meetingId, function(err, meetingResult){
    User.getUser(req.user.googleEmail, function(err, user)
    {
      //Get a new access token from passport 
      refresh.requestNewAccessToken('google', user.googleRefreshToken, function(err, accessToken, refreshToken) {
        logger.info("Acquiring new access token " + accessToken + " using refresh token " + user.googleRefreshToken);
        user.googleAccessToken = accessToken;
        oAuth2Client.setCredentials({
          access_token : user.googleAccessToken,
          refresh_token : user.googleRefreshToken
        });
        if (err){
          logger.info("Could not aquire access token for user: ", user.googleEmail, err);
        }
        var mtg_startDate = (new Date());
        var mydate = meetingResult.latestEndDate; 
        var olddate = mydate.getDate();
        mydate.setDate(olddate+1);
        var mtg_endDate = mydate; 
        var mtg_Date = {start : mtg_startDate, end : mtg_endDate};
        //List the upcoming events from the given time interval {mtg_StartDate} to {mtg_endDate}
        gcalAvailability.listUpcomingEvents(calendar, oAuth2Client, mtg_Date, function(err, events) {
          if (events) {
            events.forEach( function(evt){
              evt.title = evt.summary; 
              evt.start = evt.start.toString();
              evt.end   = evt.end.toString();
            }); 
            user.save(function(err)
            {
              if (err)
              {
                throw err;
              }
              utils.sendSuccessResponse(res, {events: events});
              return;
            });
          }
        });
      });
    });
  });
});

// wait for the Availability model to debug before pushing
// gets all availabilities that are still open in meeting 
router.get('/availabilities/:meetingID', function(req, res) {

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
router.post('/availabilities', function(req, res) {
  var oAuth2Client = new OAuth2();
  var userId = req.user.googleID;
  var curEmail = req.user.googleEmail;
  var userEvents = req.body.events;
  var meetingId = req.body.meetingId;
  var manualPreferences = req.body.preferences;

  User.getUser(req.user.googleEmail, function(err, user)
  {
    oAuth2Client.setCredentials({
      access_token : user.googleAccessToken,
      refresh_token : user.googleRefreshToken
    });

    Meeting.findById(meetingId,function(err, meeting){
      if (meeting.isEligibleToSubmit(curEmail)) {
        user.joinMeeting(meeting._id, function (err) {
        var mtg_Date = {start : meeting.earliestStartDate, end : meeting.latestEndDate};

        Availability.initialize(mtg_Date, userId, meetingId, function(err, availability)
        {
          gcalAvailability.listUpcomingEvents(calendar, oAuth2Client, mtg_Date, function(err, events) {
              var timeRanges = schedulingUtils.convertEventsToTimeRanges(events);
              availability.setBlocksInTimeRangesColorAndCreationType(timeRanges,'red','calendar', function (e,allIds){
                availability.updateAvailabilityWithGeneralPreferences(req.user.preferences, function (err, blockIds)
                {
                availability.save(function(err)
                  {
                    saveManualPreferences(availability, manualPreferences, function(err, ids) {
                      if (err) throw err;
                      recordAndSchedule(res, meeting, curEmail, calendar, oAuth2Client);
                    });
                  });
                });
              });
           });            
        });
       });
      } else {
        // User either was not invited to the meeting or already responded
        utils.sendSuccessResponse(res, {redirect: '/'});
        return;
      }
    });
  });
});


/*
Save manual preferences 
@param {availability} array of user availabilities
@param {manualPreferences} object mapping color of preferences to start and end times 
@param {cb} callback function
*/
var saveManualPreferences = function(availability, manualPreferences, cb) {
  var offset = manualPreferences.offset;
  var redDates = [];
  var yellowDates = [];
  var greenDates = [];
  if (manualPreferences.red) {
    redDates = dateStringToDate(manualPreferences.red, offset);  
  }
  if (manualPreferences.orange) {
    yellowDates = dateStringToDate(manualPreferences.orange, offset);  
  }
  if (manualPreferences.green) {
    greenDates = dateStringToDate(manualPreferences.green, offset);  
  }

  availability.setBlocksInTimeRangesColorAndCreationType(redDates, 'red', 'manual', function(err, redIds) {
    availability.setBlocksInTimeRangesColorAndCreationType(yellowDates, 'yellow', 'manual', function(err, yellowIds) {
      availability.setBlocksInTimeRangesColorAndCreationType(greenDates, 'green', 'manual', function(err, greenIds) {
        cb(err, [redIds, yellowIds, greenIds]);
      });
    });
  });
};

/*
converts an array of datestrings into date objects with the corresponding offset
@param {dateStringArray} array of datestrings
@param {offset} offset in minutes
*/
var dateStringToDate = function(dateStringArray, offset) {
  var hourOffset = parseInt(offset)/60;
  var dateBlocks = dateStringArray.map(function (blockArray) {
    var dateArray = [];
    blockArray.forEach(function(datestring) {
      var prevDate = new Date(datestring);
      var newDate = prevDate;
      newDate.setHours(prevDate.getHours() + hourOffset);
      dateArray.push(newDate);
    });
    return dateArray;
  });
  return dateBlocks;
};

/*
  Records a member's response and schedules an In if the meeting is closed,
  otherwise redirects to the user overview page without further option
  @param {res} http response
  @param {meeting} Meeting to record member response in 
  @param {userEmail} Gmail of the user responding
  @param {calendar} the google calendar instance
  @param {oauth2client} auth client 
*/

var recordAndSchedule = function(res, meeting, userEmail, calendar, oAuth2Client) {
  meeting.recordMemberResponse(userEmail, function (err, found_meeting) {

  if (found_meeting.isClosed()) {
    // Record and calculate a new In
    Availability.findByMeetingId(meeting._id, function(err, availabilities) {
      Availability.getTimeBlocksListsForAvailabilities(availabilities, function (err, blocksLists) {
        var optimal_in = optimeet.getIn(blocksLists, meeting);
        recordInAndAddEvents(res, meeting, optimal_in, calendar, oAuth2Client);
      });
    });
   } else {
    //Meeting not closed so redirect
    utils.sendSuccessResponse(res, {redirect: '/users'});
    return;
    }
  });          
};


/*
Records the finalized In for a meeting and adds the In to the google calendars of the invited members
@param res HTTP Response
@param Meeting meeting: meeting that the In is being scheduled for
@param Optimal_In: object that contains the start and end times of the finalized meeting time
@param Date inStartDate: start date/time of the finalized in
@param Date inEndDate: end date/time of the finalized in
@param calendar
@param oAuth2Client
@param cb will be given arg error
*/
var recordInAndAddEvents = function(res, meeting, optimal_in, calendar, oAuth2Client){
  var inStartDate = optimal_in.startDate;
  var inEndDate = optimal_in.endDate;
  meeting.recordIn(inStartDate, inEndDate, function(err) {
    var invitee_emails = meeting.invitedMembers;
    gcalAvailability.addEventToCalendar(calendar, oAuth2Client, meeting, function(err){
      if (err) {
        utils.sendErrResponse(res, 400, "cannot create google calendar event");
      } else {
        utils.sendSuccessResponse(res, {redirect: '/users'});
      }
    });
  });
};


module.exports = router;
