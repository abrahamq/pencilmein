$(function() { // document ready
  var meetingId = $('#meetingId').data('meeting');
  var _csrf = $('#_csrf').data('_csrf');

  var buttonState = 'UnAvailable'; 
  $(".btn-group-vertical button").click(function(){
    buttonState = $(this).text(); 
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
        //title, color depend on which button is clicked currently 
        var state = buttonState; 

        var title = state;
        var color = 'red'; 
        if (state === 'UnAvailable'){
          color= 'red';
        } else if (state === 'Available') {
          color= 'green';
        } else{
          color= 'orange';
        }
        var eventData;
        eventData = {
          title: title, 
          start: start.format(),
          end: end.format(),
          className: "userCreated",
          color: color
        };
        $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
        $('#calendar').fullCalendar('unselect');
      }
    });
  }; 
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
    result = {red: [], green: [], orange: []}; 
    events.forEach( function(elem){
      startDate = elem.start.toString(); 
      endDate = elem.end.toString();
      color = elem.color; 
      result[color].push([startDate, endDate]);
    }); 
    console.log(result); 
    $.post('/users/availabilities', {meetingId: meetingId, _csrf: _csrf, preferences: result}, function(res){
      window.location.replace(res.content.redirect); 
    });
  }); 
});


