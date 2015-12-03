var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");
var Availability = require("../app/models/Availability.js");

mongoose.connect('mongodb://localhost/testAvaDb');
mongoose.connection.on("open", function(err) {
  mongoose.connection.db.dropDatabase();
});
describe('Simple Availability', function() {
  describe('make new availability', function() {
    //setup database state 
    var av = new Availability();
    av.meetingId="newmeet";
    av.googleId="kwefah";
    it ('availability has meeting name that was just set', function(){
      assert.equal(av.meetingId, 'newmeet');
    });
    it('should find availability in database by id', function(done) {
      av.save(function(){
        Availability.findByAvailabilityId(av._id, function(err,foundAv){
          assert.equal(foundAv.meetingId, 'newmeet');
          assert.equal(foundAv.googleId, 'kwefah');
          done();
        });
      });
    });
    it('should find availability in database by meeting id', function(done) {
      av.save(function(){
        Availability.findByMeetingId('newmeet', function(err,foundAvs){
          assert.equal(foundAvs[0].meetingId, 'newmeet');
          assert.equal(foundAvs[0].googleId, 'kwefah');
          done();
        });
      });
    });
    it('should find availability in database by google id id', function(done) {
      av.save(function(){
        Availability.findByGoogleId('kwefah', function(err,foundAvs){
          assert.equal(foundAvs[0].meetingId, 'newmeet');
          assert.equal(foundAvs[0].googleId, 'kwefah');
          done();
        });
      });
    });
    it('should find availability in database by google id and meeting id', function(done) {
      av.save(function(){
        Availability.findByGoogleIdAndMeetingId('kwefah','newmeet', function(err,foundAv){
          assert.equal(foundAv.meetingId, 'newmeet');
          assert.equal(foundAv.googleId, 'kwefah');
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
          assert.equal(av.endDate.getTime(),endDate.getTime());
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
          // TimeBlock.getTimeBlocks(foundBlockList,function(err,foundBlocks){
          //   assert.equal(err,null);
          //   assert.equal(foundBlocks.length,3);
          //   done();
          // });
          av.getTimeBlocks(function(err,foundBlocks){
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
            avv.getTimeBlocks(function(e,allBlocks){
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
  describe('test static lookup of blocks from list of availabilites w just one av.', function() {
    //setup database state 
    var start = new Date(2015,10,3,4,00);
    var end = new Date(2015,10,3,5,30);
    var time = new Date(start);
    var av = new Availability();
    var Av = Availability;
    av.meetingId = "newmeet";
    av.googleId = "kwefah";
    it('should find correct id', function(done) {
      av.initializeTimeBlocks(start,end,function(error,foundBlockList){
        av.save(function(){
          Availability.getTimeBlocksListsForAvailabilities([av],function(err,blocksLists){
            assert.equal(err,null);
            assert.equal(blocksLists.length,1);
            assert.equal(blocksLists[0].length,3);
            assert.equal(blocksLists[0][0].startDate.getTime(),start.getTime());
            done();
          });
        });
      });
    });
  });
  describe('test static lookup of blocks from list of availabilites with 2 avs', function() {
    //setup database state
    var start = new Date(2015,10,3,4,00);
    var end = new Date(2015,10,3,5,30);
    var time = new Date(start);
    var av = new Availability();
    var av2 = new Availability();
    av.meetingId = "newmeet";
    av.googleId = "kwefah";
    av2.meetingId = "newmeet2";
    av2.googleId = "kwefah";
    it('should find correct id', function(done) {
      av.initializeTimeBlocks(start,end,function(error,foundBlockList){
        av.save(function(){
          av2.initializeTimeBlocks(start,end,function(error2, founcBlockList2){
            av2.save(function(){
              Availability.getTimeBlocksListsForAvailabilities([av,av2],function(err,blocksLists){
                assert.equal(err,null);
                assert.equal(blocksLists.length,2);
                assert.equal(blocksLists[0].length,3);
                assert.equal(blocksLists[0][0].startDate.getTime(),start.getTime());
                assert.equal(blocksLists[1].length,3);
                assert.equal(blocksLists[1][0].startDate.getTime(),start.getTime());
                done();
              }); 
            });
          })
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
describe('Editing SINGLE RANGE of time blocks', function() {
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
              av.getTimeBlocks(function(e,allBlocks){
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
  describe('Finding blocks in range from 48 blocks', function() {
    //setup database state 
    var startDate = new Date(2015,10,3,4,00);
    var endDate = new Date(2015,10,4,4,00);

    var rangeStart = new Date(2015,10,3,4,30);
    var rangeEnd = new Date(2015,10,3,5,30);
    var av = new Availability();
    av.meetingId="newmeet";
    it('Changing 48 blocks in all', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
          av.setBlocksInTimeRangeColorAndCreationType(rangeStart, rangeEnd, 'yellow','manual',function(err,allIds){
            av.getTimeBlocks(function(e,allBlocks){
              assert.equal(e,null);
              assert.equal(allBlocks.length,48);
              assert.equal(allBlocks[0].color,'green');
              assert.equal(allBlocks[1].color,'yellow');
              assert.equal(allBlocks[2].color,'yellow');
              assert.equal(allBlocks[3].color,'green');
              done();
            });
          });
        });
      });
    });
  });
});

describe('Editing MULTIPLE RANGES of time blocks', function() {
  describe('Single Range of multiple time tal 3 time blocks', function() {
    //setup database state 
    var startDate = new Date(2015,10,3,4,00);
    var endDate = new Date(2015,10,3,5,30);
    //makes blocks [4-4:30],[4:30-5],[5-5:30]
    var rangeStart = new Date(2015,10,3,4,30);
    var rangeEnd = new Date(2015,10,3,5,30);

    var av = new Availability();
    av.meetingId="newmeet";
    it('Editing over single range with new function, second 2 to yellow', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                assert.equal(e,null);
                assert.equal(allBlocks.length,3);
                assert.equal(allBlocks[0].color,'green');
                assert.equal(allBlocks[1].color,'yellow');
                assert.equal(allBlocks[2].color,'yellow');
                done();
              });
            });
          });
        });
      });
    });
    describe('Editing multiple ranges in 48 blocks', function() {
      //setup database state 
      var startDate = new Date(2015,10,3,4,00);
      var endDate = new Date(2015,10,4,4,00);

      var rangeStart = new Date(2015,10,3,4,30);
      var rangeEnd = new Date(2015,10,3,5,30);

      var range2Start = new Date(2015,10,3,6,30);
      var range2End = new Date(2015,10,3,8,00);
      var av = new Availability();
      av.meetingId="newmeet";
      it('Changing 48 blocks in all', function(done) {
        av.save(function(){
          av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd],[range2Start, range2End]], 'yellow','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                assert.equal(e,null);
                assert.equal(allBlocks.length,48);
                assert.equal(allBlocks[0].color,'green'); //4-4.30
                assert.equal(allBlocks[1].color,'yellow');//4.30-5
                assert.equal(allBlocks[2].color,'yellow');//5-5:30
                assert.equal(allBlocks[3].color,'green'); //5:30-6
                assert.equal(allBlocks[4].color,'green');//6-6:30
                assert.equal(allBlocks[5].color,'yellow');//6:30-7
                assert.equal(allBlocks[6].color,'yellow');//7-7:30
                assert.equal(allBlocks[7].color,'yellow');//7:30-8
                assert.equal(allBlocks[8].color,'green');//8-8:30
                done();
              });
            });
          });
        });
      });
    });
});

describe('Checking creation type power', function() {
    //setup database state 
  var startDate = new Date(2015,10,3,4,00);
  var endDate = new Date(2015,10,3,5,30);
  //makes blocks [4-4:30],[4:30-5],[5-5:30]
  var rangeStart = new Date(2015,10,3,4,30);
  var rangeEnd = new Date(2015,10,3,5,30);

  var av = new Availability();
  av.meetingId="newmeet";
  //setup database state 
  var startDate = new Date(2015,10,3,4,00);
  var endDate = new Date(2015,10,4,4,00);

  var rangeStart = new Date(2015,10,3,4,30);
  var rangeEnd = new Date(2015,10,3,5,30);

  var range2Start = new Date(2015,10,3,6,30);
  var range2End = new Date(2015,10,3,8,00);
  describe('Shouldnt be able to alter blocks with stronger creation type', function() {
    var av = new Availability();
    av.meetingId="newmeet";
    it('Calendar won"t overrite manual', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
          av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd],[range2Start, range2End]], 'yellow','general',function(err,allIds){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd],[range2Start, range2End]], 'red','calendar',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                assert.equal(e,null);
                assert.equal(allBlocks.length,48);
                assert.equal(allBlocks[0].color,'green'); //4-4.30
                assert.equal(allBlocks[1].color,'yellow');//4.30-5
                assert.equal(allBlocks[2].color,'yellow');//5-5:30
                assert.equal(allBlocks[3].color,'green'); //5:30-6
                assert.equal(allBlocks[4].color,'green');//6-6:30
                assert.equal(allBlocks[5].color,'yellow');//6:30-7
                assert.equal(allBlocks[6].color,'yellow');//7-7:30
                assert.equal(allBlocks[7].color,'yellow');//7:30-8
                assert.equal(allBlocks[8].color,'green');//8-8:30
                done();
              });
            });
          });
        });
      });
    });
  });
  describe('Should be able to alter blocks with weaker creation type', function() {
    var av = new Availability();
    av.meetingId="newmeet";
    it('Calendar won"t overrite manual', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate,endDate,function(error,foundBlockList){
          av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd],[range2Start, range2End]], 'yellow','general',function(err,allIds){
            av.setBlocksInTimeRangesColorAndCreationType([[rangeStart, rangeEnd],[range2Start, range2End]], 'red','manual',function(err,allIds){
              av.getTimeBlocks(function(e,allBlocks){
                assert.equal(e,null);
                assert.equal(allBlocks.length,48);
                assert.equal(allBlocks[0].color,'green'); //4-4.30
                assert.equal(allBlocks[1].color,'red');//4.30-5
                assert.equal(allBlocks[2].color,'red');//5-5:30
                assert.equal(allBlocks[3].color,'green'); //5:30-6
                assert.equal(allBlocks[4].color,'green');//6-6:30
                assert.equal(allBlocks[5].color,'red');//6:30-7
                assert.equal(allBlocks[6].color,'red');//7-7:30
                assert.equal(allBlocks[7].color,'red');//7:30-8
                assert.equal(allBlocks[8].color,'green');//8-8:30
                done();
              });
            });
          });
        });
      });
    });
  });
});

