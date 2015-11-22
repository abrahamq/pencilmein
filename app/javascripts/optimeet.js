var optimeet = (function() {

  var _optimeet = {}

  var NUM_MILISECONDS_IN_MINUTE = 60000;
  var TIME_BLOCK_MINUTE_DURATION = 30;

  _optimeet.getIn = function(availabilities, mtg_startDate, mtg_duration) {
    var duration = validate_duration(mtg_duration);
    var possible_index = findAllTimeIndex(availabilities, mtg_startDate, duration);
    var in_index = findBestIn(possible_index);
    var in_startDate = block_num_to_time(in_index, mtg_startDate);
    var duration_block = duration_to_blocks(duration);
    var in_endDate = get_end_time(in_startDate, duration);
    return {startDate : in_startDate, endDate : in_endDate}
  }

  var validate_duration = function(duration) {
    return Math.ceil(duration/30) * 30;
  }

  var findBestIn = function(index_list) {
    return index_list[0];
  }

  var findAllTimeIndex = function(availabilities, mtg_startDate, mtg_duration, allow_squeeze) {
    var num_slots = availabilities[0].length;
    var time_blocks = Array.apply(null, new Array(num_slots)).map(Number.prototype.valueOf,1);
    var if_need_be = [];
    
    for (i = 0; i < num_slots; i++) {
      if_need_be.push({index: i, count: 0});
    }
    availabilities.forEach(function(user_avail) {
      for (i=0; i<user_avail.length; i++) {
        var cur_block = user_avail[i];
        if (cur_block.color != 'green') {
          time_blocks[i] = 0;
        } 
        else if (cur_block.color == 'yellow') {
          if_need_be[i].count += 1;
        }
        else if (cur_block.color == 'red') {
          if_need_be[i].count = Infinity;
        }
      }
    })

    var all_available = find_in(time_blocks, mtg_duration);
    if (all_available.length > 0) {
      return all_available
    }
    else if (allow_squeeze){
      var sorted_if_need_be = find_squeeze(if_need_be);
      if (sorted_if_need_be[0].count > 0) {
        var slots =  sorted_if_need_be.map(function(slots) {
          slots.startIndex;
        });
        return slots
      }
    } 
    else {
      return []
    }
  }


  var find_in = function(blocks, duration) {
    var window_size = duration_to_blocks(duration);
    var current_window = blocks.slice(0, window_size); 
    var window_start = 0;
    var possible_in = []
    if (check_window(current_window)){
      possible_in.push(window_start);
    }
    for (var i = window_size; i < blocks.length; i++) {
      window_start += 1;
      current_window.push(blocks[i]);
      current_window.splice(0,1);
      if (check_window(current_window)) {
        possible_in.push(window_start)
      }
    }
    return possible_in;
  }

  var check_window = function(current_window) {
    if (current_window.reduce(function(a,b){return a+b}) == current_window.length) {
      return true
    } else {
      return false
    }
  }

  var find_squeeze = function(blocks, duration) {
    var window_size = duration_to_blocks(duration);
    var current_window = blocks.slice(0,window_size);
    var window_start = 0;
    var possible_squeeze = []; 

    possible_squeeze.push({startIndex: window_start, cost: squeeze_heuristic(current_window)});

    for (var i = window_size; i < blocks.length; i++) {
      window_start += 1;
      current_window.push(blocks[i]);
      current_window.splice(0,1);
      possible_squeeze.push({startIndex: window_start, cost: squeeze_heuristic(current_window)});
    }
    var sorted_possible_squeeze = sort_squeeze(possible_squeeze);
    var squeeze_index = sorted_possible_squeeze.map(function(squeeze) {return squeeze.startIndex})
    return sorted_possible_squeeze
  }

  var sort_squeeze = function(squeeze_list) {
    var sorted_squeeze_list = squeeze_list.sort(function(window1, window2) {
      return window1.cost - window2.cost;
    })
    return sorted_squeeze_list
  }

  var squeeze_heuristic = function(squeeze_blocks) {
    var heuristic = 0;
    squeeze_blocks.forEach(function(block) {
      heuristic += block.count;
    });
    return heuristic
  }
 
  var duration_to_blocks = function(duration) {
    return Math.ceil(duration/TIME_BLOCK_MINUTE_DURATION);
  }

  var get_end_time = function(startDate, mtg_duration) {
    var duration_blocks = duration_to_blocks(mtg_duration);
    return new Date(startDate.getTime() + duration_blocks*NUM_MILISECONDS_IN_MINUTE*TIME_BLOCK_MINUTE_DURATION);
  }

  var time_to_block_index = function(start_time, time) {
    var time_diff = time.getTime() - start_time.getTime();
    var minutes = time_diff/NUM_MILISECONDS_IN_MINUTE;
    return Math.ceil(minutes/TIME_BLOCK_MINUTE_DURATION);
  }

  var block_num_to_time = function(block_num, startDate) {
    return new Date(startDate.getTime() + block_num*NUM_MILISECONDS_IN_MINUTE*TIME_BLOCK_MINUTE_DURATION);
  }


  Object.freeze(_optimeet);
  return _optimeet

})();
// })();

// module.exports = optimeet;



