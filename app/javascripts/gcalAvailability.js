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
      console.log(err); 
      eventsList = processEvents(response);
      cb(null,eventsList);
    });
  };
  
  _gcalAvailability.addEventToCalendar = function(calendar, oAuth2Client, invitee_emails, title, location, startDate, endDate, cb) {
    var attendees = [];
    invitee_emails.forEach(function(invitee) {
      attendees.push({'email': invitee})
    })
    console.log(typeof startDate);
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
    calendar.events.insert({
      'calendarId' : 'primary',
      'sendNotifications' : true,
      'resource' : cal_event,
      auth: oAuth2Client
    }, function(err, response) {
      console.log('add to cal error : ', err);
      console.log('add to cal response : ', response);
      cb(err , response)
    });
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
      });
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
