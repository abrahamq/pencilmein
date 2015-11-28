var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");
var Availability = require("../app/models/Availability.js");
var User = require("../app/models/User.js");
var Meeting = require("../app/models/Meeting.js");

mongoose.connect('mongodb://localhost/userTestDb');
mongoose.connection.on("open", function(err) {
  mongoose.connection.db.dropDatabase();
});

describe('Meeting tests', function() {
  describe('simple', function() {
    //setup database state 
    it('simple check of making and saving new user', function(done) {
      var user = new User();
      user.googleId = "12345";
      user.googleEmail = "person@gmail.com";
      user.fullname = "John Person";
      user.save(function(err,savedUser){
        assert.equal(err,null);
        assert.equal(savedUser.googleId,"12345");
        done();
      });
    });
  });
  describe('making a meeting', function() {
    //setup database state 
    it('user is making a new meeting', function(done) {
      var user = new User();
      user.googleId = "12345";
      user.googleEmail = "person@gmail.com";
      user.fullname = "John Person";
      var earliestStartDate = new Date(2015,10,3,4,00);
      var latestEndDate= new Date(2015,10,3,5,30);
      user.save(function(err,savedUser){
        var user2 = new User();
        user2.googleId = "69";
        user2.googleEmail = "user2@gmail.com";
        user2.fullName = "user 2";
        user2.save(function(err,newUser2){
          meetingObject = {
            title: "newMeeting", 
            location: "stud", 
            duration: 30,
            earliestStartDate: earliestStartDate,
            latestEndDate: latestEndDate, 
            invitees: [user2]
          };
          user.createMeeting(meetingObject,function(err,mtg){
            done();

          });
        });
      });
    });
  });
});
