var logger = require('../../config/log.js'); 
var gcalAvailability = (function() {
  
  var _gcalAvailability = {};

  /*
    Requests upcoming events from a user's google calendar
    @param {calendar} google calendar API entry point
    @param {OAuth2Client} Encapsulates refresh and access token 
    @param {mtg_startDate} start of time window to look events up from
    @param {mtg_endDate} end of time window to look events up from 
    @param {cb} callback upon completion 
  */
  _gcalAvailability.listUpcomingEvents = function(calendar, oAuth2Client, mtg_startDate, mtg_endDate, cb) {
    calendar.events.list({
      'calendarId': 'primary',
      'timeMin': mtg_startDate.toISOString(),
      'timeMax': mtg_endDate.toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'orderBy': 'startTime',
      auth: oAuth2Client
    }, function(err, response) {
      if (err) {
        logger.error("Error in listUpcomingEvents " + err); 
        cb(err); 
      } else {
        eventsList = processEvents(response);
        cb(null,eventsList);
      } 
    });
  };
  
  /*
    Adds a new event to a user's google calendar
    @param {calendar} google calendar API entry point
    @param {OAuth2Client} Encapsulates refresh and access token 
    @param {invitee_emails} Emails of the google accounts invited to the meeting 
    @param {title} title of the new event
    @param {location} location of new event 
    @param {startDate} start of event
    @param {endDate} end of event
    @param {cb} callback upon completion 
  */
  _gcalAvailability.addEventToCalendar = function(calendar, oAuth2Client, invitee_emails, title, location, startDate, endDate, cb) {
    var attendees = [];
    //Set up invitee emails as json
    invitee_emails.forEach(function(invitee) {
      attendees.push({'email': invitee});
    });

    //format google calendar event 
    var cal_event = {
      'summary': title,
      'location': location,
      'start': {
        'dateTime': startDate
      },
      'end' : {
        'dateTime': endDate
      },
      'attendees': attendees,
    };

    //send request to google API
    calendar.events.insert({
      'calendarId' : 'primary',
      'sendNotifications' : true,
      'resource' : cal_event,
      auth: oAuth2Client
    }, function(err, response) {
      if (err){
        logger.error("Error in addEventToCalendar " + err); 
        cb(err); 
      }else{
        cb(err , response);
      }
    });
  };
  

  /*
    Helper to construct an event to send to google calendar
  */
  var processEvents = function(resp) {
    var events = resp.items;
    var eventsList = [];

    if (events.length > 0) {
      events.forEach(function(evt) {
        var evt_startTime = evt.start.dateTime;
        if (!evt_startTime) {
          evt_startTime = evt.start.date;
        }
        evt_startTime = roundStartDate(evt_startTime);
        var evt_endTime = evt.end.dateTime;
        if (!evt_endTime) {
          evt_endTime = evt.end.date;
        }
        evt_endTime = roundEndDate(evt_endTime);
        eventsList.push({summary: evt.summary, start: evt_startTime, end: evt_endTime});
      });
    } else {
    }
    return eventsList;
  };


  /*  
    All start dates should be at 30 minute intervals
    @param {datestring} date supplied, (possibly not a multiple of 30)
  */
  var roundStartDate = function(datestring){
    var date = new Date(datestring);
    var minutes = date.getMinutes();
    if (minutes < 30) {
      date.setMinutes(0);
    } 
    else if (minutes > 30) {
      date.setMinutes(30);
    }
    return date;
  };

  /*  
    All end dates should be at 30 minute intervals
    @param {datestring} date supplied, (possibly not a multiple of 30)
  */
  var roundEndDate = function(datestring){
    var date = new Date(datestring);
    var minutes = date.getMinutes();

    if ((0 < minutes) &&(minutes < 30)) {
      date.setMinutes(30);
    } 
    else if (minutes > 30) {
      date.setMinutes(60);
    }
    return date;
  };

  Object.freeze(_gcalAvailability);

  return _gcalAvailability;

})();
module.exports = gcalAvailability;
