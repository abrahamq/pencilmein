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
    var startD = new Date(startDate);
    var availability = this; 
    if (startD>=endDate){
      var minutes = endDate.getMinutes();
      this.startDate = new Date(endDate);
      this.startDate.setMinutes(minutes - 30*this.timeBlocks.length);
      return cb(null,this.timeBlocks);
    }
    var numBlocks = Math.floor((endDate - startD)/1800000); //splits into 30 min blocks
    var newBlock = new TimeBlock();
    newBlock.startDate = startD;

    this.timeBlocks.push(newBlock._id);
    var minutes = startD.getMinutes();
    startD.setMinutes(minutes+30);

    newBlock.save(function(){
      availability.initializeTimeBlocks(startD,endDate,cb);
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
  }

};

AvailabilitySchema.statics = 
{
    getAvailability : function(availabilityId,cb){
        this.model('Availability').findById(availabilityId,cb);
    }   
};

module.exports = mongoose.model('Availability', AvailabilitySchema);
