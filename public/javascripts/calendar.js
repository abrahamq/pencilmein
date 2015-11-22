//the data we get from google cal is: 
// have to change summary to title 
var cal = {
    "content": {
        "events": [
            {
                "end": "2015-11-22T01:30:00.000Z",
                "start": "2015-11-22T00:30:00.000Z",
                "summary": "Skating"
            },
            {
                "end": "2015-11-23T01:30:00.000Z",
                "start": "2015-11-22T23:30:00.000Z",
                "summary": "sticksgiving"
            },
            {
                "end": "2015-11-24T00:30:00.000Z",
                "start": "2015-11-23T00:30:00.000Z",
                "summary": "6.034 lab6 due"
            },
            {
                "end": "2015-11-23T16:30:00.000Z",
                "start": "2015-11-23T15:30:00.000Z",
                "summary": "6.034 Lecture"
            },
            {
                "end": "2015-11-23T20:30:00.000Z",
                "start": "2015-11-23T18:30:00.000Z",
                "summary": "17.811 oh"
            },
            {
                "end": "2015-11-23T21:30:00.000Z",
                "start": "2015-11-23T19:30:00.000Z",
                "summary": "6.170 Lecture"
            },
            {
                "end": "2015-11-24T03:30:00.000Z",
                "start": "2015-11-23T23:30:00.000Z",
                "summary": "Work Company"
            },
            {
                "end": "2015-11-24T17:30:00.000Z",
                "start": "2015-11-24T16:30:00.000Z",
                "summary": "6.034 Recitation"
            },
            {
                "end": "2015-11-24T19:30:00.000Z",
                "start": "2015-11-24T18:30:00.000Z",
                "summary": "6.804 Lecture"
            },
            {
                "end": "2015-11-24T22:30:00.000Z",
                "start": "2015-11-24T20:30:00.000Z",
                "summary": "17.811 Lecture"
            }
        ]
    },
    "success": true
}; 


$(function() { // document ready
  var meetingId = $('#meetingId').data('meeting');

  setupBlankCalendar(); 

  //set up the calendar with the user's google calendar events  
//  $.getJSON("/user/availability", function(data){
//    console.log(data); 
//    $('#calendar').fullCalendar('addEventSource', data.content.events);
//  }); 
//
//  //now add the available slots in green 
//  $.getJSON("/user/availability/" + meetingId, function(data){
//    console.log(data); 
//    $('#calendar').fullCalendar('addEventSource', { 
//      events: data.content.events, 
//      color: 'green'
//    });
//  }); 
  
  //send post request when user clicks button 
  $('#calendar-submit').click( function(){
    $.post('/user/availability/submit', {body: "" }, function(res){
      window.location.replace(res.content.redirect); 
    });
  }); 
});

var setupBlankCalendar = function(){
  $('#calendar').fullCalendar({
    customButtons: {
      submit: {
        text: 'Submit',
        click: function() {
          alert('clicked the custom button!');
        }
      }
    },
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay,submit'
    },
    defaultDate: '2015-11-12',
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    eventColor: '#F74A34' //red-orange
  });
}; 
