var assert = require("assert");
var mongoose = require("mongoose");
//modules under test 
var TimeBlock = require("../app/models/TimeBlock.js");
var Availability = require("../app/models/Availability.js");


beforeEach(function(done){
  mongoose.connect('mongodb://localhost/new-test');
  for (var i in mongoose.connection.collections){
    mongoose.connection.collections[i].remove(function(){});
  }
  return done();
});
// afterEach(function(done){
//   mongoose.disconnect();
//   return done();
// });

describe('Availibility', function() {
  describe('#testAvail', function() {
      //setup database state 
      var avail = new Availability();
      var startDate = new Date(2015,10,3,4,00);
      var endDate = new Date(2015,10,3,5,30);
      avail.initializeTimeBlocks(startDate,endDate);
      it ('init avail', function(done){
        assert.equal(avail.timeBlocks.length, 3);
        done();
      });
      it ('get block', function(done){
        var start = new Date(2015,10,3,4,00);
        var firstBlock = avail.getBlockAtTime(start,function(err,res){
          if (err==null){
            assert.equal(res,'fuck');
            done();
          }
        });
        //assert.equal(avail.timeBlocks.length, 3);
        // assert.equal(firstBlock,'green');
      });

  });
});

