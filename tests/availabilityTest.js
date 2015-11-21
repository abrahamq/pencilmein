var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");
var Availability = require("../app/models/Availability.js");

mongoose.connect('mongodb://localhost/testAvDb');
mongoose.connection.on("open", function(err) {
  mongoose.connection.db.dropDatabase();
});
// beforeEach(function (done) {

// function clearDB() {
//   for (var i in mongoose.connection.collections) {
//     mongoose.connection.collections[i].remove(function() {});
//   }
//   return done();
// }

// if (mongoose.connection.readyState === 0) {
//   mongoose.connect('mongodb://localhost/test', function (err) {
//     if (err) {
//       throw err;
//     }
//     return clearDB();
//   });
// } else {
//   return clearDB();
// }
// });

// afterEach(function (done) {
// mongoose.disconnect();
// return done();
// });

describe('Simple Availability', function() {
  describe('make new availability', function() {
    //setup database state 
    var av = new Availability();
    av.meetingId="newmeet";
    
    it ('availability has meeting name that was just set', function(){
      assert.equal(av.meetingId, 'newmeet');
    });
    it('should find availability in database', function(done) {
      av.save(function(){
        Availability.getAvailability(av._id, function(err,foundAv){
          assert.equal(foundAv.meetingId, 'newmeet');
          done();
        });
      });
    });

  });
});
//THIS IS A BULLSHIT TEST TO CHECK SIMPLE ADD TIME BLOCK FN
describe('Add single block', function() {
  describe('adding single block', function() {
      //setup database state 
      var av = new Availability();
      av.meetingId="newmeet";
      it('should return block', function(done) {
      av.save(function(){
        av.addTimeBlock(function(error,record){
          assert.equal(error,null);
          assert.equal(record.color,'green');
          done();
        });
        });
      });
  });
});
describe('Initialize availabilities time blocks', function() {
  describe('initializing availability with 3 time blocks', function() {
    //setup database state 
    var startDate = new Date(2015,10,3,4,00);
    var endDate = new Date(2015,10,3,5,30);
    var av = new Availability();
    av.meetingId="newmeet";
    it('should return block list with 3 ids and avail. should have right start time', function(done) {
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
  describe('initializing availability with 3 time blocks', function() {
    //setup database state 
    var startDate = new Date(2015,10,3,4,00);
    var endDate = new Date(2015,10,3,5,30);
    var av = new Availability();
    av.meetingId="newmeet";
    it('Getting all blocks based on list of ids', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
          TimeBlock.getTimeBlocks(foundBlockList,function(err,foundBlocks){
            assert.equal(err,null);
            assert.equal(foundBlocks.length,3);
            done();
          });
        });
      });
    });
  });
  describe('Checking set start times of initialized blocks', function() {
      //setup database state 
      var startDate = new Date(2015,10,3,4,00);
      var secondStartDate = new Date(2015,10,3,4,30);
      var thirdStartDate = new Date(2015,10,3,5,00);
      var newTime = new Date(startDate);
      var endDate = new Date(2015,10,3,5,30);
      var avv = new Availability();
      avv.meetingId="newmeet";
      it('block starts should start at start date, last one starts 30 mins before end date', function(done) {
        avv.save(function(){
          avv.initializeTimeBlocks(startDate,endDate,function(error,allIds){
            TimeBlock.getTimeBlocks(allIds,function(e,allBlocks){
              assert.equal(avv.startDate.getTime(),startDate.getTime());
              assert.equal(avv.endDate.getTime(),endDate.getTime());
              assert.equal(e,null);
              assert.equal(allBlocks.length,3);
              assert.equal(allBlocks[0].color,'green');
              assert.equal(allBlocks[0].startDate.getTime(),startDate.getTime());
              assert.equal(allBlocks[1].startDate.getTime(),secondStartDate.getTime());
              assert.equal(allBlocks[2].startDate.getTime(),thirdStartDate.getTime());
              done();
            });
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
      it('should return block list for entire day and avail. keeps good start time', function(done) {
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
  describe('lookup each block from 3 time blocks', function() {
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

            var secondId = foundBlockList[1];
            var minutes = time.getMinutes();
            time.setMinutes(minutes+30);
            assert.equal(av.getIdForBlockAtTime(time),secondId);

            var thirdId = foundBlockList[2];
            var minutes = time.getMinutes();
            time.setMinutes(minutes+30);
            assert.equal(av.getIdForBlockAtTime(time),thirdId);
            done();
          });
        });
      });
  });

});
describe('Editing SINGLE time block', function() {
  describe('editing first of 3 time blocks', function() {
      //setup database state 
      var startDate = new Date(2015,10,3,4,00);
      var newTime = new Date(startDate);
      var endDate = new Date(2015,10,3,5,30);
      var avv = new Availability();
      avv.meetingId="newmeet";
      it('should return block with new yellow color', function(done) {
        avv.save(function(){
          avv.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            avv.setBlockAtTimeColorAndCreationType(newTime,'yellow','manual',function(err,finalBlock){
              assert.equal(err,null);
              assert.equal(finalBlock.color,'yellow');
              assert.equal(finalBlock.creationType,'manual');
              done();
            });
          });
        });
      });
  });
});
describe('Editing RANGE of time blocks', function() {
  describe('Total 3 time blocks', function() {
    //setup database state 
    var startDate = new Date(2015,10,3,4,00);
    var endDate = new Date(2015,10,3,5,30);
    //makes blocks [4-4:30],[4:30-5],[5-5:30]
    var rangeStart = new Date(2015,10,3,4,00);
    var rangeEnd = new Date(2015,10,3,5,30);

    var av = new Availability();
    av.meetingId="newmeet";
    it('Editing all 3 to yellow', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangeColorAndCreationType(rangeStart, rangeEnd, 'yellow','manual',function(err,allIds){
              TimeBlock.getTimeBlocks(allIds,function(e,allBlocks){
                // console.log(foundBlockList);
                // console.log(allBlocks);
                assert.equal(e,null);
                assert.equal(allBlocks.length,3);
                assert.equal(allBlocks[0].color,'yellow');
                assert.equal(allBlocks[1].color,'yellow');
                assert.equal(allBlocks[2].color,'yellow');
                done();
              });
            });

          });
        });
      });
    });
    // describe('Finding blocks in range from 48 blocks', function() {
    // //setup database state 
    // var startDate = new Date(2015,10,3,4,00);
    // var endDate = new Date(2015,10,4,4,00);

    // var rangeStart = new Date(2015,10,3,4,00);
    // var rangeEnd = new Date(2015,10,3,5,30);
    // var av = new Availability();
    // av.meetingId="newmeet";
    // it('Changing 48 blocks in all', function(done) {
    //   av.save(function(){
    //     av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
    //         av.setBlocksInTimeRangeColorAndCreationType(rangeStart, rangeEnd, 'yellow','manual',function(err,allIds){
    //           TimeBlock.getTimeBlocks(allIds,function(e,allBlocks){
    //             //console.log(allBlocks);
    //             assert.equal(e,null);
    //             assert.equal(allBlocks.length,48);
    //             assert.equal(allBlocks[0].color,'yellow');
    //             done();
    //           })
    //         });

    //       });
    //     });
    //   });
    // });
  // describe('editing all of 3 time blocks', function() {
  //     //setup database state 
  //     var startDate = new Date(2015,10,3,4,00);
  //     var newTime = new Date(startDate);
  //     var endDate = new Date(2015,10,3,5,30);
  //     var avv = new Availability();
  //     avv.meetingId="newmeet";
  //     it('all should turn red and manual', function(done) {
  //       avv.save(function(){
  //         avv.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
  //           avv.setBlocksInTimeRangeColorAndCreationType(newTime,endDate,'red','manual',function(err,res){
  //             TimeBlock.getTimeBlocks(foundBlockList,function(err,foundBlocks){
  //               assert.equal(err,null);
  //               assert.equal(foundBlocks.length,3);
  //               assert.equal(foundBlocks[0].color,'red');
  //               assert.equal(foundBlocks[1].color,'red');
  //               // assert.equal(foundBlocks[2].color,'red');
  //               // console.log(foundBlocks);
  //               done();
  //             });
  //           });
  //         });
  //       });
  //     });
  // });
});
