$(function () {

  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  //Contains the names of time pickers that have been instantiated
  var pickerNames = [];  
 
  // Update each input after a date changes 
  var dateChange = function (e)
  {
    pickerNames.forEach(function (day)
    {
      $('#editPreferences').bootstrapValidator('revalidateField', day);
    });
  };

  var validatorCallback = function(day)
  {
    var message = "If both dates are entered, the earliest start date must be before the latest end time.";
    var compare = function (value, validator, $field)
    {
      var earlierTime = $('#timepicker' + days[day] + 'Start').val();
      var laterTime = $('#timepicker' + days[day] + 'End').val();
      
      if (earlierTime.length > 0 && laterTime.length > 0)
      {
        return Date.parse('01/01/01 ' + earlierTime) < Date.parse('01/01/01 ' + laterTime);
      } else {
        return true;
      }
    };
    return {'message' : message, 'callback' : compare};
  };

  //Configs for each time picker 
  var pickerConfig = {
    minuteStep : 30,
    defaultTime : false,
    snapToStep : true
  };
  
  //Initialize all Time Pickers 
  days.forEach(function(day)
  {
    $('#timepicker' + day + 'Start').timepicker(pickerConfig).on('changeTime.timepicker', dateChange);
    $('#timepicker' + day + 'End').timepicker(pickerConfig).on('changeTime.timepicker', dateChange);
    pickerNames.push(day);
  });

  $('#editPreferences').on('success.form.bv', function(e)
    {
      e.preventDefault();
      var args = {};
      var data = {};

      /*
        Construct data object
          Day of week => [Earliest Start Time, Latest End Time]
      */
      data.Monday = [$(this).find('input[id="timepickerMondayStart"]').val(), $(this).find('input[id="timepickerMondayEnd"]').val()];
      data.Tuesday = [$(this).find('input[id="timepickerTuesdayStart"]').val(), $(this).find('input[id="timepickerTuesdayEnd"]').val()];
      data.Wednesday = [$(this).find('input[id="timepickerWednesdayStart"]').val(), $(this).find('input[id="timepickerWednesdayEnd"]').val()];
      data.Thursday = [$(this).find('input[id="timepickerThursdayStart"]').val(), $(this).find('input[id="timepickerThursdayEnd"]').val()];
      data.Friday = [$(this).find('input[id="timepickerFridayStart"]').val(), $(this).find('input[id="timepickerFridayEnd"]').val()];
      data.Saturday = [$(this).find('input[id="timepickerSaturdayStart"]').val(), $(this).find('input[id="timepickerSaturdayEnd"]').val()];
      data.Sunday = [$(this).find('input[id="timepickerSundayStart"]').val(), $(this).find('input[id="timepickerSundayEnd"]').val()];

      //grab csrf token before posting
      args.preferences  = data;
      args._csrf = $('#_csrf').data('_csrf');
      console.log("SUBMITTING these args");
      console.log(args);

      //Send data to server 
      $.post("/preferences", args, function(resp){
          window.location.replace(resp.content.redirect);
      });

  });

  //Initialize bootstrap validator 
  $('#editPreferences').bootstrapValidator({
      icon: {
          valid: 'glyphicon glyphicon-ok',
          invalid: 'glyphicon glyphicon-remove',
          validating: 'glyphicon glyphicon-refresh'
      },
      fields: {
        Monday : {
          validators : {
              callback : validatorCallback(0)
          }
        },
        Tuesday : {
          validators : {
              callback : validatorCallback(1)
          }
        },
        Wednesday : {
          validators : {
              callback : validatorCallback(2)
          }
        },
        Thursday : {
          validators : {
              callback : validatorCallback(3)
          }
        },
        Friday : {
          validators : {
              callback : validatorCallback(4)
          }
        },
        Saturday : {
          validators : {
              callback : validatorCallback(5)
          }
        },
        Sunday : {
          validators : {
              callback : validatorCallback(6)
          }
        }
      }
    });
});