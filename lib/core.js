/*** CORE.JS ***/

/*!
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */
 
var Core = (function() {
  Core.constructor = function(){};
  Core.VERSION = "0.0.1";
  function Core() { return Core.constructor.apply(this, arguments) }
  return Core;
})();

(function($) {

  $.slice   = Array.prototype.slice;
  $.hasProp = $.hasOwnProperty = Object.prototype.hasOwnProperty;
  $.indexOf = Array.prototype.indexOf;

  $.bind = function(func, context) {
    return Function.prototype.bind.apply(func, slice.call(arguments, 1));
  };

  $.extend = function(target) {
    $.slice.call(arguments, 1).forEach(function(source) {
      for (key in source) target[key] = source[key];
    })
    return target;
  }

  $.ext = function() {
    $.extend.apply(this, [this].concat($.slice.call(arguments)) );
  }

  $.inherit = function(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };

})(Core);

var $ = Core;
/*** COLLECTION.JS ***/

/*!
 * Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){
  var ArrayProto        = Array.prototype
    , slice             = $.slice
    , nativeForEach     = ArrayProto.forEach
    , nativeMap         = ArrayProto.map
    , nativeReduce      = ArrayProto.reduce
    , nativeReduceRight = ArrayProto.reduceRight
    , nativeFilter      = ArrayProto.filter
    , nativeEvery       = ArrayProto.every
    , nativeSome        = ArrayProto.some
    , nativeIndexOf     = ArrayProto.indexOf;

    var breaker = {};
    
    var each = $.each = $.forEach = function(obj, iterator, context) {
      if (obj == null) return;
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
        }
      } else {
        for (var key in obj) {
          if ($.has(obj, key)) {
            if (iterator.call(context, obj[key], key, obj) === breaker) return;
          }
        }
      }
    };

    $.map = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      if (obj.length === +obj.length) results.length = obj.length;
      return results;
    };

  $.reduce = $.foldl = $.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = $.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };


  $.reduceRight = $.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = $.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = $.toArray(obj).reverse();
    if (context && !initial) iterator = $.bind(iterator, context);
    return initial ? $.reduce(reversed, iterator, memo, context) : $.reduce(reversed, iterator);
  };


  $.find = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };


  $.filter = $.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };


  $.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };


  $.every = $.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };


  var any = $.some = $.any = function(obj, iterator, context) {
    iterator || (iterator = $.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };


  $.include = $.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };


  $.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return $.map(obj, function(value) {
      return ($.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };


  $.pluck = function(obj, key) {
    return $.map(obj, function(value){ return value[key]; });
  };


  $.max = function(obj, iterator, context) {
    if (!iterator && $.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && $.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };


  $.min = function(obj, iterator, context) {
    if (!iterator && $.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && $.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };


  $.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };


  $.sortBy = function(obj, iterator, context) {
    return $.pluck($.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };


  $.groupBy = function(obj, val) {
    var result = {};
    var iterator = $.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };


  $.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = $.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };


  $.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if ($.isArray(iterable))      return slice.call(iterable);
    if ($.isArguments(iterable))  return slice.call(iterable);
    return $.values(iterable);
  };


  $.size = function(obj) {
    return $.toArray(obj).length;
  };
})(Core);
/*** ARRAY.JS ***/

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
        return $.indexOf(other, item) >= 0;
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


  $.indexOf = function(array, item, isSorted) {
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

  $.lastIndexOf = function(array, item) {
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
})(Core);
/*** OBJECT.JS ***/

/*!
 * Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){
    var slice         = $.slice
      , hasProp       = $.hasProp
      , toString      = Object.prototype.toString
      , nativeIsArray = Array.isArray
      , nativeKeys    = Object.keys
    
  $.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if ($.has(obj, key)) keys[keys.length] = key;
    return keys;
  };


  $.values = function(obj) {
    return $.map(obj, $.identity);
  };


  $.functions = $.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if ($.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };


  $.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };


  $.clone = function(obj) {
    if (!$.isObject(obj)) return obj;
    return $.isArray(obj) ? obj.slice() : $.extend({}, obj);
  };


  $.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };


  function eq(a, b, stack) {
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    if (a == null || b == null) return a === b;
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    if (a.isEqual && $.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && $.isFunction(b.isEqual)) return b.isEqual(a);
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      case '[object String]':
        return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    var length = stack.length;
    while (length--) {
      if (stack[length] == a) return true;
    }
    stack.push(a);
    var size = 0, result = true;
    if (className == '[object Array]') {
      size = a.length;
      result = size == b.length;
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      for (var key in a) {
        if ($.has(a, key)) {
          size++;
          if (!(result = $.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      if (result) {
        for (key in b) {
          if ($.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    stack.pop();
    return result;
  }


  $.isEqual = function(a, b) {
    return eq(a, b, []);
  };


  $.isEmpty = function(obj) {
    if (obj == null) return true;
    if ($.isArray(obj) || $.isString(obj)) return obj.length === 0;
    for (var key in obj) if ($.has(obj, key)) return false;
    return true;
  };


  $.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };


  $.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };


  $.isObject = function(obj) {
    return obj === Object(obj);
  };


  $.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!$.isArguments(arguments)) {
    $.isArguments = function(obj) {
      return !!(obj && $.has(obj, 'callee'));
    };
  }


  $.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };


  $.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };


  $.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };


  $.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };


  $.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };


  $.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };


  $.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };


  $.isNull = function(obj) {
    return obj === null;
  };


  $.isUndefined = function(obj) {
    return obj === void 0;
  };


  $.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };
  
  $.deepExtend = function(target) {}
  
})(Core);
/*** FUNCTION.JS ***/

