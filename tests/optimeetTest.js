var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");
var Availability = require("../app/models/Availability.js");
var Optimeet = require("../app/javascripts/optimeet.js");
var Meeting = require("../app/models/Meeting.js");

mongoose.connect('mongodb://localhost/testAvaDb');
mongoose.connection.on("open", function(err) {
  mongoose.connection.db.dropDatabase();
});

describe('Optimeet', function() {
    describe('getIn', function() {

      it('30 minutes multiple Ins available', function(done) {
        var startDate = new Date(2015,10,3,4,00);
        var endDate = new Date(2015,10,3,8,00);

        var rangeStart = new Date(2015,10,3,4,30);
        var rangeEnd = new Date(2015,10,3,5,30);

        var range2Start = new Date(2015,10,3,6,00);
        var range2End = new Date(2015,10,3,8,00);
        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 30});

        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End]], 'yellow', 'manual', function(err, allIds2) {
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,8);
                      assert.equal(allBlocks[0].color,'green'); //4-4.30
                      assert.equal(allBlocks[1].color,'yellow');//4.30-5
                      assert.equal(allBlocks[2].color,'yellow');//5-5:30
                      assert.equal(allBlocks[3].color,'green'); //5:30-6
                      assert.equal(allBlocks[4].color,'green');//6-6:30
                      assert.equal(allBlocks2[5].color,'yellow');//6:30-7
                      assert.equal(allBlocks2[6].color,'yellow');//7-7:30
                      assert.equal(allBlocks2[7].color,'yellow');//7:30-8
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      var expectedStartDate = new Date(2015,10,3,5,30);
                      var expectedEndDate = new Date(2015,10,3,6,00);
                      assert.equal(expectedStartDate.getTime(), optimal_in.startDate.getTime());
                      assert.equal(expectedEndDate.getTime() , optimal_in.endDate.getTime());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
      
      it('Only squeeze available (no ins available)', function(done) {
        var startDate = new Date(2015,10,3,4,00);
        var endDate = new Date(2015,10,3,8,00);

        var rangeStart = new Date(2015,10,3,4,30);
        var rangeEnd = new Date(2015,10,3,5,30);

        var range2Start = new Date(2015,10,3,6,00);
        var range2End = new Date(2015,10,3,8,00);
        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 60});

        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End]], 'yellow', 'manual', function(err, allIds2) {
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,8);
                      assert.equal(allBlocks[0].color,'green'); //4-4.30
                      assert.equal(allBlocks[1].color,'yellow'); //4.30-5
                      assert.equal(allBlocks[2].color,'yellow'); //5-5:30
                      assert.equal(allBlocks[3].color,'green'); //5:30-6
                      assert.equal(allBlocks[4].color,'green'); //6-6:30
                      assert.equal(allBlocks2[5].color,'yellow'); //6:30-7
                      assert.equal(allBlocks2[6].color,'yellow'); //7-7:30
                      assert.equal(allBlocks2[7].color,'yellow'); //7:30-8
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      var expectedStartDate = new Date(2015,10,3,5,30);
                      var expectedEndDate = new Date(2015,10,3,6,30);                      
                      assert.equal(expectedStartDate.getTime(), optimal_in.startDate.getTime());
                      assert.equal(expectedEndDate.getTime() , optimal_in.endDate.getTime());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    
      it('Multiple In available (not first time block)', function(done) {
        var startDate = new Date(2015,10,3,4,00);
        var endDate = new Date(2015,10,3,8,00);

        var rangeStart = new Date(2015,10,3,4,00);
        var rangeEnd = new Date(2015,10,3,5,00);

        var range2Start = new Date(2015,10,3,6,00);
        var range2End = new Date(2015,10,3,7,00);
        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 60});

        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End]], 'yellow', 'manual', function(err, allIds2) {
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,8);
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      var expectedStartDate = new Date(2015,10,3,7,00);
                      var expectedEndDate = new Date(2015,10,3,8,00);                      
                      assert.equal(expectedStartDate.getTime(), optimal_in.startDate.getTime());
                      assert.equal(expectedEndDate.getTime() , optimal_in.endDate.getTime());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
   
      it('No Ins or squeezes available', function(done) {
        var startDate = new Date(2015,10,3,4,00);
        var endDate = new Date(2015,10,3,8,00);

        var rangeStart = new Date(2015,10,3,4,00);
        var rangeEnd = new Date(2015,10,3,5,30);

        var range2Start = new Date(2015,10,3,6,00);
        var range2End = new Date(2015,10,3,7,30);
        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 60});


        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'red','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End]], 'red', 'manual', function(err, allIds2) {
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,8);
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      assert.equal(optimal_in, null);
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });

      it('Only one In available (not first time block)', function(done) {
        var startDate = new Date(2015,10,3,4,00);
        var endDate = new Date(2015,10,3,8,00);

        var rangeStart = new Date(2015,10,3,4,00);
        var rangeEnd = new Date(2015,10,3,5,00);

        var range2Start = new Date(2015,10,3,6,00);
        var range2End = new Date(2015,10,3,8,00);
        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 60});

        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'red','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End]], 'yellow', 'manual', function(err, allIds2) {
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,8);
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      var expectedStartDate = new Date(2015,10,3,5,00);
                      var expectedEndDate = new Date(2015,10,3,6,00);                      
                      assert.equal(expectedStartDate.getTime(), optimal_in.startDate.getTime());
                      assert.equal(expectedEndDate.getTime() , optimal_in.endDate.getTime());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });

      it('No in, multiple squeeze (not first time block)', function(done) {
        var startDate = new Date(2015,10,3,4,00);
        var endDate = new Date(2015,10,3,8,00);

        var rangeStart = new Date(2015,10,3,4,00);
        var rangeEnd = new Date(2015,10,3,6,00);

        var range2Start = new Date(2015,10,3,4,00);
        var range2End = new Date(2015,10,3,5,00);

        var range3Start = new Date(2015,10,3,6,00);
        var range3End = new Date(2015,10,3,8,00);

        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 60});


        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End], [range3Start, range3End]], 'yellow', 'manual', function(err, allIds2) {
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,8);
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      var expectedStartDate = new Date(2015,10,3,7,00);
                      var expectedEndDate = new Date(2015,10,3,8,00);                      
                      assert.equal(expectedStartDate.getTime(), optimal_in.startDate.getTime());
                      assert.equal(expectedEndDate.getTime() , optimal_in.endDate.getTime());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    
    
      it('best squeeze in last time block', function(done) {
        var startDate = new Date(2015,10,3,4,00);
        var endDate = new Date(2015,10,3,8,00);

        var rangeStart = new Date(2015,10,3,4,00);
        var rangeEnd = new Date(2015,10,3,6,00);

        var range2Start = new Date(2015,10,3,4,00);
        var range2End = new Date(2015,10,3,5,00);

        var range3Start = new Date(2015,10,3,6,00);
        var range3End = new Date(2015,10,3,7,00);

        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 60});


        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End], [range3Start, range3End]], 'yellow', 'manual', function(err, allIds2) {
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,8);
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      var expectedStartDate = new Date(2015,10,3,7,00);
                      var expectedEndDate = new Date(2015,10,3,8,00);                      
                      assert.equal(expectedStartDate.getTime(), optimal_in.startDate.getTime());
                      assert.equal(expectedEndDate.getTime() , optimal_in.endDate.getTime());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });

      it('break ties with distance from 2pm', function(done) {
        var startDate = new Date(2015,10,3,8,00);
        var endDate = new Date(2015,10,3,20,00);

        var rangeStart = new Date(2015,10,3,11,00);
        var rangeEnd = new Date(2015,10,3,13,00);

        var range2Start = new Date(2015,10,3,16,00);
        var range2End = new Date(2015,10,3,18,00);

        var av = new Availability();
        var av2 = new Availability();

        var meeting = new Meeting({earliestStartDate: startDate, duration : 60});


        av.meetingId="newmeet";
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                av2.initializeTimeBlocks(startDate, endDate, function(error, foundBlockList2) {
                  av2.setBlocksInTimeRangesColorAndCreationType([[range2Start, range2End]], 'yellow', 'manual', function(err, allIds2) {  
                    av2.getTimeBlocks(function(e2, allBlocks2) {
                      assert.equal(e,null);
                      assert.equal(allBlocks.length,24);
                      var optimal_in = Optimeet.getIn([allBlocks,allBlocks2], meeting);
                      var expectedStartDate = new Date(2015,10,3,14,00);
                      var expectedEndDate = new Date(2015,10,3,15,00);                      
                      assert.equal(expectedStartDate.getTime(), optimal_in.startDate.getTime());
                      assert.equal(expectedEndDate.getTime() , optimal_in.endDate.getTime());
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });



    });
  
});
