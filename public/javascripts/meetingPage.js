$(document).ready(function()
{
  $('.form-group').click(function(e) { 
    console.log('clicked');
    var clicked = e.toElement;
    if ($(clicked).attr('type') === "invitee") 
    {
      var num = parseInt($(clicked).attr('id').charAt(7));
      var newElement = $('<input type="invitee" class="form-control" id=invitee'+(num+1)+' placeholder="Eg. funnybunny@gmail.com">');  
      if (num === parseInt($('#state').val()) && $(clicked).val())
      {
        $(clicked).after(newElement);
        $('#state').attr('value', (num+1).toString());
      }
    }
  });
});