/*!
 * Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var nativeBind = Function.prototype.bind;

  $.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!$.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };


  $.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = $.functions(obj);
    each(funcs, function(f) { obj[f] = $.bind(obj[f], obj); });
    return obj;
  };


  $.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = $.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return $.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };


  $.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };



  $.defer = function(func) {
    return $.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };


  $.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = $.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };


  $.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };



  $.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };


  $.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };


  $.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };


  $.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };
})(Core);
/*** STRING.JS ***/

/*!
 * Copyright (c) 2011 Esa-Matti Suuronen <esa-matti@suuronen.org>
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($) {

    var StringProto     = String.prototype
      , nativeTrim      = StringProto.trim
      , nativeTrimRight = StringProto.trimRight
      , nativeTrimLeft  = StringProto.trimLeft;

    $.isBlank = function(str){
      return (/^\s*$/).test(str);
    };

    $.stripTags = function(str){
      return (''+str).replace(/<\/?[^>]+>/ig, '');
    };

    $.capitalize  = function(str) {
      str = ''+str;
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    };

    $.chop = function(str, step){
      str = str+'';
      step = ~~step || str.length;
      var arr = [];
      for (var i = 0; i < str.length;) {
        arr.push(str.slice(i,i + step));
        i = i + step;
      }
      return arr;
    };

    $.clean = function(str){
      return $.strip((''+str).replace(/\s+/g, ' '));
    };

    $.count = function(str, substr){
      str = ''+str; substr = ''+substr;
      var count = 0, index;
      for (var i=0; i < str.length;) {
        index = str.indexOf(substr, i);
        index >= 0 && count++;
        i = i + (index >= 0 ? index : 0) + substr.length;
      }
      return count;
    };

    $.chars = function(str) {
      return (''+str).split('');
    };

    $.escapeHTML = function(str) {
      return (''+str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, "&apos;");
    };

    $.unescapeHTML = function(str) {
      return (''+str)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
    };

    $.escapeRegExp = function(str){
      // From MooTools core 1.2.4
      return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
    };

    $.insert = function(str, i, substr){
      var arr = (''+str).split('');
      arr.splice(~~i, 0, ''+substr);
      return arr.join('');
    };

    $.include = function(str, needle){
      return (''+str).indexOf(needle) !== -1;
    };

    $.join = function(sep) {
      var args = slice(arguments);
      return args.join(args.shift());
    };

    $.lines = function(str) {
      return (''+str).split("\n");
    };

    $.reverse = function(str){
        return Array.prototype.reverse.apply(String(str).split('')).join('');
    };

    $.splice = function(str, i, howmany, substr){
      var arr = (''+str).split('');
      arr.splice(~~i, ~~howmany, substr);
      return arr.join('');
    };

    $.startsWith = function(str, starts){
      str = ''+str; starts = ''+starts;
      return str.length >= starts.length && str.substring(0, starts.length) === starts;
    };

    $.endsWith = function(str, ends){
      str = ''+str; ends = ''+ends;
      return str.length >= ends.length && str.substring(str.length - ends.length) === ends;
    };

    $.succ = function(str){
      str = ''+str;
      var arr = str.split('');
      arr.splice(str.length-1, 1, String.fromCharCode(str.charCodeAt(str.length-1) + 1));
      return arr.join('');
    };

    $.titleize = function(str){
      return (''+str).replace(/\b./g, function(ch){ return ch.toUpperCase(); });
    };

    $.camelize = function(str){
      return $.trim(str)
        .replace(/(\-|_|\s)+(.)?/g, function(match, separator, chr) {
          return chr ? chr.toUpperCase() : '';
        });
    };

    $.underscored = function(str){
      return $.trim(str)
        .replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
    };

    $.dasherize = function(str){
      return $.trim(str)
        .replace(/[_\s]+/g, '-')
        .replace(/([A-Z])/g, '-$1')
        .replace(/-+/g, '-')
        .toLowerCase();
    };

    $.humanize = function(str){
      return $.capitalize(this.underscored(str)
        .replace(/_id$/,'')
        .replace(/_/g, ' '));
    };

    $.trim = function(str, characters){
      str = ''+str;
      if (!characters && nativeTrim) {
        return nativeTrim.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return str.replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');
    };

    $.ltrim = function(str, characters){
      if (!characters && nativeTrimLeft) {
        return nativeTrimLeft.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return (''+str).replace(new RegExp('\^' + characters + '+', 'g'), '');
    };

    $.rtrim = function(str, characters){
      if (!characters && nativeTrimRight) {
        return nativeTrimRight.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return (''+str).replace(new RegExp(characters + '+$', 'g'), '');
    };

    $.truncate = function(str, length, truncateStr){
      str = ''+str; truncateStr = truncateStr || '...';
      length = ~~length;
      return str.length > length ? str.slice(0, length) + truncateStr : str;
    };

    $.prune = function(str, length, pruneStr){
      str = ''+str; length = ~~length;
      pruneStr = pruneStr != null ? ''+pruneStr : '...';
      
      var pruned, borderChar, template = str.replace(/\W/g, function(ch){
        return (ch.toUpperCase() !== ch.toLowerCase()) ? 'A' : ' ';
      });
      
      borderChar = template[length];
      
      pruned = template.slice(0, length);
      
      // Check if we're in the middle of a word
      if (borderChar && borderChar.match(/\S/))
        pruned = pruned.replace(/\s\S+$/, '');
        
      pruned = $.rtrim(pruned);
      
      return (pruned+pruneStr).length > str.length ? str : str.substring(0, pruned.length)+pruneStr;
    };

    $.words = function(str, delimiter) {
      return (''+str).split(delimiter || " ");
    };

    $.pad = function(str, length, padStr, type) {
      str = ''+str;
      
      var padding = '', padlen  = 0;

      length = ~~length;
      
      if (!padStr) {
        padStr = ' ';
      } else if (padStr.length > 1) {
        padStr = padStr.charAt(0);
      }
      
      switch(type) {
        case 'right':
          padlen = (length - str.length);
          padding = strRepeat(padStr, padlen);
          str = str+padding;
          break;
        case 'both':
          padlen = (length - str.length);
          padding = {
            'left' : strRepeat(padStr, Math.ceil(padlen/2)),
            'right': strRepeat(padStr, Math.floor(padlen/2))
          };
          str = padding.left+str+padding.right;
          break;
        default: // 'left'
          padlen = (length - str.length);
          padding = strRepeat(padStr, padlen);;
          str = padding+str;
        }
      return str;
    };

    $.lpad = function(str, length, padStr) {
      return $.pad(str, length, padStr);
    };

    $.rpad = function(str, length, padStr) {
      return $.pad(str, length, padStr, 'right');
    };

    $.lrpad = function(str, length, padStr) {
      return $.pad(str, length, padStr, 'both');
    };

    $.toNumber = function(str, decimals) {
      var num = parseNumber(parseNumber(str).toFixed(~~decimals));
      return num === 0 && ''+str !== '0' ? Number.NaN : num;
    };
    
})(Core);
/*** MISC.JS ***/

