var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");

mongoose.connect('mongodb://localhost/blockTestDb');
mongoose.connection.on("open", function(err) {
  mongoose.connection.db.dropDatabase();
});


describe('TimeBlock', function() {
  describe('simple', function() {
      //setup database state 
      var block = new TimeBlock();
      it ('should have initial color be green', function(done){
        assert.equal(block.color, 'green');
        assert.equal(block.creationType,'calendar');
        done();
      });
      it('should find timeblock with initial color green and calendar type', function(done) {
          block.save(function(){
            TimeBlock.getTimeBlock(block._id, function(err,foundBlock){
              assert.equal(foundBlock.color, 'green');
              assert.equal(foundBlock.creationType, 'calendar');
              done();
            });
          });
      });
      //calendar updates calendar
      it('calendar updates calednar: should find timeblock with only updated red color', function(done) {
        TimeBlock.setTimeBlockColorAndCreationType(block._id,'red','calendar',function(err,foundBlock){
          assert.equal(err,null);
          assert.equal(foundBlock.color,"red");
          assert.equal(foundBlock.creationType,"calendar");
          done();
        });
      });
      //general updates calendar
      it('general updates calendar: should find timeblock with updated red color and general creation type', function(done) {
        TimeBlock.setTimeBlockColorAndCreationType(block._id,'yellow','general',function(err,foundBlock){
          assert.equal(err,null);
          assert.equal(foundBlock.color,"yellow");
          assert.equal(foundBlock.creationType,"general");
          done();
        });
      });
      //manual updates calendar
      it('manual updates calendar: should find timeblock with updated red color and manual creation type', function(done) {
        TimeBlock.setTimeBlockColorAndCreationType(block._id,'red','manual',function(err,foundBlock){
          assert.equal(err,null);
          assert.equal(foundBlock.color,"red");
          assert.equal(foundBlock.creationType,"manual");
          done();
        });
      });
      //calendar doesn't update general
      it('calendar wont update general: should find timeblock with updated red color and manual creation type', function(done) {
        var block2 = new TimeBlock();
        block2.save(function(err,savedBlock){
          TimeBlock.setTimeBlockColorAndCreationType(block2._id,'yellow','general',function(err,foundBlock2a){
            TimeBlock.setTimeBlockColorAndCreationType(block2._id,'red','calendar',function(err,foundBlock2b){
              assert.equal(err,null);
              assert.equal(foundBlock2b.color,"yellow");
              assert.equal(foundBlock2b.creationType,"general");
              done();
            });
          }); 
        });
      });
      //general updates general
      it('general updates general: should find timeblock with updated red color and manual creation type', function(done) {
        var block2 = new TimeBlock();
        block2.save(function(err,savedBlock){
          TimeBlock.setTimeBlockColorAndCreationType(block2._id,'yellow','general',function(err,foundBlock2a){
            TimeBlock.setTimeBlockColorAndCreationType(block2._id,'red','general',function(err,foundBlock2b){
              assert.equal(err,null);
              assert.equal(foundBlock2b.color,"red");
              assert.equal(foundBlock2b.creationType,"general");
              done();
            });
          }); 
        });
      });
      //manual updates general
      it('manual updates general: should find timeblock with updated red color and manual creation type', function(done) {
        var block2 = new TimeBlock();
        block2.save(function(err,savedBlock){
          TimeBlock.setTimeBlockColorAndCreationType(block2._id,'yellow','general',function(err,foundBlock2a){
            TimeBlock.setTimeBlockColorAndCreationType(block2._id,'red','manual',function(err,foundBlock2b){
              assert.equal(err,null);
              assert.equal(foundBlock2b.color,"red");
              assert.equal(foundBlock2b.creationType,"manual");
              done();
            });
          }); 
        });
      });
      //calendar doesn't update manual
      it('calendar wont update manual: should find timeblock with updated red color and manual creation type', function(done) {
        var block2 = new TimeBlock();
        block2.save(function(err,savedBlock){
          TimeBlock.setTimeBlockColorAndCreationType(block2._id,'yellow','manual',function(err,foundBlock2a){
            TimeBlock.setTimeBlockColorAndCreationType(block2._id,'red','calendar',function(err,foundBlock2b){
              assert.equal(err,null);
              assert.equal(foundBlock2b.color,"yellow");
              assert.equal(foundBlock2b.creationType,"manual");
              done();
            });
          }); 
        });
      });
      //general doesn't update manual
      it('general wont update manual: should find timeblock with updated red color and manual creation type', function(done) {
        var block2 = new TimeBlock();
        block2.save(function(err,savedBlock){
          TimeBlock.setTimeBlockColorAndCreationType(block2._id,'yellow','manual',function(err,foundBlock2a){
            TimeBlock.setTimeBlockColorAndCreationType(block2._id,'red','general',function(err,foundBlock2b){
              assert.equal(err,null);
              assert.equal(foundBlock2b.color,"yellow");
              assert.equal(foundBlock2b.creationType,"manual");
              done();
            });
          }); 
        });
      });
      //manual updates manual
      it('manual updates manual: should find timeblock with updated red color and manual creation type', function(done) {
        var block2 = new TimeBlock();
        block2.save(function(err,savedBlock){
          TimeBlock.setTimeBlockColorAndCreationType(block2._id,'yellow','manual',function(err,foundBlock2a){
            TimeBlock.setTimeBlockColorAndCreationType(block2._id,'red','manual',function(err,foundBlock2b){
              assert.equal(err,null);
              assert.equal(foundBlock2b.color,"red");
              assert.equal(foundBlock2b.creationType,"manual");
              done();
            });
          }); 
        });
      });
  });
});

