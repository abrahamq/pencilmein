var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");

// mongoose.connect('mongodb://localhost/testdb');
// mongoose.connection.on("open", function(err) {
//   console.log("Mongoose error:", err);
//   mongoose.connection.db.dropDatabase();
// });

beforeEach(function(done){
  mongoose.connect('mongodb://localhost/new-test');
  for (var i in mongoose.connection.collections){
    mongoose.connection.collections[i].remove(function(){});
  }
  return done();
});
afterEach(function(done){
  mongoose.disconnect();
  return done();
});

describe('TimeBlock', function() {
  describe('simple', function() {
      //setup database state 
      var block = new TimeBlock();
      it ('should be green', function(done){
        assert.equal(block.color, 'green');
        assert.equal(block.creationType,'calendar');
        block.color = 'red';
        assert.equal(block.color, 'red');
        done();
      });
  });
});