(function($){

  $.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var 
        r = Math.random() * 16 | 0,
        v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    }).toUpperCase();
  };

  $.noop = function(){};
  $.identity = function(value) { return value; };
  
})(Core);
/*** ASYNC.JS ***/

/*!
 * Copyright (c) 2010 Caolan McMahon 
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var noop = $.noop;

  $.asyncEach = function (object, iterator, callback) {
    callback = callback || noop;
    var i
      , items = $.isArray(object) ? object : $.values(object)
      , len = items.length
      , completed = 0;
    if (!len) return callback();
    for (i = 0; i < len; i++) {
      iterator(items[i], function (err) {
        if (err) {
          callback(err);
          callback = noop;
        } else if (++completed === len)
          callback();
      });
    }
  };

  $.syncEach = function (object, iterator, callback) {
    callback = callback || noop;
    var iterate
      , items = $.isArray(object) ? object : $.values(object)
      , len = items.length
      , i = 0;
    (iterate = function() {
      iterator(items[i], function (err) {
        if (err) {
          callback(err);
          callback = noop;
        } else if (++i === len)
          callback();
        else 
          iterate();
      });
    })();
  };

  var asyncMap, syncMap;

  asyncMap = $.asyncMap = function (object, iterator, callback) {
    callback = callback || noop;
    var completed = 0
      , results = $.isArray(object) ? [] : {};
    if ($.isEmpty(object)) return callback(null, results)
    $.each(object, function(val, key) {
      completed++;
      iterator(val, function (err, result) {
        if (err) {
          callback(err, results);
          callback = noop
        } else {
          results[key] = result
          if (--completed === 0)
            callback(null, results);
        }
      });
    });
  };

  syncMap = $.syncMap = function (object, iterator, callback) {
    callback = callback || noop;
    var iterate, items, len
      , i = 0
      , results = $.isArray(object) ? [] : {};
    items = $.map(object, function(val, key) { 
      return {key: key, val: val} 
    });
    len = items.length;
    if (!len) return callback(null, results);
    (iterate = function() {
      iterator(items[i].val, function(err, result) {
        if (err) {
          callback(err);
          callback = noop;
        } else {
          results[items[i].key] = result
          if (++i === len)
            callback(null, results);
          else 
            iterate();
        }
          
      });
    })();
  }

  $.parallel = function (tasks, callback) {
    asyncMap(tasks, function(task, callback){
      task(function(err) {
        var args = $.slice.call(arguments, 1);
        if (args.length <= 1) args = args[0];
        callback.call(null, err, args);
      });
    }, callback);
  };

  $.series = function (tasks, callback) {
    syncMap(tasks, function(task, callback){
      task(function(err) {
        var args = $.slice.call(arguments, 1);
        if (args.length <= 1) args = args[0];
        callback.call(null, err, args);
      });
    }, callback);
  };

})(Core);
/*** DOM.JS ***/