describe('Testing General Pref Helper Functions', function() {
  describe('Testing getting found time ranges given single day preference, part of single day availabilty', function() {
    var av = new Availability();
    var startDate = new Date(2015, 10, 1, 4);
    var endDate = new Date(2015, 10, 1, 11);
    it('should clip for start date and end date', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate, endDate, function(err, founcBlockList){
          var preferences = [{'day':0, 'startHour':0, 'startMinute':30, 'endHour':11,'endMinute':30}];
          var ranges = av.getTimeRangesForDayPreferences(preferences);
          assert.equal(ranges.length, 1);
          assert.equal(ranges[0][0].getTime(), startDate.getTime());
          assert.equal(ranges[0][1].getTime(), endDate.getTime());
          done();
        });
      });
    });
  });
  describe('Testing getting found time ranges given single day preference, availabilty our of range of general pref', function() {
    var av = new Availability();
    var startDate = new Date(2015, 10, 1, 4);
    var endDate = new Date(2015, 10, 1, 11);
    it('should clip for start date and end date', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate, endDate, function(err, founcBlockList){
          var preferences = [{'day':0, 'startHour':12, 'startMinute':30, 'endHour':21,'endMinute':30}];
          var ranges = av.getTimeRangesForDayPreferences(preferences);
          assert.equal(ranges.length, 0);
          done();
        });
      });
    });
  });
  describe('Testing getting found time ranges given single day preference, multiple day availabilty', function() {
    var av = new Availability();
    var startDate = new Date(2015, 10, 1, 4);
    var endDate = new Date(2015, 10, 29, 11);
    it('should clip for start date and end date', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate, endDate, function(err, founcBlockList){
          var preferences = [{'day':0, 'startHour':1, 'startMinute':30, 'endHour':11,'endMinute':30}];
          var ranges = av.getTimeRangesForDayPreferences(preferences);
          assert.equal(ranges.length, 5);
          assert.equal(ranges[0][0].getTime(), startDate.getTime());
          assert.equal(ranges[0][1].getHours(), 11);
          assert.equal(ranges[0][1].getMinutes(), 30);

          for (var i = 1 ; i < 4 ; i++){
            assert.equal(ranges[i][0].getHours(), 1);
            assert.equal(ranges[i][0].getMinutes(), 30);
            assert.equal(ranges[i][1].getHours(), 11);
            assert.equal(ranges[i][1].getMinutes(), 30);
          }

          assert.equal(ranges[4][0].getHours(), 1);
          assert.equal(ranges[4][0].getMinutes(), 30);
          assert.equal(ranges[4][1].getTime(),endDate.getTime());
          done();
        });
      });
    });
  });
  describe('Testing getting found time ranges given with day preferences (but only one), multiple day availabilty', function() {
    var av = new Availability();
    var startDate = new Date(2015, 10, 1, 4);
    var endDate = new Date(2015, 10, 29, 11);
    it('should clip for start date and end date', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate, endDate, function(err, founcBlockList){
          var preferences = [{'day':0, 'startHour':1, 'startMinute':30, 'endHour':11,'endMinute':30}];
          var ranges = av.getTimeRangesForDayPreferences(preferences);
          assert.equal(ranges.length, 5);
          assert.equal(ranges[0][0].getTime(), startDate.getTime());
          assert.equal(ranges[0][1].getHours(), 11);
          assert.equal(ranges[0][1].getMinutes(), 30);

          for (var i = 1 ; i < 4 ; i++){
            assert.equal(ranges[i][0].getHours(), 1);
            assert.equal(ranges[i][0].getMinutes(), 30);
            assert.equal(ranges[i][1].getHours(), 11);
            assert.equal(ranges[i][1].getMinutes(), 30);
          }

          assert.equal(ranges[4][0].getHours(), 1);
          assert.equal(ranges[4][0].getMinutes(), 30);
          assert.equal(ranges[4][1].getTime(),endDate.getTime());
          done();
        });
      });
    });
  });
  describe('Testing getting found time ranges given multiple day preferences from, multiple day availabilty', function() {
    var av = new Availability();
    var startDate = new Date(2015, 10, 1, 4);
    var endDate = new Date(2015, 10, 29, 11);
    it('should clip for start date and end date', function(done) {
      av.save(function(){
        av.initializeTimeBlocks(startDate, endDate, function(err, founcBlockList){
          var genPrefDict = {'Sunday': ["8:00 AM","8:00 PM"], 'Monday': ["8:00 AM","8:00 PM"],'Tuesday': ["8:00 AM","8:00 PM"], 
                            'Wednesday': ["8:00 AM","8:00 PM"], 'Thursday':["8:00 AM","8:00 PM"], 
                            'Friday':["8:00 AM","8:00 PM"], 'Saturday':["8:00 AM","8:00 PM"]};
          var ranges = av.getTimeRangesOfGeneralPreferences(genPrefDict);
          done();
        });
      });
    });
  });
  // describe('Testing getting found time ranges given single day preference, multiple day availabilty', function() {
  //   var av = new Availability();
  //   var startDate = new Date(2015, 10, 1, 4);
  //   var endDate = new Date(2015, 10, 29, 11);
  //   it('should clip for start date and end date', function(done) {
  //     av.save(function(){
  //       av.initializeTimeBlocks(startDate, endDate, function(err, founcBlockList){
  //         av.updateBlocksForDayPreference(0,);
  //       });
  //     });
  //   });
  // });
});

describe('Testing getting found time ranges given single day preference, multiple day availabilty', function() {
  it('should correctly convert am time strings to hours/mins', function(done) {
    var hourmin = Availability.timeStringToHoursAndMins("8:00 AM");
    assert.equal(hourmin[0],"8");
    assert.equal(hourmin[1],"0");
    done();
  });
  it('should correctly convert pm time strings to hours/mins', function(done) {
    var hourmin = Availability.timeStringToHoursAndMins("8:30 PM");
    assert.equal(hourmin[0],"20");
    assert.equal(hourmin[1],"30");
    done();
  });
});

