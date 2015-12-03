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
        utils.renderTemplate(res, 'useroverview', {meetings: user.meetings, userName: req.user.fullname});
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
router.get('/availabilities', function(req, res) {
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
    //Get a new access token from passport 
    refresh.requestNewAccessToken('google', user.googleRefreshToken, function(err, accessToken, refreshToken) {
      logger.info("Acquiring new access token " + accessToken + " using refresh token " + user.googleRefreshToken);
      user.googleAccessToken = accessToken;
      oAuth2Client.setCredentials({
        access_token : user.googleAccessToken,
        refresh_token : user.googleRefreshToken
      });
      var mtg_startDate = (new Date());
      var mtg_endDate = new Date('2015-12-25T10:00:00-05:00');//TODO: make this reasonable
      var mtg_Date = {start : mtg_startDate, end : mtg_endDate}
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

  oAuth2Client.setCredentials({
    access_token : req.user.googleAccessToken,
    refresh_token : req.user.googleRefreshToken
  });

  Meeting.findById(meetingId,function(err, meeting){
    if (!meeting.isEligibleToSubmit(curEmail))
    {
      utils.sendSuccessResponse(res, {redirect: '/'});
      return;
    }
    var mtg_Date = {start : meeting.earliestStartDate, end : meeting.latestEndDate};
    Availability.initialize(mtg_Date, userId, meetingId, function(err, availability)
    {
      gcalAvailability.listUpcomingEvents(calendar, oAuth2Client, mtg_Date, function(err, events) {
          var timeRanges = schedulingUtils.convertEventsToTimeRanges(events);
          availability.setBlocksInTimeRangesColorAndCreationType(timeRanges,'red','calendar', function (e,allIds){
            availability.save(function(err)
            {
              if (err) throw err;
              recordAndSchedule(res, meeting, curEmail, calendar, oAuth2Client);
            });
          });
       });            
    });
  });
});
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
        recordInAndAddEvents(res, meeting, optimal_in.startDate, optimal_in.endDate, calendar, oAuth2Client);
      });
    });
   } else {
    //Meeting not closed so redirect
    utils.sendSuccessResponse(res, {redirect: '/users'});
    return;
    }
  });          
}


/*
Records the finalized In for a meeting and adds the In to the google calendars of the invited members
@param res HTTP Response
@param Meeting meeting: meeting that the In is being scheduled for
@param Date inStartDate: start date/time of the finalized in
@param Date inEndDate: end date/time of the finalized in
@param calendar
@param oAuth2Client
@param String title
@param cb will be given arg error
*/
var recordInAndAddEvents = function(res, meeting, inStartDate, inEndDate, calendar, oAuth2Client){
  meeting.recordIn(inStartDate, inEndDate, function(err) {
    var invitee_emails = meeting.invitedMembers;
    gcalAvailability.addEventToCalendar(calendar, oAuth2Client, invitee_emails, meeting.title, meeting.location, inStartDate, inEndDate, function(err){
      if (err) {
        utils.sendErrResponse(res, 400, "cannot create google calendar event");
      } else {
        utils.sendSuccessResponse(res, {redirect: '/users'});
      }
    });
  });
};


module.exports = router;
