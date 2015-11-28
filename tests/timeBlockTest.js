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
      it('should find timeblock with only updated red color', function(done) {
        TimeBlock.setTimeBlockColorAndCreationType(block._id,'red','calendar',function(err,foundBlock){
          assert.equal(err,null);
          assert.equal(foundBlock.color,"red");
          assert.equal(foundBlock.creationType,"calendar");
          done();
        });
      });
      it('should find timeblock with updated red color and manual creation type', function(done) {
        TimeBlock.setTimeBlockColorAndCreationType(block._id,'red','manual',function(err,foundBlock){
          assert.equal(err,null);
          assert.equal(foundBlock.color,"red");
          assert.equal(foundBlock.creationType,"manual");
          done();
        });
      });
      //calendar updates calendar
      //calendar doesn't update general
      //calendar doesn't update manual

      //general updates calendar
      //general updates general
      //general doesn't update manual

      //manual updates calendar
      //manual updates general
      //manual updates manual

  });
});

