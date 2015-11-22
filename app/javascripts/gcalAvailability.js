var gcalAvailability = (function() {
  
  var _gcalAvailability = {}

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
      console.log('in upcoming events response : ', response);
      eventsList = processEvents(response);
      cb(null,eventsList);
    });
  };

  _gcalAvailability.testAddEvent = function(calendar, oAuth2Client, cb) {

    var startDate = (new Date()).toISOString();
    var endDate = '2015-12-25T10:00:00-05:00';
    var cal_event = {
      'summary': 'pencilmeintest',
      'location': 'stud',
      'start': {
        'dateTime': startDate
      },
      'end' : {
        'dateTime': endDate
      },
      'attendees': ['caroline.m.chin@gmail.com'],
    };
    calendar.events.insert({
      'calendarId' : 'primary',
      'sendNotifications' : true,
      'resource' : cal_event,
      auth: oAuth2Client
    }, function(err, response) {
      cb(null , true)
    })
  };

  _gcalAvailability.addEventToCalendar = function(calendar, oAuth2Client, invitee_emails, title, location, startDate, endDate, cb) {
    var attendees = [];
    invitee_emails.forEach(function(invitee) {
      attendees.push({'email': invitee})
    })
    var cal_event = {
      'summary': title,
      'location': location,
      'start': {
        'dateTime': startDate
      },
      'end' : {
        'dateTime': endTime
      },
      'attendees': attendees,
    };
    calendar.events.insert({
      'calendarId' : 'primary',
      'sendNotifications' : true,
      'resource' : cal_event,
      auth: oAuth2Client
    }, function(err, response) {
      cb(null , true)
    })
  };
  

  var processEvents = function(resp) {
    var events = resp.items;
    var eventsList = []

    if (events.length > 0) {
      events.forEach(function(evt) {
        var evt_startTime = evt.start.dateTime;
        if (!evt_startTime) {
          evt_startTime = evt.start.date;
        }
        evt_startTime = roundDate(evt_startTime);
        var evt_endTime = evt.end.dateTime;
        if (!evt_endTime) {
          evt_endTime = evt.end.date;
        }
        evt_endTime = roundDate(evt_endTime);
        eventsList.push({summary: evt.summary, start: evt_startTime, end: evt_endTime});
      })
    } else {
      console.log('No events found.');
    }
    return eventsList;
  };

  var roundDate = function(datestring){
    var date = new Date(datestring);
    minutes = date.getMinutes();
    if (minutes < 30) {
      date.setMinutes(30);
    } 
    else if (minutes > 30) {
      date.setMinutes(60)
    }
    return date
  }

  Object.freeze(_gcalAvailability);

  return _gcalAvailability

})();
module.exports = gcalAvailability;
