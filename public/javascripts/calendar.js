
$(function() { // document ready
  var meetingId = $('#meetingId').data('meeting');
  var _csrf = $('#_csrf').data('_csrf');

  setupBlankCalendar(); 

  var googleCalendarData = {}; 

  //set up the calendar with the user's google calendar events  
  $.getJSON("/users/availabilities", function(data){
    googleCalendarData = data.content.events; 
    googleCalendarData.forEach(function(evt){
      evt.start = moment.parseZone(evt.start);
      evt.end = moment.parseZone(evt.end);
    }); 
    $('#calendar').fullCalendar('addEventSource', googleCalendarData);
  }); 

  //now add the available slots in green 
  $.getJSON("/users/availabilities/" + meetingId, function(data){
    $('#calendar').fullCalendar('addEventSource', { 
      events: data.content.avilability, 
      color: 'green'
    });
  }); 
  
  //send post request when user clicks button 
  $('#calendar-submit').click( function(){
    var events = $('#calendar').fullCalendar('clientEvents', function(event){
      //filter by only client created events 
      return event.className[0] === "userCreated"; 
    }); 
    result = {red: []}; 
    events.forEach( function(elem){
      startDate = elem.start.format(); 
      endDate = elem.end.format();
      result.red.push([startDate, endDate]);
    }); 
    $.post('/users/availabilities', {meetingId: meetingId, _csrf: _csrf, preferences: result}, function(res){
      window.location.replace(res.content.redirect); 
    });
  }); 
});

var setupBlankCalendar = function(){
  var calendar = $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    defaultDate: '2015-11-12',
    timezone: "America/New_York",
    editable: true,
    eventStartEditable: true,
    eventDurationEditable: true, 
    eventLimit: true, // allow "more" link when too many events
    eventColor: '#F74A34', //red-orange
    selectable: true, 
    selectHelper: true,
      select: function(start, end) {
        var title = "UnAvailable";
        var eventData;
          eventData = {
            title: title, 
            start: start.format(),
            end: end.format(),
            className: "userCreated"
          };
          $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
        $('#calendar').fullCalendar('unselect');
      }
  });
}; 
