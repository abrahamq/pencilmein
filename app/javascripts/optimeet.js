var optimeet = (function () {

  "use strict";
  var _optimeet = {};

  var NUM_MILISECONDS_IN_MINUTE = 60000, 
      TIME_BLOCK_MINUTE_DURATION = 30;

  /*
    Returns the start and end dates of the optimal meeting time
    @param {availabilities} array the availabilities of all meeting participants for pre-specified time range
    @param {earliestStartDate} earliest potential time for the meeting
    @param {mtgDuration} length of the meeting in minutes
  */
  _optimeet.getIn = function (availabilities, meeting) {

    var earliestStartDate = meeting.earliestStartDate;
    var mtgDuration = meeting.duration;

    var durationBlocks = durationToBlocks(validateDuration(mtgDuration));
    var timeBlockToCount = assignCost(availabilities, earliestStartDate);
    var timeRangeCosts = getTimerangeCosts(timeBlockToCount, durationBlocks);
    var bestIn = findBestIn(timeRangeCosts, earliestStartDate);
    if (bestIn !== null) {
      var inStartDate = blockIndexToTime(bestIn.startIndex, earliestStartDate);
      var inEndDate = blockIndexToTime(bestIn.endIndex, earliestStartDate);
      return {startDate: inStartDate, endDate: inEndDate};
    } else {
      return null;
    }
  };

  /*
    Assigns each time block with a count representing the cost of the time block
    @param {availabilities} array the availabilities of all meeting participants for pre-specified time range
    @param {earliestStartDate} earliest potential time for the meeting
  */
  var assignCost = function (availabilities, earliestStartDate) {
    var numSlots = availabilities[0].length;
    var timeBlockToCount = [];

    for (var i = 0; i < numSlots; i++) {
      timeBlockToCount.push({index: i, count: 0});
    }
    availabilities.forEach(function (userAvail) {
      for (var i = 0; i < userAvail.length; i++) {
        var curBlock = userAvail[i];
        if (curBlock.color == 'yellow') {          
          timeBlockToCount[i].count += 1;
        }
        else if (curBlock.color == 'red') {
          timeBlockToCount[i].count = Infinity;
        }
      }
    });
    return timeBlockToCount;
  };

  /*
    Assigns each possible time range with its corresponding cost
    @param {blocks} array of time blocks and corresponding costs
    @param {durationBlocks} length of meeting in number of blocks
  */
  var getTimerangeCosts = function (blocks, durationBlocks) {
    var currentWindow = blocks.slice(0,durationBlocks);
    var windowStart = 0;
    var windowEnd = windowStart+durationBlocks;

    var timeRangeCost = []; 
    var prevCost = timeRangeHeuristic(currentWindow);
    timeRangeCost.push({startIndex: windowStart, endIndex : durationBlocks, cost: prevCost});

    for (var i = durationBlocks; i < blocks.length; i++) {
      windowStart += 1;
      var newBlock = blocks[i];

      currentWindow.push(newBlock);
      var removedBlock = currentWindow[0];
      currentWindow.splice(0,1);

      var newCost;
      if (prevCost === Number.POSITIVE_INFINITY) {
        newCost = timeRangeHeuristic(currentWindow);
      } else {
        newCost = prevCost - removedBlock.count + newBlock.count;  
      }
      var newTimeRange = {startIndex: windowStart, endIndex: i+1, cost: newCost};
      timeRangeCost.push(newTimeRange);
      prevCost = newCost;
    }
    return timeRangeCost;
  };

  /*
    Finds optimal meeting time
    @param {timeRangeCosts} array of time ranges and corresponding costs
  */
  var findBestIn = function (timeRangeCosts, earliestStartDate) {
    var sortedPossibleIn = sortTimeRanges(timeRangeCosts);
    if (sortedPossibleIn.length === 0) {
      return null;
    } 
    else if (sortedPossibleIn[0].cost == Number.POSITIVE_INFINITY) {
      return null;
    } else {
      if (sortedPossibleIn[0].cost == sortedPossibleIn[1].cost) {
        return breakTies(sortedPossibleIn, earliestStartDate);
      } else {
        return sortedPossibleIn[0];    
      }
    }
  };

  /*
    breaks ties by distance from best meeting start time
    @param {sortedPossibleIn} array of possible time ranges and their associated costs
    @param {earliestStartDate} earliest potential time for the meeting
  */
  var breakTies = function(sortedPossibleIn, earliestStartDate) {
    var bestCost = sortedPossibleIn[0].cost;
    var ties = sortedPossibleIn.filter(function (timeCosts) {
      return timeCosts.cost == bestCost;
    });
    var closestToBestHourIndex = {index: null, dist:Infinity};
    ties.forEach(function(block, i) {
      var bestTime = 14*60;
      var time = blockIndexToTime(block.startIndex, earliestStartDate);
      var curDist = Math.abs(time.getHours()*60 + time.getMinutes() - bestTime);
      if (curDist < closestToBestHourIndex.dist) {
        closestToBestHourIndex = {index: i, dist: curDist};
      }
    });
    return ties[closestToBestHourIndex.index];
  };

  /*
    Sorts time ranges in ascending order based on costs
    @param {timeRangeCosts} array of time ranges and corresponding costs
  */
  var sortTimeRanges = function (timeRangeCosts) {
    var sorted_timeRangeCosts = timeRangeCosts.sort(function(window1, window2) {
      return window1.cost - window2.cost;
    });
    return sorted_timeRangeCosts;
  };

  /*
    Calculates total cost of a time range
    @param {blockCounts} array of time blocks and corresponding costs
  */
  var timeRangeHeuristic = function (blockCounts) {
    var heuristic = 0;
    blockCounts.forEach(function(block) {
      heuristic += block.count;
    });
    return heuristic;
  };

  /*
    check whether the duration is in 30 minute increments and modify the duration if necessary
    @param {duration} duration of meeting (in minutes)
  */
  var validateDuration = function (duration) {
    return Math.ceil(duration / TIME_BLOCK_MINUTE_DURATION) * TIME_BLOCK_MINUTE_DURATION;
  };
 

  /*
    converts duration in minutes to block number
    @param {duration} duration of meeting (in minutes)
  */
  var durationToBlocks = function (duration) {
    return Math.ceil(duration/TIME_BLOCK_MINUTE_DURATION);
  };

  /*
    converts time block number to a date object
    @param {blockNum} block index number
    @param {startDate} earliest potential time for the meeting
  */
  var blockIndexToTime = function (blockNum, startDate) {
    return new Date(startDate.getTime() + blockNum*NUM_MILISECONDS_IN_MINUTE*TIME_BLOCK_MINUTE_DURATION);
  };

  Object.freeze(_optimeet);
  return _optimeet;

})();

module.exports = optimeet;



