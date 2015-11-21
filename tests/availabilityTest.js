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
describe('initialize single block', function() {
  describe('initializing single block', function() {
      //setup database state 
      var startDate = new Date(2015,10,3,4,00);
      var endDate = new Date(2015,10,3,5,30);
      var av = new Availability();
      av.meetingId="newmeet";
      console.log("before");
      it('should return block', function(done) {
      av.save(function(){
        console.log('in av save');
          av.initializeTimeBlock(startDate,endDate,function(error,foundBlock){
              assert.equal(error,null);
              assert.equal(foundBlock.color,'green');
              assert.equal(foundBlock.startDate.getDate(),startDate.getDate());
              done();
          });
        });
      });
  });
});
describe('initialize single blocks', function() {
  describe('initializing single blocks', function() {
      //setup database state 
      var startDate = new Date(2015,10,3,4,00);
      var endDate = new Date(2015,10,3,5,30);
      var av = new Availability();
      av.meetingId="newmeet";
      it('should return block', function(done) {
      av.save(function(){
        console.log('in av save');
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
              assert.equal(error,null);
              assert.equal(foundBlockList.length,1);
              done();
          });
        });
      });
  });
});

// describe('Availability', function() {
//   describe('#testAvail', function() {
//       //setup database state 
//       var avail = new Availability();
//       var startDate = new Date(2015,10,3,4,00);
//       var endDate = new Date(2015,10,3,5,30);
//       console.log("About to save");
//       (new TimeBlock()).save(function(){ console.log("WORK")});
//       avail.initializeTimeBlocks(startDate,endDate,function(err,res){
        
//         it ('init avail', function(done){
//           assert.equal(err,null);
//           console.log("HDSLKDJFL");
//           // assert.equal(avail.timeBlocks.length, 3);
//           // console.log(avail.timeBlocks);
//           done();
//         }); 
//       });

//       // it ('get block', function(done){
//       //   var start = new Date(2015,10,3,4,00);
//       //   var firstBlock = avail.getBlockAtTime(start,function(err,res){
//       //     if (err==null){
//       //       assert.equal(res,'fuck');
//       //       done();
//       //     }
//       //     else{
//       //       console.log(err.msg);
//       //       done();
//       //     }
//       //   });
//       //   //assert.equal(avail.timeBlocks.length, 3);
//       //   // assert.equal(firstBlock,'green');
//       // });

//   });
// });