/*!
 * Copyright (c) 2010-2012, Thomas Fuchs
 * Copyright (c) 2011, John Resig
 * Copyright (c) 2012, Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var extend     = $.extend
    , camelize   = $.camelize
    , dasherize  = $.dasherize
    , each       = $.each
    , uniq       = $.uniq
    , slice      = $.slice
    , compact    = $.compac
    , plunk      = $.plunk
    , map        = $.map
    , isFunction = $.isFunction
    , isObject   = $.isObject
    , isArray    = $.isArray;

  $.Dom = (function(Core) {
    
    var document = window.document
      , getComputedStyle = document.defaultView.getComputedStyle
      , elementTypes     = [1, 9, 11] //ELEMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE
      , classSelectorRE  = /^\.([\w-]+)$/
      , idSelectorRE     = /^#([\w-]+)$/
      , tagSelectorRE    = /^[\w-]+$/
      , fragmentRE       = /^\s*<(\w+)[^>]*>/
      , classRE          = /[\n\t\r]/g
      , readyRE          = /complete|loaded|interactive/
      , table            = document.createElement('table')
      , tableRow         = document.createElement('tr')
      , containers       = {
            'tr': document.createElement('tbody')
          , 'tbody': table 
          , 'thead': table 
          , 'tfoot': table
          , 'td': tableRow 
          , 'th': tableRow
          , '*': document.createElement('div')
        };
      
        
    var fragment, filtered, funcArg, maybeAddPx, $, $$;
      
    fragment = function (html, name) {
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
      if (!(name in containers)) name = '*';
      var container = containers[name];
      container.innerHTML = '' + html;
      return slice.call(container.childNodes);
    }

    filtered = function(nodes, selector) {
      return selector === undefined ? $(nodes) : $(nodes).filter(selector);
    }

    funcArg = function(context, arg, idx, payload) {
      return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }
    
    maybeAddPx = function(name, value) { 
      return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value; 
    }

    $ = Dom.$ = function(selector, context) {
      if (!selector)
        return Dom();
      if (context !== undefined) 
        return $(context).find(selector);
      else if (isFunction(selector))
        return $(document).ready(selector);
      else if (selector instanceof Dom) 
        return selector;
      else {
        var dom;
        if (isArray(selector)) 
          dom = compact(selector);
        else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
          dom = [selector], selector = null;
        else if (fragmentRE.test(selector))
          dom = fragment(selector.trim(), RegExp.$1), selector = null;
        else if (selector.nodeType && selector.nodeType == 3) 
          dom = [selector];
        else 
          dom = $$(document, selector);
        return Dom(dom, selector);
      }
    }
    
    $$ = function(element, selector){
      var found;
      return (element === document && idSelectorRE.test(selector)) ?
        ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
        (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
          slice.call(
            classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
            tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
            element.querySelectorAll(selector)
        );
    }
    
    Dom.fn = {
      concat: Array.prototype.concat,
      indexOf: Array.prototype.indexOf,
      
      at: function(idx) { return idx === undefined ? slice.call(this) : this[idx] },
      size: function(){ return this.length },
      map: function(fn){ return map(this, function(el, i){ return fn.call(el, i, el) }); },
      slice: function(){ return $(slice.apply(this, arguments)); },
      
      each: function(callback){
        each(this, function(el, idx){ 
          callback.call(el, idx, el) 
        });
        return this;
      },

      ready: function(callback){
        if (readyRE.test(document.readyState)) 
          callback($);
        else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false);
        return this;
      },
      
      /* Traversing 
      -------------------------------------------------------- */
      
      add: function(selector,context) {
        return $(uniq(this.concat($(selector,context))));
      },
      
      next: function() {
        return $(pluck(this, 'nextElementSibling'));
      },
      
      prev: function() {
        return $(pluck(this, 'previousElementSibling'));
      },
      
      siblings: function(selector) {
        return filtered(this.map(function(i, el) {
          return slice
            .call(el.parentNode.children)
            .filter(function(child) { 
              return child !== el 
            });
        }), selector);
      },
      
      children: function(selector) {
        return filtered(this.map(function(){ 
          return slice.call(this.children);
        }), selector);
      },
      
      parent: function(selector) {
        return filtered(uniq(pluck(this, 'parentNode')), selector);
      },
      
      find: function(selector) {
        var result;
        if (this.length == 1) 
          result = $$(this[0], selector);
        else 
          result = this.map(function(){ 
            return $$(this, selector);
          });
        return $(result);
      },
      
      closest: function(selector, context) {
        var 
          node = this[0], 
          candidates = $$(context || document, selector);
        if (!candidates.length) node = null;
        while (node && candidates.indexOf(node) < 0)
          node = node !== context && node !== document && node.parentNode;
        return $(node);
      },
      
      parents: function(selector) {
        var ancestors = [], nodes = this;
        while (nodes.length > 0)
          nodes = map(nodes, function(node){
            if ((node = node.parentNode) 
                && node !== document 
                && ancestors.indexOf(node) < 0) 
            {
              ancestors.push(node);
              return node;
            }
          });
        return filtered(ancestors, selector);
      },
      
      /* Filtering 
      -------------------------------------------------------- */
      
      first: function() {
        var el = this[0]; 
        return el && !isObject(el) ? el : $(el);
      },
      
      last: function() {
        var el = this[this.length - 1]; 
        return el && !isObject(el) ? el : $(el);
      },
      
      filter: function(selector) {
        return $(Array.prototype.filter.call(this, function(element){
          return element.parentNode && $$(element.parentNode, selector).indexOf(element) >= 0;
        }));
      },
      
      eq: function(idx) {
        return this.length > 0 && $(this[0]).filter(selector).length > 0;
      },
      
      not: function(selector) {
        var nodes=[];
        if (isFunction(selector) && selector.call !== undefined)
          this.each(function(idx){
            if (!selector.call(this,idx)) nodes.push(this);
          });
        else {
          var excludes = typeof selector == 'string' ? this.filter(selector) :
            (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector);
          this.forEach(function(el){
            if (excludes.indexOf(el) < 0) nodes.push(el);
          });
        }
        return $(nodes);
      },
      
      end: function() {
        return this.prevObject || $();
      },
      
      is: function(selector) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1);
      },
      
      
      /* Manipulation 
      -------------------------------------------------------- */
      
      empty: function() {
        return this.each(function(){ 
          this.innerHTML = '' 
        });
      },
      
      html: function(html) {
        return html === undefined ?
          (this.length > 0 ? this[0].innerHTML : null) :
          this.each(function (idx) {
            var originHtml = this.innerHTML;
            $(this)
              .empty()
              .append( funcArg(this, html, idx, originHtml) );
          });
      },
      
      text: function() {
        return text === undefined ?
          (this.length > 0 ? this[0].textContent : null) :
          this.each(function() { 
            this.textContent = text 
          });
      },
      
      remove: function(){
        return this.each(function () {
          if (this.parentNode != null) {
            this.parentNode.removeChild(this);
          }
        });
      },
      
      /* Attributes
      -------------------------------------------------------- */
      
      addClass: function(name) {
        return this.each(function(idx) {
          var 
            classList = [],
            cls = this.className, 
            newName = funcArg(this, name, idx, cls);
          newName.split(/\s+/g).forEach(function(klass) {
            if (!$(this).hasClass(klass))
              classList.push(klass)
          }, this);
          classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
        });
      },
      
      hasClass: function(name) {
        var 
          className = " " + name + " ",
          i = 0,
          l = this.length;
        for ( ; i < l; i++ ) {
          if ( this[i].nodeType === 1 
               && (" " + this[i].className + " ")
                .replace(classRE, " ")
                .indexOf( className ) > -1 ) 
          {
            return true;
          }
        }
        return false;
      },
      
      toggleClass: function(name, when) {
        return this.each(function(idx){
          var newName = funcArg(this, name, idx, this.className);
          (when === undefined ? !$(this).hasClass(newName) : when) ?
            $(this).addClass(newName) : $(this).removeClass(newName);
        });
      },
      
      removeClass: function(name) {
        return this.each(function(idx) {
          if(name === undefined)
            return this.className = '';
          var classList = this.className;
          funcArg(this, name, idx, classList)
            .split(/\s+/g)
            .forEach(function(klass) {
              classList = classList.replace(classRE(klass), " ")
            });
          this.className = classList.trim()
        });
      },
      
      attr: function(name, value) {
        var res;
        return (typeof name == 'string' && value === undefined) ?
          (this.length == 0 ? undefined :
            (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
            (!(res = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : res
          ) :
          this.each(function(idx){
            if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
            else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)));
          });
      },
      
      removeAttr: function(name) {
        return this.each(function() { this.removeAttribute(name); });
      },
      
      data: function(name, value) {
        return this.attr('data-' + name, value);
      },
      
      val: function() {
        return (value === undefined) ?
          (this.length > 0 ? this[0].value : null) :
          this.each(function(idx){
            this.value = funcArg(this, value, idx, this.value);
          });
      },
      
      /* CSS & Dimensions
      -------------------------------------------------------- */
      
      css: function(property, value) {
        if (value === undefined && typeof property == 'string') {
          return(
            this.length == 0
              ? undefined
              : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property)
          );
        }
        var css = '';
        for (key in property) 
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
        if (typeof property == 'string') 
          css = dasherize(property) + ":" + maybeAddPx(property, value);
        return this.each(function() { 
          this.style.cssText += ';' + css 
        });
      },
      
      offset: function() {
        if(this.length == 0) return null;
        var obj = this[0].getBoundingClientRect();
        return {
          left: obj.left + window.pageXOffset,
          top: obj.top + window.pageYOffset,
          width: obj.width,
          height: obj.height
        };
      },
      
    };
    
    [ "filter", "add", "not", "eq", "first", 
      "last", "find", "closest", "parents", 
      "parent", "children", "siblings" ].forEach(function(property) {
        var fn = Dom.fn[property];
        Dom.fn[property] = function() {
          var ret = fn.apply(this, arguments);
          ret.prevObject = this;
          return ret;
        }
      });
    
    ['width', 'height'].forEach(function(dimension){
      Dom.fn[dimension] = function(value) {
        var offset, Dimension = dimension.replace(/./, function(m) { return m[0].toUpperCase() });
        if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
          this[0] == document ? document.documentElement['offset' + Dimension] :
          (offset = this.offset()) && offset[dimension];
        else return this.each(function(idx){
          var el = $(this);
          el.css(dimension, funcArg(this, value, idx, el[dimension]()));
        });
      }
    });

    var insert, traverseNode;
    
    insert = function(operator, target, node) {
      var parent = (operator % 2) ? target : target.parentNode;
      parent && parent.insertBefore(node,
        !operator ? target.nextSibling :      // after
        operator == 1 ? parent.firstChild :   // prepend
        operator == 2 ? target :              // before
        null);                                // append
    };

    traverseNode = function (node, fun) {
      fun(node);
      for (var key in node.childNodes)
        traverseNode(node.childNodes[key], fun);
    };
    
    [ 'after', 'prepend', 'before', 'append' ].forEach(function(key, operator) {
      Dom.fn[key] = function(html){
        var nodes = isObject(html) ? html : fragment(html);
        if (!('length' in nodes) || nodes.nodeType) nodes = [nodes];
        if (nodes.length < 1) return this;
        var 
          size = this.length, 
          copyByClone = size > 1, 
          inReverse = operator < 2;
        return this.each(function(index, target){
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[inReverse ? nodes.length-i-1 : i];
            traverseNode(node, function (node) {
              if (node.nodeName != null 
                  && node.nodeName.toUpperCase() === 'SCRIPT' 
                  && (!node.type || node.type === 'text/javascript')) 
              {
                window['eval'].call(window, node.innerHTML);
              }
            });
            if (copyByClone && index < size - 1) 
              node = node.cloneNode(true);
            insert(operator, target, node);
          }
        });
      };

      var reverseKey = (operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After');
      Dom.fn[reverseKey] = function(html) {
        $(html)[key](this);
        return this;
      };

    });
    
    Dom.constructor = function(dom, selector){
      dom = dom || emptyArray;
      dom.__proto__ = Dom.prototype;
      dom.selector = selector || '';
      return dom;
    };
    
    Dom.prototype = Dom.fn;
    function Dom() { return Dom.constructor.apply(this, arguments) }
    return Dom;
  })($);


  /* EVENTS
   ================================================================================================ */


  (function(Dom) {

    var Event
      , _zid = 1
      , handlers = {}
      , specialEvents = {};

    specialEvents.click 
      = specialEvents.mousedown 
      = specialEvents.mouseup 
      = specialEvents.mousemove = 'MouseEvents';


    function zid(element) {
      return element._zid || (element._zid = _zid++);
    }


    function parse(event) {
      var parts = ('' + event).split('.');
      return {
          e: parts[0]
        , ns: parts
          .slice(1)
          .sort()
          .join(' ')
      };
    }


    function eachEvent(events, fn, iterator) {
      if (isObject(events)) 
        each(events, iterator);
      else 
        events.split(/\s/).forEach(function(type){ 
          iterator(type, fn) 
        });
    }

    function matcherFor(ns) {
      return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
    }

    function findHandlers(element, event, fn, selector) {
      event = parse(event);
      if (event.ns) 
        var matcher = matcherFor(event.ns);
      return (handlers[zid(element)] || []).filter(function(handler) {
        return handler
          && (!event.e  || handler.e == event.e)
          && (!event.ns || matcher.test(handler.ns))
          && (!fn       || handler.fn == fn)
          && (!selector || handler.sel == selector);
      });
    }


    function add(element, events, fn, selector, getDelegate) {
      var id = zid(element)
        , set = (handlers[id] || (handlers[id] = []));
      eachEvent(events, fn, function(event, fn) {
        var delegate = getDelegate && getDelegate(fn, event)
          , callback = delegate || fn;
        var proxyfn = function (event) {
          var result = callback.apply(element, [event].concat(event.data));
          if (result === false) 
            event.preventDefault();
          return result;
        };
        var handler = Core.extend(parse(event), {
            fn: fn
          , proxy: proxyfn
          , sel: selector
          , del: delegate
          , i: set.length
        });
        set.push(handler);
        element.addEventListener(handler.e, proxyfn, false);
      });
    }


    function findHandlers(element, event, fn, selector) {
      var event = parse(event);
      if (event.ns) 
        var matcher = matcherFor(event.ns);
      return (handlers[zid(element)] || []).filter(function(handler) {
        return handler
          && (!event.e  || handler.e == event.e)
          && (!event.ns || matcher.test(handler.ns))
          && (!fn       || handler.fn == fn)
          && (!selector || handler.sel == selector);
      });
    }


    function remove(element, events, fn, selector) {
      var id = zid(element);
      eachEvent(events || '', fn, function(event, fn){
        findHandlers(element, event, fn, selector).forEach(function(handler){
          delete handlers[id][handler.i];
          element.removeEventListener(handler.e, handler.proxy, false);
        });
      });
    }

    Dom.event = { add: add, remove: remove }


    function fix(event) {
      if (!('defaultPrevented' in event)) {
        event.defaultPrevented = false;
        var prevent = event.preventDefault;
        event.preventDefault = function() {
          this.defaultPrevented = true;
          prevent.call(this);
        }
      }
    }


    var returnTrue = function()  { return true  }
      , returnFalse = function() { return false }
      , eventMethods = {
          preventDefault: 'isDefaultPrevented'
        , stopImmediatePropagation: 'isImmediatePropagationStopped'
        , stopPropagation: 'isPropagationStopped'
        };

    function createProxy(event) {
      var proxy = extend({originalEvent: event}, event);
      each(eventMethods, function(name, predicate) {
        proxy[name] = function(){
          this[predicate] = returnTrue;
          return event[name].apply(event, arguments);
        };
        proxy[predicate] = returnFalse;
      })
      return proxy;
    }

    extend(Dom.fn, {

      on: function(event, selector, callback) {
        return selector === undefined || $.isFunction(selector)
          ? this.each(function(){ add(this, event, selector); }) 
          : this.delegate(selector, event, callback);
      },

      
      off: function(event, selector, callback) {
        return selector === undefined || $.isFunction(selector)
          ? this.each(function(){ remove(this, event, selector); }) 
          : this.undelegate(selector, event, callback);
      },


      one: function(event, callback) {
        return this.each(function(i, element){
          add(this, event, callback, null, function(fn, type){
            return function(){
              var result = fn.apply(element, arguments);
              remove(element, type, fn);
              return result;
            }
          });
        });
      },


      delegate: function(selector, event, callback) {
        return this.each(function(i, element){
          add(element, event, callback, selector, function(fn){
            return function(e){
              var evt
                , match = $(e.target)
                    .closest(selector, element)
                    .get(0);
              if (match) {
                evt = extend(createProxy(e), {
                  currentTarget: match
                , liveFired: element
                });
                return fn.apply(match, [evt].concat(slice.call(arguments, 1)));
              }
            }
          });
        });
      },


      undelegate: function(selector, event, callback) {
        return this.each(function(){
          remove(this, event, callback, selector);
        });
      },


      trigger: function(event, data){
        if (typeof event == 'string') 
          event = Event(event);
        fix(event);
        event.data = data;
        return this.each(function(){ 
          this.dispatchEvent(event) 
        });
      },


      triggerHandler: function(event, data){
        var e, result;
        this.each(function(i, element){
          e = createProxy(typeof event == 'string' ? Event(event) : event);
          e.data = data; e.target = element;
          each(findHandlers(element, event.type || event), function(i, handler){
            result = handler.proxy(e);
            if (e.isImmediatePropagationStopped()) return false;
          });
        });
        return result;
      }

    });

    [ "focusin", "focusout", "load", "resize", 
      "scroll", "unload", "click", "dblclick", 
      "mousedown", "mouseup", "mousemove", "mouseover", 
      "mouseout", "change", "select", "keydown", 
      "keypress", "keyup", "error"
    ].forEach(function(event) {
      Dom.fn[event] = function(callback){ 
        return this.on(event, callback) 
      };
    });

    ['focus', 'blur'].forEach(function(name) {
      Dom.fn[name] = function(callback) {
        if (callback) 
          this.on(name, callback);
        else if (this.length) 
          try { 
            this.get(0)[name]() 
          } catch(e) {};
        return this;
      };
    });

    each({mouseenter: "mouseover", mouseleave: "mouseout"}, function(fixed, orig) {
      Dom.fn[orig] = function(callback) { 
        return this.on(fixed, function(event){
          var related = event.relatedTarget;
          if (!related || (related !== this && !this.contains(related)))
            return callback.apply( this, arguments );
        }); 
      };
    });


    Event = Dom.Event = function(type, props) {
      var event = document.createEvent(specialEvents[type] || 'Events')
        , bubbles = true;
      if (props) 
        for (var name in props) 
          (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
      event.initEvent(type, bubbles, true, null, null, null, 
        null, null, null, null, null, null, null, null, null);
      return event;
    };

  })($.Dom);

  $.constructor = $.Dom.$;
})(Core);
/*** EVENTS.JS ***/

