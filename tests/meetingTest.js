var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");
var Availability = require("../app/models/Availability.js");
var User = require("../app/models/User.js");
var Meeting = require("../app/models/Meeting.js");

mongoose.connect('mongodb://localhost/meetingTestDb');
mongoose.connection.on("open", function(err) {
  mongoose.connection.db.dropDatabase();
});

describe('Meeting tests', function() {
  describe('simple', function() {
      //setup database state 
      var meet = new Meeting();
      meet.title = "meeting";
      meet.location = "stud";
      meet.duration = 30;
      meet.earliestStartDate = new Date(2015,10,3,4,00);
      meet.latestEndDate= new Date(2015,10,3,5,30);
      meet.inviteMember("123",function(err,meeting){
        
      });
  });
});