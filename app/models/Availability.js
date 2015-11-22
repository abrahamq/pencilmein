//Availability 
var mongoose = require('mongoose');
var TimeBlock = require('./TimeBlock');
var AvailabilitySchema = mongoose.Schema({
	meetingId : String,
  googleId: String,
	timeBlocks : [{
        type: mongoose.Schema.ObjectId,
        ref: 'TimeBlock' 
  }]
});
AvailabilitySchema.methods = 
{ 
  /*
  Basically just a tester function to add and save a time block
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
  @param cb: arg1) error arg2) list of time block objects that correspond to this availabilites time blocks
  */
  getTimeBlocks: function(cb){
    var allIds = this.timeBlocks;
    TimeBlock.getTimeBlocks(allIds,function(err,foundBlocks){
      cb(err,foundBlocks);
    });
  },
  /*
  Initializes an availabilities time block list to be green time blocks, 
  each representing 30 minutes of time,
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
      cb({msg: "time is outside of availability range"});
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
    // console.log("start date: ",startDate," end date: ",endDate);
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
    // console.log("start date: ",startDate," end date: ",endDate);
    if (timeRanges.length==0){
      return cb(null,this.timeBlocks);
    }
    var availability = this;
    var currentRange = timeRanges[0].slice();
    var nextRanges = timeRanges.slice(1);
    this.setBlocksInTimeRangeColorAndCreationType(currentRange[0],currentRange[1],newColor,newCreationType,function(err,allIds){
      availability.setBlocksInTimeRangesColorAndCreationType(nextRanges, newColor, newCreationType, cb);
    });
  }
};

AvailabilitySchema.statics = 
{   
    /*
    @param idObject availabiltyId: 
    @result Availabilty object
    */
    findByAvailabilityId : function(availabilityId,cb){
      this.model('Availability').findById(availabilityId,cb);
    }, 
    /*
    @param String meetId
    @result Availability object
    */
    findByMeetingId: function(meetId, cb){
      this.model('Availability').find({meetingId: meetId},cb);
    },
    /*
    @param String googleId
    @result Availability object
    */
    findByGoogleId: function(googId, cb){
      this.model('Availability').find({googleId: googId},cb);
    }, 
        /*
    @param String googleId
    @result Availability object
    */
    findByGoogleIdAndMeetingId: function(googId, meetId, cb){
      this.model('Availability').findOne({googleId: googId, meetingId: meetId},cb);
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
    /*
    @param availabilities: list of Availabilities
    @param cb: arg1) err, arg2) list of lists of time blocks
    callback will finally be given the list of lists of time blocks, each list corresponds to 
    an availability and is all of the time blocks that that av. contains
    */
    getTimeBlocksListsForAvailabilities: function(availabilities, cb){
      //this.model('Availability').findById(availabilities,cb);
      this.model('Availability').getTimeBlocksListsForAvailabilitiesRecurse(availabilities,[],cb);
    }

};

module.exports = mongoose.model('Availability', AvailabilitySchema);
