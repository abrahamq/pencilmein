//Availability 
var mongoose = require('mongoose');
var TimeBlock = require('./TimeBlock');
var Availability = require('./Availability');

var AvailabilitySchema = mongoose.Schema({
  meetingId : String,
  googleId: String,
  startDate: Date,
  endDate: Date,
  timeBlocks : [{
    type: mongoose.Schema.ObjectId,
    ref: 'TimeBlock' 
  }]
});
AvailabilitySchema.methods = 
{ 
  /*
  Adds a time new time block to the database
  Just a tester function to add and save a time block
  */
  addTimeBlock: function(cb){
    var newBlock = new TimeBlock();
    newBlock.color = 'green';
    newBlock.save(function(){
      TimeBlock.getTimeBlock(newBlock._id, function(err,foundBlock){
        if (err){
          cb({msg: 'couldnt find'});
        }
        else{
          cb(err,foundBlock);
        }
      });
    });
  },
  /*
  Gets all time blocks that an availability instance has
  @param cb: arg1) error arg2) list of time block objects that correspond to this availabilites time blocks
  */
  getTimeBlocks: function(cb){
    var allIds = this.timeBlocks;
    TimeBlock.getTimeBlocks(allIds,function(err,foundBlocks){
      cb(err,foundBlocks);
    });
  },
  /*
  Initializes an availabilities time block list
  Makes all green time blocks, each representing 30 minutes of time,
  the first of which starts at the start date,
  the last of which end at the endDate (aka its start time is 30 minutes before the end)
  @param Date startDate: start time of the first block
  @param Date endDate: end time of the last block
  @param cb args are (error (null or a message), List<timeblock ids> availability.timeBlocks)
  ******* SETS AVAILABILITES START AND END TIME ATTRIBUTES *********
  */
  initializeTimeBlocks: function(startDate,endDate,cb){
    this.endDate = endDate;
    var availability = this; 
    if (startDate>=endDate){
      var minutes = endDate.getMinutes();
      this.startDate = new Date(endDate);
      this.startDate.setMinutes(minutes - 30*this.timeBlocks.length);
      return cb(null,this.timeBlocks);
    }
    var numBlocks = Math.floor((endDate - startDate)/1800000); //splits into 30 min blocks
    var newBlock = new TimeBlock();
    newBlock.startDate = startDate;
    this.timeBlocks.push(newBlock._id);

    var nextStart = new Date(startDate);
    var minutes = nextStart.getMinutes();
    nextStart.setMinutes(minutes+30);
    newBlock.save(function(){
      availability.initializeTimeBlocks(nextStart,endDate,cb);
    });
  },
  /*
  Finds the time block id that starts at a given time
  @param Date time: start time of the block to be found
  @result block Id: Id of block that starts at time
  */
  getIdForBlockAtTime : function(time){
    if (time - this.startDate < 0 || time - this.endDate > 0){ //if the time is outside the availibility
      return "time outside of range";
    }
    var blockNum = Math.floor((time-this.startDate)/1800000);
    return  this.timeBlocks[blockNum];
  },
  /*
  Updates this availability's block at a given time's color and creation type
  (Invalid or null args values will not update the block's attribute of that arg type)
  @param Date time: start time of block whose color we want to change
  @param String newColor: color we want to change it to
  @param String newCreationType : creationType we want to change it to
  @param cb: will be given arg1) error arg2) TimeBlock that was changed
  */
  setBlockAtTimeColorAndCreationType: function(time,newColor,newCreationType,cb){
    if (time - this.startDate < 0 || time - this.endDate > 0){ //if the time is outside the availibility
      return cb({msg: "time is outside of availability range"});
    }
    var blockId = this.getIdForBlockAtTime(time);
    TimeBlock.setTimeBlockColorAndCreationType(blockId,newColor,newCreationType,cb);
  },
  /*
  Updates all blocks color and creation type in the given time range
  @param Date startDate: start date of first block to be changed
  @param Date endDate: end date of last block to be changed
  @param String newColor: all blocks colors in the range will be updated to new color
  @param String newCreationType: all blocks creation types in the range will be updated to this
  @param cb will be given args 1) error and 2) list of time block ids for availability
  */
  setBlocksInTimeRangeColorAndCreationType: function(startDate, endDate, newColor, newCreationType, cb){
    if (startDate>=endDate){
      return cb(null,this.timeBlocks);
    }
    var availability = this; 
    var startD = new Date(startDate);
    var nextStartD = new Date(startDate);
    var minutes = startD.getMinutes();
    nextStartD.setMinutes(minutes+30);
    this.setBlockAtTimeColorAndCreationType(startD,newColor,newCreationType,function(err,res){
      availability.setBlocksInTimeRangeColorAndCreationType(nextStartD, endDate, newColor, newCreationType, cb);
    });
  /*
  Updates all blocks color and creation type in the given time ranges
  @param [[startDate,endDate]] timeRanges: list of time ranges, each time range is a list of startDate,endDate
  @param String newColor: all blocks colors in the range will be updated to new color
  @param String newCreationType: all blocks creation types in the range will be updated to this
  @param cb will be given args 1) error and 2) list of time block ids for availability
  */
  },
  setBlocksInTimeRangesColorAndCreationType: function(timeRanges, newColor, newCreationType, cb){
    if (timeRanges.length === 0){
      return cb(null,this.timeBlocks);
    }
    var availability = this;
    var currentRange = timeRanges[0].slice();
    var nextRanges = timeRanges.slice(1);
    this.setBlocksInTimeRangeColorAndCreationType(currentRange[0],currentRange[1],newColor,newCreationType,function(err,allIds){
      availability.setBlocksInTimeRangesColorAndCreationType(nextRanges, newColor, newCreationType, cb);
    });
  },
  //////// The rest of the instance methods deal with general preferences //////////
  /*
  [OUTERMOST FUNCTION] CALL FOR GENERAL PREFERENCES FROM END OUTPUT
  Updates all time blocks on specific dates that correspond to the general preferences day-of-week earliestStart/latestEnd times
    ex: 
  ~~~Given: thisAvailability from Nov. 1, 12am - Nov. 30th 12am + "Never Available Sun 12am - 11am" --> 
  ~~~updates blocks in ranges: [[Nov. 1, 12am, Nov. 1, 11am],[Nov. 8, 12am, Nov. 8, 11am],...,[Nov. 29, 12am, Nov. 29, 11am]] to red
  @param genPrefDict: Dictionary mapping String days of the week to a list containing 1) String earliest start time 2) String latest end time
  eg. {"Monday": ["8:00 AM", "11:00 PM"],...}
  @param cb will be given args 1) error and 2) list of time block ids for availability
  */
  updateAvailabilityWithGeneralPreferences: function(genPrefDict,cb){
    var ranges = this.getTimeRangesOfGeneralPreferences(genPrefDict);
    console.log("ranges:");
    console.log(ranges);
    this.setBlocksInTimeRangesColorAndCreationType(ranges,'red','general',cb);
  },
  /*
  [Helper function]
  Gets a list of date specific [startDate,endDate] time ranges from the front-end general preferences day-of-week earliestStart/latestEnd times
  @param genPrefDict: Dictionary mapping String days of the week to a list containing 1) String earliest start time 2) String latest end time
  eg. {"Monday": ["8:00 AM", "11:00 PM"],...}
  (genPrefDict is constructed by front end)
  @result List [[Date start, Date end]] of all dates that fall on days of the general prefs
  */
  getTimeRangesOfGeneralPreferences: function(genPrefDict){
    var dayToNum = {'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday':4, 'Friday':5, 'Saturday':6};
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var preferences = []; // will be a list of objects, such as:
    //{'day':dayNum, 'startHour':0, 'startMinute':0, 'endHour':earliestStartHour,'endMinute':earliestStartMinute};

    //the following code looks at each a general preference key/value and maps it into 2 different "day preference" objects,
    //one is to apply the earliest start time of the general pref, the other is for the latest end time of the general pref
    //it adds both of these 2 objects to the preferences list
    for (var dayString in genPrefDict){
      if (days.indexOf(dayString) > -1)
      {
      var timeStringList = genPrefDict[dayString];
      var dayNum = dayToNum[dayString];

      earliestStart = timeStringList[0];
      var startHoursAndMins = this.model('Availability').timeStringToHoursAndMins(earliestStart);
      var earliestStartHour = startHoursAndMins[0];
      var earliestStartMinute = startHoursAndMins[1];
      if (earliestStartHour!=0 || earliestStartMinute!=0){
        var earliestStartPref = {'day':dayNum, 'startHour':0, 'startMinute':0, 'endHour':earliestStartHour,'endMinute':earliestStartMinute};
        preferences.push(earliestStartPref);   
      }
      latestEnd = timeStringList[1];
      var endHoursAndMins = this.model('Availability').timeStringToHoursAndMins(latestEnd);
      var latestEndHour = endHoursAndMins[0];
      var latestEndMinute = endHoursAndMins[1];
      if (latestEndHour!=0 || latestEndMinute!=0){
        var latestEndPref = {'day':dayNum, 'startHour':latestEndHour, 'startMinute':latestEndMinute, 'endHour':24,'endMinute':0};
        preferences.push(latestEndPref);
      }
    }
    }
    return this.getTimeRangesForDayPreferences(preferences);
  },
  /*
  [Helper Function]
  Given a general day-of-week preferences, returns all the specific date ranges that fall in this pref range on this day of the week
  @param dayPreferences is a list of objects, each object contains the following keys: values
    -@param  'day': int (MUST BE 0-6) day of the week of the given general prefernece
    -@param  'startHour': int (MUST BE 0-23) start hour of the general preference
    -@param  'startMinute': int (MUST BE 0 or 30) start minute in the start hour of the general preference
    -@param  'endHour': int (MUST BE 0-23) end hour of the general preference
    -@param  'endMinute': int (MUST BE 0 or 30) end minute in the end hour of the general preference
  @result [[Date startDate, Date endDate]...] a list of time ranges that this day preference will apply to in this availabiltiy
  */
  getTimeRangesForDayPreferences: function(dayPreferences){
    var ranges =[];
    for (var prefNum in dayPreferences){
      var currentDayStartDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
      var rangeStartDate = new Date(currentDayStartDate);
      var pref = dayPreferences[prefNum];
      var day = pref.day;
      var startHour = pref.startHour;
      var startMinute = pref.startMinute;
      var endHour = pref.endHour;
      var endMinute = pref.endMinute;
      rangeStartDate.setHours(startHour);
      rangeStartDate.setMinutes(startMinute);
      while (rangeStartDate < this.endDate && currentDayStartDate < this.endDate){
        if (currentDayStartDate.getDay() == day){
          var rangeStartDate = new Date(currentDayStartDate);
          rangeStartDate.setHours(startHour);
          rangeStartDate.setMinutes(startMinute);
          var rangeEndDate = new Date(currentDayStartDate);
          rangeEndDate.setHours(endHour);
          rangeEndDate.setMinutes(endMinute);
          if (rangeStartDate < this.endDate){
            ranges.push([new Date(Math.max(this.startDate, rangeStartDate)), new Date(Math.min(this.endDate, rangeEndDate))]);
          }
        }
        currentDayStartDate = new Date(currentDayStartDate.getFullYear(), currentDayStartDate.getMonth(), currentDayStartDate.getDate()+1);
      }
    }
    return ranges;
  }
};

