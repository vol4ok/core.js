/*!
 * Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function ($) {
  
  var slice             = $.slice
    , nativeIndexOf     = Array.prototype.indexOf
    , nativeLastIndexOf = Array.prototype.lastIndexOf
    
  $.first = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };


  $.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };


  $.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };


  $.rest = $.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };


  $.compact = function(array) {
    return $.filter(array, function(value){ return !!value; });
  };


  $.flatten = function(array, shallow) {
    return $.reduce(array, function(memo, value) {
      if ($.isArray(value)) return memo.concat(shallow ? value : $.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };


  $.without = function(array) {
    return $.difference(array, slice.call(arguments, 1));
  };


  $.uniq = $.unique = function(array, isSorted, iterator) {
    var initial = iterator ? $.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    $.reduce(initial, function (memo, value, index) {
      if (isSorted ? $.last(memo) !== value || !memo.length : !$.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };


  $.union = function() {
    return $.uniq($.flatten(arguments, true));
  };


  $.intersection = $.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return $.filter($.uniq(array), function(item) {
      return $.every(rest, function(other) {
        return $.index(other, item) >= 0;
      });
    });
  };


  $.difference = function(array) {
    var rest = $.flatten(slice.call(arguments, 1), true);
    return $.filter(array, function(value){ return !$.include(rest, value); });
  };


  $.zip = function() {
    var args = slice.call(arguments);
    var length = $.max($.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = $.pluck(args, "" + i);
    return results;
  };


  $.index = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = $.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  $.lastIndex = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  $.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };
  
  // Array Remove - By John Resig (MIT Licensed)
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };
  
})(exports);