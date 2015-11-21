var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");
var Availability = require("../app/models/Availability.js");

mongoose.connect('mongodb://localhost/testfdb');
mongoose.connection.on("open", function(err) {
  mongoose.connection.db.dropDatabase();
});
describe('Simple Availability', function() {
  describe('availability make', function() {
      //setup database state 
      var av = new Availability();
      av.meetingId="newmeet";
      
      it ('av has meeting name', function(){
        assert.equal(av.meetingId, 'newmeet');
      });
  
      
      it('should find av', function(done) {
          av.save(function(){
            Availability.getAvailability(av._id, function(err,foundAv){
              assert.equal(foundAv.meetingId, 'newmeet');
              done();
            });
          });
      });

  });
});

describe('Add single block', function() {
  describe('adding single block', function() {
      //setup database state 
      var av = new Availability();
      av.meetingId="newmeet";
      console.log("before");
      it('should return block', function(done) {
      av.save(function(){
        console.log('in av save');
          av.addTimeBlock(function(error,record){
              assert.equal(error,null);
              assert.equal(record.color,'red');
              done();
          });
        });
      });
  });
});
describe('initialize time blocks', function() {
  describe('initializing availability with 3 time blocks', function() {
      //setup database state 
      var startDate = new Date(2015,10,3,4,00);
      var endDate = new Date(2015,10,3,5,30);
      var av = new Availability();
      av.meetingId="newmeet";
      it('should return block', function(done) {
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
              assert.equal(error,null);
              assert.equal(foundBlockList.length,3);
              assert.equal(av.startDate.getTime(),startDate.getTime());
              done();
          });
        });
      });
  });
  describe('initializing time blocks for entire day', function() {
      //setup database state 
      var startDate = new Date(2015,10,3,4,00);
      var endDate = new Date(2015,10,4,4,00);
      var av = new Availability();
      av.meetingId="newmeet";
      it('should return block', function(done) {
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            assert.equal(error,null);
            assert.equal(foundBlockList.length,48);
            assert.equal(av.startDate.getTime(),startDate.getTime());
            done();
          });
        });
      });
  });
});
describe('check block id lookup based on time', function() {
  describe('lookup from 3 time blocks', function() {
      //setup database state 
      var start = new Date(2015,10,3,4,00);
      var end = new Date(2015,10,3,5,30);
      var time = new Date(start);
      var av = new Availability();
      it('should find correct id', function(done) {
        av.save(function(){
          av.initializeTimeBlocks(start,end,function(error,foundBlockList){
              // console.log("time is ",time, " start is ",start);
              // console.log(foundBlockList);
              assert.equal(error,null);
              assert.equal(foundBlockList.length,3);
              var firstId = foundBlockList[0];
              assert.equal(av.getIdForBlockAtTime(time),firstId);

              // var secondId = foundBlockList[1];
              // var minutes = time.getMinutes();
              // time.setMinutes(minutes+30);
              // assert.equal(av.getIdForBlockAtTime(time),secondId);
              done();
          });
        });
      });
  });
});