AvailabilitySchema.statics = 
{   
  /*
  Finds a single availability by its id
  @param idObject availabiltyId: 
  @result Availabilty object
  */
  findByAvailabilityId : function(availabilityId,cb){
    this.model('Availability').findById(availabilityId,cb);
  }, 
  /*
  Finds availabilities with a given meeting Id
  @param String meetId
  @result List of Availability objects
  */
  findByMeetingId: function(meetId, cb){
    this.model('Availability').find({meetingId: meetId},cb);
  },
  /*
  Finds availabilities with given google id
  @param String googleId
  @result List of Availability objects
  */
  findByGoogleId: function(googId, cb){
    this.model('Availability').find({googleId: googId},cb);
  }, 
  /*
  Finds a single availability given both a google id and meeting id
  @param String googleId
  @result Availability object
  */
  findByGoogleIdAndMeetingId: function(googId, meetId, cb){
    this.model('Availability').findOne({googleId: googId, meetingId: meetId},cb);
  },
      /*
  @param availabilities: list of Availabilities
  @param cb: arg1) err, arg2) list of lists of time blocks
  callback will finally be given the list of lists of time blocks, each list corresponds to 
  an availability and is all of the time blocks that that av. contains
  */
  getTimeBlocksListsForAvailabilities: function(availabilities, cb){
    //this.model('Availability').findById(availabilities,cb);
    this.model('Availability').getTimeBlocksListsForAvailabilitiesRecurse(availabilities,[],cb);
  },
  /*
  Will be called initially by getTimeBlocksListsForAvailabilities with timeBlocksLists as []
  @param availabilites: list of Availabilities objects remaining that we still need to get blocks
  @param timeBlocksLists: list of TimeBlock objects that have been recursively collected so far
  @param cb: arg1) err arg2) will be final timeBlocksLists (list of lists of time blocks), each list corresponds to 
  the list of time blocks for some original availability
  */
  getTimeBlocksListsForAvailabilitiesRecurse: function(availabilities, timeBlocksLists, cb){
    if (availabilities.length==0){
      return cb(null,timeBlocksLists);
    }
    var thisRef = this;
    var availability = availabilities[0];
    nextAvailabilities = availabilities.slice(1);
    availability.getTimeBlocks(function(err,foundBlocks){
      timeBlocksLists.push(foundBlocks);
      thisRef.model('Availability').getTimeBlocksListsForAvailabilitiesRecurse(nextAvailabilities, timeBlocksLists, cb);
    });
  },
  timeStringToHoursAndMins: function(timeString){
    var fakeTime = "01/01/01 "+timeString;
    var fakeDate = new Date(Date.parse(fakeTime));
    return [fakeDate.getHours(), fakeDate.getMinutes()];
  },
  /*
    Creates a new availability and instantiates time blocks between a start and end date
    @param {MeetingDate}
         @param {startDate} First time block should start here
         @param {endDate} Last time blocke ends here 
    @param {userId} google id of the user who should own this availability
    @param {meetingId} meeting id of the meeting to associate this availability with
    @param {cb} callback upon completion
  */
  initialize : function(mtg_Date, userId, meetingId, cb) {
    //Init a new availability
    var Availability = mongoose.model('Availability', AvailabilitySchema);
    var availability = new Availability();
    availability.googleId = userId;
    availability.meetingId = meetingId;

    //Initialize time blocks between the start date and end date
    availability.initializeTimeBlocks(mtg_Date.start, mtg_Date.end, function(err, blockIds) {
      availability.save(function(err)
      {
        if (err) { 
          logger.error(err);
          throw err;
        }
        cb(err, availability);
      });
    });
  }
};

module.exports = mongoose.model('Availability', AvailabilitySchema);
