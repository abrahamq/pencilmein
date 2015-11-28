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
  describe('making a meeting and inviting ', function() {
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
          user.createMeeting("newMeeting","stud",30,earliestStartDate,latestEndDate,[user2.googleEmail],function(mtgId){
            Meeting.findById(mtgId,function(err,meeting){
              assert.equal(meeting.invitedMembers.length,2);
              assert.equal(meeting.respondedMembers.length,0);
              done();
            });
          });
        });
      });
    });
  });
  describe('making a meeting and testing responding', function() {
    //setup database state 
    var user = new User();
    user.googleId = "12345";
    user.googleEmail = "person@gmail.com";
    user.fullname = "John Person";
    var earliestStartDate = new Date(2015,10,3,4,00);
    var latestEndDate= new Date(2015,10,3,5,30);
    var user2 = new User();
    user2.googleId = "69";
    user2.googleEmail = "user2@gmail.com";
    user2.fullName = "user 2";
    it('testing single response', function(done) {
      user.save(function(err,savedUser){
        user2.save(function(err,newUser2){
          user.createMeeting("newMeeting","stud",30,earliestStartDate,latestEndDate,[user2.googleEmail],function(mtgId){
            Meeting.findById(mtgId,function(err,meeting){
              meeting.recordMemberResponse("69",function(err,foundMeeting){
                assert.equal(foundMeeting.respondedMembers.length,1);
                assert.equal(foundMeeting.invitedMembers.length,2);
                done();
              });
            });
          });
        });
      });
    });
    it('testing double response, second shouldnt be recorded', function(done) {
      user.save(function(err,savedUser){
        user2.save(function(err,newUser2){
          user.createMeeting("newMeeting","stud",30,earliestStartDate,latestEndDate,[user2.googleEmail],function(mtgId){
            Meeting.findById(mtgId,function(err,meeting){
              meeting.recordMemberResponse("69",function(err,foundMeeting){
                meeting.recordMemberResponse("69",function(err,foundMeeting2){
                assert.equal(foundMeeting2.respondedMembers.length,1);
                assert.equal(foundMeeting2.invitedMembers.length,2);
                done();
              });
              });
            });
          });
        });
      });
    });
    it('testing 2 separate responses, both should be recorded', function(done) {
      user.save(function(err,savedUser){
        user2.save(function(err,newUser2){
          user.createMeeting("newMeeting","stud",30,earliestStartDate,latestEndDate,[user2.googleEmail],function(mtgId){
            Meeting.findById(mtgId,function(err,meeting){
              meeting.recordMemberResponse("69",function(err,foundMeeting){
                meeting.recordMemberResponse("12345",function(err,foundMeeting2){
                  assert.equal(foundMeeting2.respondedMembers.length,2);
                  assert.equal(foundMeeting2.invitedMembers.length,2);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
  describe('making a meeting and testing responding', function() {
    //setup database state 
    var user = new User();
    user.googleId = "12345";
    user.googleEmail = "person@gmail.com";
    user.fullname = "John Person";
    var earliestStartDate = new Date(2015,10,3,4,00);
    var latestEndDate= new Date(2015,10,3,5,30);
    var user2 = new User();
    user2.googleId = "69";
    user2.googleEmail = "user2@gmail.com";
    user2.fullName = "user 2";
    it('testing 2 separate responses, both should be recorded', function(done) {
      user.save(function(err,savedUser){
        user2.save(function(err,newUser2){
          user.createMeeting("newMeeting","stud",30,earliestStartDate,latestEndDate,[user2.googleEmail],function(mtgId){
            Meeting.findById(mtgId,function(err,meeting){
              meeting.invitedMembers[0]=="user2@gmail.com";
              meeting.invitedMembers[1]=="person@gmail.com";
              done();
            });
          });
        });
      });
    });
  });
});