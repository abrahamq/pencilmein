$(document).ready(function()
{
  //Configure form instruction popovers 
  $('[data-toggle="titlePop"]').popover(); 
  $('[data-toggle="locPop"]').popover(); 
  $('[data-toggle="startPop"]').popover(); 
  $('[data-toggle="endPop"]').popover();  
  $('[data-toggle="invitePop"]').popover();  
  $('[data-toggle="durationPop"]').popover();  

  //Upon successful validation of the form, prepare ajax POST request to server 
  $('#createMeeting').on('success.form.bv', function(e)
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
      if ($(item).val() !== "")
      {
        invitees.push($(item).val());
      }
    });

    data.invitees = invitees;
    
    //Send data to server   
    $.post("/meeting/create", data, function(resp){
        //console.log(resp);
        window.location.replace(resp.content.redirect);
    });
  
  });

  //Revalidates start and end time after any changes are made to the date picker 
  var revalidateDates = function()
  {
    $('#createMeeting').bootstrapValidator('revalidateField', 'startTime');
    $('#createMeeting').bootstrapValidator('revalidateField', 'endTime');
  }

  //Bootstrap date picker for start time 
  $(function () {
    $('#datetimepicker1').datetimepicker({
      stepping : '30',
      sideBySide : true,
      allowInputToggle : true
    }).on('dp.change', function(e)
    {
     revalidateDates();
    });
  });

  //Bootstrap date picker for end time 
  $(function () {
    $('#datetimepicker2').datetimepicker({
       stepping : '30',
       sideBySide : true,
       allowInputToggle : true
    }).on('dp.change', function(e)
    {
      revalidateDates();
    });
  });


  //Initialize bootstrap validator 
   $('#createMeeting').bootstrapValidator({
        icon: {
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
            duration : {
                validators : {
                    notEmpty : {
                        message : 'The duration is required and cannot be empty'
                    },
                    callback: {
                            message: 'Duration must be positive, a multiple of 30 minutes, and no greater than your supplied time range',
                            callback: function (value, validator, $field) {
                                var dur = parseInt(value);
                                var startDate = new Date($('#startTime').val());
                                var endDate = new Date($('#endTime').val());
                                var range = parseInt(endDate - startDate) / 60000;
                                return (dur > 0 && dur % 30 == 0) && (dur <= range);
                            }
                    }
                }
            },
            startTime : {
                validators : {
                    notEmpty: {
                        message: 'The date is required'
                    },
                    date: {
                        format: 'MM/DD/YYYY h:m A',
                        message: 'Start time must be valid',
                    },
                    callback: {
                            message : 'Start time must be before end time',
                            callback: function (value, validator, $field) {
                                var startDate = new Date(value);
                                var endDate = new Date($('#endTime').val());
                                return startDate < endDate;
                            }
                    }
                }
            },
            endTime : {
                validators : {
                    notEmpty: {
                        message: 'The date is required'
                    },
                    date: {
                        format: 'MM/DD/YYYY h:m A',
                        message: 'End time must be valid',
                    },
                      callback: {
                          message: 'End time must be after start time',
                          callback : function (value, validator, $field)
                          {
                            var startDate = new Date($('#startTime').val());
                            var endDate = new Date(value);
                            return startDate < endDate;
                          }
                    },
                }
            },
            'invitee[]': {
               validators : {
                  notEmpty : {
                      message : 'Must enter a valid email address'
                  },
                  regexp: {
                      regexp: '^[^@\\s]+@([^@\\s]+\\.)+[^@\\s]+$',
                      message: 'This is not a valid email address'
                  }
                }
            }
        }
    }).on('click', '.addButton', function() {
            var $template = $('#inviteeTemplate'),
                $clone    = $template
                                .clone()
                                .removeClass('hide')
                                .removeAttr('id')
                                .insertBefore($template),
                $option   = $clone.find('[name="invitee[]"]');

            // Add new field
            $('#createMeeting').bootstrapValidator('addField', $option);
        })

        // Remove button click handler
        .on('click', '.removeButton', function() {
            var $row    = $(this).parents('.form-group'),
                $option = $row.find('[name="invitee[]"]');

            // Remove element containing the option
            $row.remove();

            // Remove field
            $('#createMeeting').bootstrapValidator('removeField', $option);
        })

        // Called after adding new field
        .on('added.field.fv', function(e, data) {
            // data.field   --> The field name
            // data.element --> The new field element
            // data.options --> The new field options

            if (data.field === 'invitee[]') {
                if ($('#createMeeting').find(':visible[name="invitee[]"]').length >= MAX_OPTIONS) {
                    $('#createMeeting').find('.addButton').attr('disabled', 'disabled');
                }
            }
        })

        // Called after removing the field
        .on('removed.field.fv', function(e, data) {
           if (data.field === 'invitee[]') {
                if ($('#createMeeting').find(':visible[name="invitee[]"]').length < MAX_OPTIONS) {
                    $('#createMeeting').find('.addButton').removeAttr('disabled');
                }
            }
        });
});

