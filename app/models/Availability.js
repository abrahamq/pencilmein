//Availability 
var mongoose = require('mongoose');
var TimeBlock = require('./TimeBlock');
var AvailabilitySchema = mongoose.Schema({
	meetingId : String,
	timeBlocks : [{
        type: mongoose.Schema.ObjectId,
        ref: 'TimeBlock' 
    }],
});
AvailabilitySchema.methods = 
{
  initializeAvailability : function(startDate,endDate){
    var numBlocks = Math.floor((endDate - startDate)/1800000); //splits into 30 min blocks
    for (i=0 ; i < numBlocks ; i++){
      var newTimeBlock =  new TimeBlock();
      newTimeBlock.startDate = new Date(startDate);
      this.timeBlocks.push(newTimeBlock);
      var minutes = startDate.getMinutes();
      startDate.setMinutes(minutes+30);
    }
  },
  getBlockAtTime : function(time){
    if (time - startDate < 0 || time - endDate > 0){ //if the time is outside the availibility
      return null;
    }
    var blockNum = Math.floor((time-startDate)/1800000)-1;
    return this.timeBlocks[blockNum];
  },
  setAvailableBlockAtTime : function(time){
    if (time - startDate < 0 || time - endDate > 0){ //if the time is outside the availibility
      return false;
    }
    var blockNum = Math.floor((time-startDate)/1800000)-1;
    var block = this.timeBlocks[blockNum];
    block.color = 'green';
  },
  setUnvailableBlockAtTime : function(time){
    if (time - startDate < 0 || time - endDate > 0){ //if the time is outside the availibility
      return false;
    }
    var blockNum = Math.floor((time-startDate)/1800000)-1;
    var block = this.timeBlocks[blockNum];
    block.color = 'red';
  },
  setPossibleBlockAtTime : function(time){
    if (time - startDate < 0 || time - endDate > 0){ //if the time is outside the availibility
      return false;
    }
    var blockNum = Math.floor((time-startDate)/1800000)-1;
    var block = this.timeBlocks[blockNum];
    block.color = 'yellow';
  }
};

module.exports = mongoose.model('Availability', AvailabilitySchema);
