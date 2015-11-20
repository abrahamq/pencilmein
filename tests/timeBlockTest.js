var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");

mongoose.connect('mongodb://localhost/testdb');
mongoose.connection.on("open", function(err) {
  console.log("Mongoose error:", err);
  mongoose.connection.db.dropDatabase();
});

describe('TimeBlock', function() {
  describe('simple', function() {
      //setup database state 
      var block = new TimeBlock();
      it ('should be green', function(done){
        assert.equal(block.color, 'green');
        assert.equal(block.creationType,'calendar');
        done();
      });
      it('should find timeblock', function(done) {
          block.save(function(){
            TimeBlock.getTimeBlock(block._id, function(err,foundBlock)
              {
                assert.equal(foundBlock.color, 'green');
                done();
              });
          });
      });
  });
});