/*!
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var addListener
    , isArray = $.isArray;

  addListener = function (name, fn) {
    if (!this._events)
      this._events = {};

    if (!this._events[name]) {
      this._events[name] = fn;
    } else if (isArray(this._events[name])) {
      this._events[name].push(fn);
    } else {
      this._events[name] = [this._events[name], fn];
    }

    return this;
  };

  EventEmitter.prototype = {

    on: addListener,
    addListener: addListener,

    once: function (name, fn) {
      var self = this;

      function on() {
        self.removeListener(name, on);
        fn.apply(this, arguments);
      };

      on.listener = fn;
      this.on(name, on);

      return this;
    },


    removeListener: function (name, fn) {
      if (this._events && this._events[name]) {
        var list = this._events[name];

        if (isArray(list)) {
          var pos = -1;

          for (var i = 0, l = list.length; i < l; i++) {
            if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
              pos = i;
              break;
            }
          }

          if (pos < 0)
            return this;

          list.splice(pos, 1);

          if (!list.length)
            delete this._events[name];

        } else if (list === fn || (list.listener && list.listener === fn)) {
          delete this._events[name];
        };
      }

      return this;
    },


    removeAllListeners: function (name) {
      if (name === undefined) {
        this._events = {};
        return this;
      }

      if (this._events && this._events[name])
        this._events[name] = null;

      return this;
    },


    listeners: function (name) {
      if (!this._events) 
        this._events = {};

      if (!this._events[name])
        this._events[name] = [];

      if (!isArray(this._events[name]))
        this._events[name] = [this._events[name]];

      return this._events[name];
    },


    emit: function (name) {
      if (!this._events)
        return false;

      var handler = this._events[name];

      if (!handler)
        return false;

      var args = $.slice.call(arguments, 1);

      if ('function' == typeof handler) {
        handler.apply(this, args);
      } else if (isArray(handler)) {
        var listeners = handler.slice();

        for (var i = 0, l = listeners.length; i < l; i++) {
          listeners[i].apply(this, args);
        }
      } else
        return false;

      return true;
    }
  };

  $.EventEmitter = EventEmitter
  function EventEmitter() {};
})(Core);

/*** AJAX.JS ***/

