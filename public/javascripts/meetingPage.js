$(document).ready(function()
{
  //Allow Dynamic behavior of invitee boxes 
  $('.form-group').click(function(e) { 
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

  //Handle submission of meeting creation form 
  $('#createMeeting').submit(function(e)
  {

    e.preventDefault();
    var data = {};
    //Grab meeting components 
    data.title = $(this).find('input[id="title"]').val();
    data.location = $(this).find('input[id="location"]').val();
    data.earliestStartTime = $(this).find('input[id="startTime"]').val();
    data.latestEndTime = $(this).find('input[id="endTime"]').val();
    data.duration = $(this).find('input[id="duration"]').val();

    var invitees = [];
    //Obtain all invitees from the form 
    $.each($("input[type='invitee']"), function(index,item)
    {
      invitees.push($(item).val());
    });

    data.invitees = invitees;

    //Send data to server 
    $.post("/meeting/create", data, function(resp){
        //console.log(resp);
        window.location.replace(resp.content.redirect);
    });
  });

  //Bootstrap date picker 
   $(function () {
    $('#datetimepicker1').datetimepicker({
        stepping : '30',
        sideBySide : true
     });
   });

    $(function () {
      $('#datetimepicker2').datetimepicker({
         stepping : '30',
         sideBySide : true
      });
    });

  $('[data-toggle="titlePop"]').popover(); 
  $('[data-toggle="locPop"]').popover(); 
  $('[data-toggle="startPop"]').popover(); 
  $('[data-toggle="endPop"]').popover();  
  $('[data-toggle="invitePop"]').popover();  
  $('[data-toggle="durationPop"]').popover();  

  /*
   $('#createMeeting').validate({
       // container: '#messages',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            location: {
                validators: {
                    notEmpty: {
                        message: 'The location is required and cannot be empty'
                    }
                }
            },
            title: {
                validators: {
                    notEmpty: {
                        message: 'The title is required and cannot be empty'
                    }
                }
            },


        }
    });
*/
    $('#createMeeting').validate({
         debug : true,
         rules: {
                    title: "required",
                    location: "required",
                },
    })
});

