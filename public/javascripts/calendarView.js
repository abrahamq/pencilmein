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
  
  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    defaultDate: '2015-11-12',
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    events: [
{
                "end": "2015-11-23T16:30:00.000Z",
                "start": "2015-11-23T15:30:00.000Z",
                "title": "6.034 Lecture"
            },
            {
                "end": "2015-11-23T20:30:00.000Z",
                "start": "2015-11-23T18:30:00.000Z",
                "title": "17.811 oh"
            },
            {
                "end": "2015-11-23T21:30:00.000Z",
                "start": "2015-11-23T19:30:00.000Z",
                "title": "6.170 Lecture"
            },
            {
                "end": "2015-11-24T03:30:00.000Z",
                "start": "2015-11-23T23:30:00.000Z",
                "title": "Work Company"
            },
            {
                "end": "2015-11-24T17:30:00.000Z",
                "start": "2015-11-24T16:30:00.000Z",
                "title": "6.034 Recitation"
            },
            {
                "end": "2015-11-24T19:30:00.000Z",
                "start": "2015-11-24T18:30:00.000Z",
                "title": "6.804 Lecture"
            },
            {
                "end": "2015-11-24T22:30:00.000Z",
                "start": "2015-11-24T20:30:00.000Z",
                "title": "17.811 Lectureaslkfjds klads f"
            }, 
      {
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
      },
      {
        id: 999,
        title: 'Repeating Event',
        start: '2014-11-16T16:00:00'
      },
      {
        title: 'Conference',
        start: '2014-11-11',
        end: '2014-11-13'
      },
      {
        title: 'Meeting',
        start: '2014-11-12T10:30:00',
        end: '2014-11-12T12:30:00'
      },
      {
        title: 'Lunch',
        start: '2014-11-12T12:00:00'
      },
      {
        title: 'Meeting',
        start: '2014-11-12T14:30:00'
      },
      {
        title: 'Happy Hour',
        start: '2014-11-12T17:30:00'
      },
      {
        title: 'Dinner',
        start: '2014-11-12T20:00:00'
      },
      {
        title: 'Birthday Party',
        start: '2014-11-13T07:00:00'
      },
      {
        title: 'Click for Google',
        url: 'http://google.com/',
        start: '2014-11-28'
      }
    ]
  });
});
