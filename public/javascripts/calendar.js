
$(function() { // document ready
  var meetingId = $('#meetingId').data('meeting');
  var _csrf = $('#_csrf').data('_csrf');

  setupBlankCalendar(); 

  //set up the calendar with the user's google calendar events  
  $.getJSON("/users/availabilities", function(data){
    $('#calendar').fullCalendar('addEventSource', data.content.events);
  }); 

  //now add the available slots in green 
  $.getJSON("/users/availabilities/" + meetingId, function(data){
    $('#calendar').fullCalendar('addEventSource', { 
      events: data.content.events, 
      color: 'green'
    });
  }); 
  
  //send post request when user clicks button 
  $('#calendar-submit').click( function(){
    $.post('/users/availabilities', {meetingId: meetingId, _csrf: _csrf}, function(res){
      window.location.replace(res.content.redirect); 
    });
  }); 
});

var setupBlankCalendar = function(){
  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    defaultDate: '2015-11-12',
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    eventColor: '#F74A34' //red-orange
  });
}; 