/*!
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  $.ajax = $.xhr = $.request = function(exports){
    
    exports = request;
    exports.version = '0.3.0';

    var noop = $.noop
      , trim = $.trim
      , isFunction = $.isFunction
      , isObject = $.isObject
      , EventEmitter = $.EventEmitter;

    function getXHR() {
      if (window.XMLHttpRequest
        && ('file:' != window.location.protocol || !window.ActiveXObject)) {
        return new XMLHttpRequest;
      } else {
        try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
      }
      return false;
    }

    function serialize(obj) {
      if (!isObject(obj)) return obj;
      var pairs = [];
      for (var key in obj) {
        pairs.push(encodeURIComponent(key)
          + '=' + encodeURIComponent(obj[key]));
      }
      return pairs.join('&');
    }

    exports.serializeObject = serialize;

    function parseString(str) {
      var obj = {}
        , pairs = str.split('&')
        , parts
        , pair;

      for (var i = 0, len = pairs.length; i < len; ++i) {
        pair = pairs[i];
        parts = pair.split('=');
        obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
      }

      return obj;
    }

    exports.parseString = parseString;

    exports.types = {
        html: 'text/html'
      , json: 'application/json'
      , urlencoded: 'application/x-www-form-urlencoded'
      , 'form-data': 'application/x-www-form-urlencoded'
    };

     exports.serialize = {
         'application/x-www-form-urlencoded': serialize
       , 'application/json': JSON.stringify
     };

    exports.parse = {
        'application/x-www-form-urlencoded': parseString
      , 'application/json': JSON.parse
    };

    function parseHeader(str) {
      var lines = str.split(/\r?\n/)
        , fields = {}
        , index
        , line
        , field
        , val;

      lines.pop(); // trailing CRLF

      for (var i = 0, len = lines.length; i < len; ++i) {
        line = lines[i];
        index = line.indexOf(':');
        field = line.slice(0, index).toLowerCase();
        val = trim(line.slice(index + 1));
        fields[field] = val;
      }

      return fields;
    }

    function type(str){
      return str.split(/ *; */).shift();
    };

    function params(str){
      return str.split(/ *; */).reduce(function(obj, str){
        var parts = str.split(/ *= */)
          , key = parts.shift()
          , val = parts.shift();

        if (key && val) obj[key] = val;
        return obj;
      }, {});
    };



    function Response(xhr, options) {
      options = options || {};
      this.xhr = xhr;
      this.text = xhr.responseText;
      this.setStatusProperties(xhr.status);
      this.header = parseHeader(xhr.getAllResponseHeaders());
      this.setHeaderProperties(this.header);
      this.body = this.parseBody(this.text);
    }


    Response.prototype.setHeaderProperties = function(header){
      // content-type
      var ct = this.header['content-type'] || '';
      this.type = type(ct);

      // params
      var obj = params(ct);
      for (var key in obj) this[key] = obj[key];
    };


    Response.prototype.parseBody = function(str){
      var parse = exports.parse[this.type];
      return parse
        ? parse(str)
        : null;
    };


    Response.prototype.setStatusProperties = function(status){
      var type = status / 100 | 0;

      // status / class
      this.status = status;
      this.statusType = type;

      // basics
      this.info = 1 == type;
      this.ok = 2 == type;
      this.clientError = 4 == type;
      this.serverError = 5 == type;
      this.error = 4 == type || 5 == type;

      // sugar
      this.accepted = 202 == status;
      this.noContent = 204 == status || 1223 == status;
      this.badRequest = 400 == status;
      this.unauthorized = 401 == status;
      this.notAcceptable = 406 == status;
      this.notFound = 404 == status;
    };

    exports.Response = Response;


    
    function Request(method, url) {
      var self = this;
      EventEmitter.call(this);
      this.method = method;
      this.url = url;
      this.header = {};
      this.set('X-Requested-With', 'XMLHttpRequest');
      this.on('end', function(){
        self.callback(new Response(self.xhr));
      });
    }

    Request.prototype = new EventEmitter;
    Request.prototype.constructor = Request;


    Request.prototype.set = function(field, val){
      if (isObject(field)) {
        for (var key in field) {
          this.set(key, field[key]);
        }
        return this;
      }
      this.header[field.toLowerCase()] = val;
      return this;
    };

    Request.prototype.type = function(type){
      this.set('Content-Type', exports.types[type] || type);
      return this;
    };

    Request.prototype.query = function(obj){
      this._query = this._query || {};
      for (var key in obj) {
        this._query[key] = obj[key];
      }
      return this;
    };

    Request.prototype.send = function(data){
      if ('GET' == this.method) return this.query(data);
      var obj = isObject(data);

      // merge
      if (obj && isObject(this._data)) {
        for (var key in data) {
          this._data[key] = data[key];
        }
      } else {
        this._data = data;
      }

      if (!obj) return this;
      if (this.header['content-type']) return this;
      this.type('json');
      return this;
    };

    Request.prototype.end = function(fn){
      var self = this
        , xhr = this.xhr = getXHR()
        , query = this._query
        , data = this._data;

      // store callback
      this.callback = fn || noop;

      // state change
      xhr.onreadystatechange = function(){
        if (4 == xhr.readyState) self.emit('end');
      };

      // querystring
      if (query) {
        query = exports.serializeObject(query);
        this.url += ~this.url.indexOf('?')
          ? '&' + query
          : '?' + query;
      }

      // initiate request
      xhr.open(this.method, this.url, true);

      // body
      if ('GET' != this.method && 'HEAD' != this.method) {
        // serialize stuff
        var serialize = exports.serialize[this.header['content-type']];
        if (serialize) data = serialize(data);
      }

      // set header fields
      for (var field in this.header) {
        xhr.setRequestHeader(field, this.header[field]);
      }

      // send stuff
      xhr.send(data);
      return this;
    };
    
    exports.Request = Request;



    function request(method, url) {
      if ('function' == typeof url) {
        return new Request('GET', method).end(url);
      }

      if (1 == arguments.length) {
        return new Request('GET', method);
      }

      return new Request(method, url);
    }


    request.get = function(url, data, fn){
      var req = request('GET', url);
      if (isFunction(data)) fn = data, data = null;
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.head = function(url, data, fn){
      var req = request('HEAD', url);
      if (isFunction(data)) fn = data, data = null;
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.del = function(url, fn){
      var req = request('DELETE', url);
      if (fn) req.end(fn);
      return req;
    };


    request.patch = function(url, data, fn){
      var req = request('PATCH', url);
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.post = function(url, data, fn){
      var req = request('POST', url);
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.put = function(url, data, fn){
      var req = request('PUT', url);
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };

    return exports;
  }({})

  $.get   = $.xhr.get  
  $.head  = $.xhr.head 
  $.del   = $.xhr.del  
  $.patch = $.xhr.patch
  $.post  = $.xhr.post 
  $.put   = $.xhr.put  
  
})(Core);
