var gcalAvailability = (function() {
  
  var _gcalAvailability = {}

  _gcalAvailability.listUpcomingEvents = function(calendar, oAuth2Client, mtg_startDate, mtg_endDate, cb) {
    var mtg_startDate = (new Date()).toISOString();
    var mtg_endDate = '2015-11-25T10:00:00-05:00';
    
    calendar.events.list({
      'calendarId': 'primary',
      'timeMin': mtg_startDate,
      'timeMax': mtg_endDate,
      'showDeleted': false,
      'singleEvents': true,
      'orderBy': 'startTime',
      auth: oAuth2Client
    }, function(err, response) {
      eventsList = processEvents(response);
      cb(null,eventsList);
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
