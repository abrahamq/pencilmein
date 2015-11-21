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
    newBlock.color = 'red';
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
  */
  initializeTimeBlocks: function(start,endDate,cb){
    // this.startDate = startDate;
    this.endDate = endDate;
    var startDate = new Date(start);
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
    var minutes = startDate.getMinutes();
    startDate.setMinutes(minutes+30);

    newBlock.save(function(){
      availability.initializeTimeBlocks(startDate,endDate,cb);
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
  setBlockAtTimeColor: function(time,newColor,cb){
    if (time - this.startDate < 0 || time - this.endDate > 0){ //if the time is outside the availibility
      cb({msg: "time is outside of availability range"});
    }
    var blockId = this.getIdForBlockAtTime(time);
    TimeBlock.setTimeBlockColor(blockId,newColor,cb);
  },
  setBlockAtTimeCreationType: function(time,newCreationType,cb){
    if (time - this.startDate < 0 || time - this.endDate > 0){ //if the time is outside the availibility
      cb({msg: "time is outside of availability range"});
    }
    var blockId = this.getIdForBlockAtTime(time);
    TimeBlock.setTimeBlockCreationType(blockId,newCreationType,cb);
  }
};
AvailabilitySchema.statics = 
{
    getAvailability : function(availabilityId,cb){
        this.model('Availability').findById(availabilityId,cb);
    }   
};

module.exports = mongoose.model('Availability', AvailabilitySchema);
