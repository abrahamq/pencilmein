/*
  Handle submit button 
*/
$(document).on('click', '#schedule', function(e)
{
  window.location.replace('/meeting');
});

/*
  When a meeting is clicked on the home page, redirect to the calendar view 
  for that meeting 
*/
$('.list-group-item').on('click', function(e)
{
  var meetingId = $(this).id;
  
});