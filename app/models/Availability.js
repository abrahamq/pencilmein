//Availability 
var mongoose = require('mongoose');
var Availability = mongoose.Schema({
	meetingName : String,
	timeBlocks : [{}]
});
