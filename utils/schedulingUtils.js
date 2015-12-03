var User = require('../app/models/User');
var Meeting = require('../app/models/Meeting');
var Availability = require('../app/models/Availability');

/*
  Defines useful helper methods for the implementation of meeting submission and 'In' calculation
*/
var schedulingUtils = (function () {

  var _utils = {};

  /*
    Takes a list of google calendar events and converts them to time ranges for the availability algorithm
    @param {events} google calendar list of events
    @param {mtg_endDate} end of event time range 
    @returns {timeRanges}
  */
  _utils.convertEventsToTimeRanges = function(events, mtg_endDate) {
    var stringEvents = JSON.stringify(events);
    var withTitleInsteadOfSubmit = stringEvents.replace(/summary/g, 'title');
    var jsonEvent = JSON.parse(withTitleInsteadOfSubmit);
    var timeRanges = [];

    //Each Time range is a list of Start and End time for each JSON Event 
    jsonEvent.forEach(function(a){
      timeRanges.push([new Date(a.start),new Date(a.end)]);
    });

    //Fix timeRange overlap 
    if (timeRanges.length !== 0){
      var lastRange = timeRanges[timeRanges.length - 1];
      if (lastRange[1] > mtg_endDate){ //
        lastRange[1] = new Date( mtg_endDate );
      }
    }
    return timeRanges;
  };

  Object.freeze(_utils);
  return _utils;

})();

module.exports = schedulingUtils;
