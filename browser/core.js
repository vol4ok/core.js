/*!
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */
 
var Core = (function() {
    Core.constructor = function(){};
    Core.VERSION = "0.2.0";
    function Core() { return Core.constructor.apply(this, arguments) }
    return Core;
})();/*** CORE.JS ***/

/*!
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

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
    });
    return target;
  }

  $.ext = function() {
    $.extend.apply(this, [this].concat($.slice.call(arguments)) );
  }

  $.inherit = function(child, parent) {
    for (var key in parent) {
      if ($.hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  
  $.ns = function(scopes, block) {
    var i, len, item;
    if (!$.m) $.m = {}
    exports = {};
    block(exports);
    for (i = 0, len = scopes.length; i < len; i++)
      $.m[scopes[i]] = exports;
    return exports
  };
  
  $.require = function(module) {
    return $.m[module];
  }

})(Core);

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
    $.each(slice.call(arguments, 1), function(source) {
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
/*** FUNC.JS ***/

/*!
 * Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var nativeBind = Function.prototype.bind
    , slice = $.slice;

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
    return $.delay.apply($, [func, 1].concat(slice.call(arguments, 1)));
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
  
  var idCounter = 0;
  $.uniqId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };


  $.noop = function(){};
  $.identity = function(value) { return value; };
  
  $.max = function(a, b) {
    if (arguments > 2) {
      var a = arguments
        , max = -Infinity
        , i, l = a.length;
      for (i = 0; i < l; i++)
        if (a[i] > max) max = a[i];
      return max
    }
    return Math.max(a,b);
  };
  
  $.min = function(a, b) {
    if (arguments > 2) {
      var a = arguments
        , min = Infinity
        , i, l = a.length;
      for (i = 0; i < l; i++)
        if (a[i] < min) min = a[i];
      return min
    }
    return Math.min(a,b);
  };
  
})(Core);
/*** BROWSER.JS ***/

(function($){
  
  function parseUserAgent(uaStr) {
    var agent = {
      platform: {},
      browser: {},
      engine: {}
    };

    var ua = uaStr,
      p = agent.platform,
      b = agent.browser,
      e = agent.engine;

    // detect platform
    if (/Windows/.test(ua)) {
      p.name = 'win';
      p.win = true;
    } else if (/Mac/.test(ua)) {
      p.name = 'mac';
      p.mac = true;
    } else if (/Linux/.test(ua)) {
      p.name = 'linux';
      p.linux = true;
    } else if (/iPhone|iPod/.test(ua)) {
      p.name = 'iphone';
      p.iphone = true;
    } else if (/iPad/.test(ua)) {
      p.name = 'ipad';
      p.ipad = true;
    } else if (/Android/.test(ua)) {
      p.name = 'android';
      p.android = true;
    } else {
      p.name = 'other';
      p.unknown = true;
    }

    // detect browser
    if (/MSIE/.test(ua)) {
      b.name = 'msie';
      b.msie = true;
    } else if (/Firefox/.test(ua)) {
      b.name = 'firefox';
      b.firefox = true;
    } else if (/Chrome/.test(ua)) { // must be tested before Safari
      b.name = 'chrome';
      b.chrome = true;
    } else if (/Safari/.test(ua)) {
      b.name = 'safari';
      b.safari = true;
    } else if (/Opera/.test(ua)) {
      b.name = 'opera';
      b.opera = true;
    } else {
      b.name = 'other';
      b.unknown = true;
    }

    // detect browser version
    if (b.msie) {
      b.version = /MSIE (\d+(\.\d+)*)/.exec(ua)[1];
    } else if (b.firefox) {
      b.version = /Firefox\/(\d+(\.\d+)*)/.exec(ua)[1];
    } else if (b.chrome) {
      b.version = /Chrome\/(\d+(\.\d+)*)/.exec(ua)[1];
    } else if (b.safari) {
      b.version = /Version\/(\d+(\.\d+)*)/.exec(ua)[1];
    } else if (b.opera) {
      b.version = /Version\/(\d+(\.\d+)*)/.exec(ua)[1];
    } else {
      b.version = 0;
    }

    // detect engine
    if (/Trident/.test(ua) || b.msie) {
      e.name = 'trident';
      e.trident = true;
    } else if (/WebKit/.test(ua)) { // must be tested before Gecko
      e.name = 'webkit';
      e.webkit = true;
    } else if (/Gecko/.test(ua)) {
      e.name = 'gecko';
      e.gecko = true;
    } else if (/Presto/.test(ua)) {
      e.name = 'presto';
      e.presto = true;
    } else {
      e.name = 'other';
      e.unknown = true;
    }

    // detect engine version
    if (e.trident) {
      e.version = /Trident/.test(ua)? /Trident\/(\d+(\.\d+)*)/.exec(ua)[1]: 0;
    } else if (e.gecko) {
      e.version = /rv:(\d+(\.\d+)*)/.exec(ua)[1];
    } else if (e.webkit) {
      e.version = /WebKit\/(\d+(\.\d+)*)/.exec(ua)[1];
    } else if (e.presto) {
      e.version = /Presto\/(\d+(\.\d+)*)/.exec(ua)[1];
    } else {
      e.version = 0;
    }
    return agent;
  }
  
  $ = $.ext(parseUserAgent(navigator.userAgent));
  
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

  $.chain = function() {

    var tasks
    , args = []
    , error = noop;
    if(arguments.length === 3) {
      args  = $.isArray(arguments[0]) ? arguments[0] : [arguments[0]];
      tasks = arguments[1];
      error = arguments[2];
    } else if(arguments.length === 2) {
      if ($.isArray(arguments[1])) {
        args  = $.isArray(arguments[0]) ? arguments[0] : [arguments[0]];
        tasks = arguments[1];
      } else {
        tasks = arguments[0];
        error = arguments[1];
      }
    } else if(arguments.length === 1) {
      args = []
      tasks = arguments[0];
      error = noop;
    } else 
      return false;

    var iterate, len
      , i = 0;

    tasks = $.map(tasks, function(task, key) { 
      return {key: key, task: task};
    });
    len = tasks.length;
    (iterate = function() {
      if (++i > len) return;
      var args = $.slice.call(arguments);
      try {
        tasks[i-1].task.apply(this, args.concat([iterate]));
      } catch(err) {
        error(err);
      }
    }).apply(this, args);
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
    , compact    = $.compact
    , isFunction = $.isFunction
    , isArray    = $.isArray
    , flatten    = $.flatten;

  var qwery = (function () {
    var doc = document
      , html = doc.documentElement
      , byClass = 'getElementsByClassName'
      , byTag = 'getElementsByTagName'
      , qSA = 'querySelectorAll'
      , useNativeQSA = 'useNativeQSA'
      , tagName = 'tagName'
      , nodeType = 'nodeType'
      , select // main select() method, assign later

      , id = /#([\w\-]+)/
      , clas = /\.[\w\-]+/g
      , idOnly = /^#([\w\-]+)$/
      , classOnly = /^\.([\w\-]+)$/
      , tagOnly = /^([\w\-]+)$/
      , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
      , splittable = /(^|,)\s*[>~+]/
      , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
      , splitters = /[\s\>\+\~]/
      , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
      , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
      , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
      , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
      , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
      , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
      , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
      , tokenizr = new RegExp(splitters.source + splittersMore.source)
      , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
      , walker = {
          ' ': function (node) {
            return node && node !== html && node.parentNode
          }
        , '>': function (node, contestant) {
            return node && node.parentNode == contestant.parentNode && node.parentNode
          }
        , '~': function (node) {
            return node && node.previousSibling
          }
        , '+': function (node, contestant, p1, p2) {
            if (!node) return false
            return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
          }
        }

    function cache() {
      this.c = {}
    }
    cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v, r) {
        v = r ? new RegExp(v) : v
        return (this.c[k] = v)
      }
    }

    var classCache = new cache()
      , cleanCache = new cache()
      , attrCache = new cache()
      , tokenCache = new cache()

    function classRegex(c) {
      return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
    }

    // not quite as fast as inline loops in older browsers so don't use liberally
    function each(a, fn) {
      var i = 0, l = a.length
      for (; i < l; i++) fn(a[i])
    }

    // function flatten(ar) {
    //   for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    //   return r
    // }

    function arrayify(ar) {
      var i = 0, l = ar.length, r = []
      for (; i < l; i++) r[i] = ar[i]
      return r
    }

    function previous(n) {
      while (n = n.previousSibling) if (n[nodeType] == 1) break;
      return n
    }

    function q(query) {
      return query.match(chunker)
    }

    // called using `this` as element and arguments from regex group results.
    // given => div.hello[title="world"]:foo('bar')
    // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
      var i, m, k, o, classes
      if (this[nodeType] !== 1) return false
      if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
      if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
      if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
        for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
      }
      if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
      if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes
        for (k in o) {
          if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
            return this
          }
        }
      }
      if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
        // select is for attrib equality
        return false
      }
      return this
    }

    function clean(s) {
      return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
    }

    function checkAttr(qualify, actual, val) {
      switch (qualify) {
      case '=':
        return actual == val
      case '^=':
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
      case '$=':
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
      case '*=':
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
      case '~=':
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
      case '|=':
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
      }
      return 0
    }

    // given a selector, first check for simple cases then collect all base candidate matches and filter
    function _qwery(selector, _root) {
      var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
        , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        , dividedTokens = selector.match(dividers)

      if (!tokens.length) return r

      token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
      if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
      if (!root) return r

      intr = q(token)
      // collect base candidates to filter
      els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
          while (root = root.nextSibling) {
            root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
          }
          return r
        }([]) :
        root[byTag](intr[1] || '*')
      // filter elements according to the right-most part of the selector
      for (i = 0, l = els.length; i < l; i++) {
        if (item = interpret.apply(els[i], intr)) r[r.length] = item
      }
      if (!tokens.length) return r

      // filter further according to the rest of the selector (the left side)
      each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
      return ret
    }

    // compare element to a selector
    function is(el, selector, root) {
      if (isNode(selector)) return el == selector
      if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

      var selectors = selector.split(','), tokens, dividedTokens
      while (selector = selectors.pop()) {
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        dividedTokens = selector.match(dividers)
        tokens = tokens.slice(0) // copy array
        if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }

    // given elements matching the right-most part of a selector, filter out any that don't match the rest
    function ancestorMatch(el, tokens, dividedTokens, root) {
      var cand
      // recursively work backwards through the tokens and up the dom, covering all options
      function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
          if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
            if (i) {
              if (cand = crawl(p, i - 1, p)) return cand
            } else return p
          }
        }
      }
      return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
    }

    function isNode(el, t) {
      return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
    }

    function uniq(ar) {
      var a = [], i, j
      o: for (i = 0; i < ar.length; ++i) {
        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
        a[a.length] = ar[i]
      }
      return a
    }

    function arrayLike(o) {
      return (typeof o === 'object' && isFinite(o.length))
    }

    function normalizeRoot(root) {
      if (!root) return doc
      if (typeof root == 'string') return qwery(root)[0]
      if (!root[nodeType] && arrayLike(root)) return root[0]
      return root
    }

    function byId(root, id, el) {
      // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
      return root[nodeType] === 9 ? root.getElementById(id) :
        root.ownerDocument &&
          (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
    }

    function qwery(selector, _root) {
      var m, el, root = normalizeRoot(_root)

      // easy, fast cases that we can dispatch with simple DOM calls
      if (!root || !selector) return []
      if (selector === window || isNode(selector)) {
        return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
      }
      if (selector && arrayLike(selector)) return flatten(selector)
      if (m = selector.match(easy)) {
        if (m[1]) return (el = byId(root, m[1])) ? [el] : []
        if (m[2]) return arrayify(root[byTag](m[2]))
        if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
      }

      return select(selector, root)
    }

    // where the root is not document and a relationship selector is first we have to
    // do some awkward adjustments to get it to work, even with qSA
    function collectSelector(root, collector) {
      return function(s) {
        var oid, nid
        if (splittable.test(s)) {
          if (root[nodeType] !== 9) {
           // make sure the el has an id, rewrite the query, set root to doc and run it
           if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
           s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
           collector(root.parentNode || root, s, true)
           oid || root.removeAttribute('id')
          }
          return;
        }
        s.length && collector(root, s, false)
      }
    }

    var isAncestor = 'compareDocumentPosition' in html ?
      function (element, container) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (element, container) {
        container = container[nodeType] === 9 || container == window ? html : container
        return container !== element && container.contains(element)
      } :
      function (element, container) {
        while (element = element.parentNode) if (element === container) return 1
        return 0
      }
    , getAttr = function() {
        // detect buggy IE src/href getAttribute() call
        var e = doc.createElement('p')
        return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
          function(e, a) {
            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
              e.getAttribute(a, 2) : e.getAttribute(a)
          } :
          function(e, a) { return e.getAttribute(a) }
     }()
    , hasByClass = !!doc[byClass]
      // has native qSA support
    , hasQSA = doc.querySelector && doc[qSA]
      // use native qSA
    , selectQSA = function (selector, root) {
        var result = [], ss, e
        try {
          if (root[nodeType] === 9 || !splittable.test(selector)) {
            // most work is done right here, defer to qSA
            return arrayify(root[qSA](selector))
          }
          // special case where we need the services of `collectSelector()`
          each(ss = selector.split(','), collectSelector(root, function(ctx, s) {
            e = ctx[qSA](s)
            if (e.length == 1) result[result.length] = e.item(0)
            else if (e.length) result = result.concat(arrayify(e))
          }))
          return ss.length > 1 && result.length > 1 ? uniq(result) : result
        } catch(ex) { }
        return selectNonNative(selector, root)
      }
      // no native selector support
    , selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss
        selector = selector.replace(normalizr, '$1')
        if (m = selector.match(tagAndOrClass)) {
          r = classRegex(m[2])
          items = root[byTag](m[1] || '*')
          for (i = 0, l = items.length; i < l; i++) {
            if (r.test(items[i].className)) result[result.length] = items[i]
          }
          return result
        }
        // more complex selector, get `_qwery()` to do the work for us
        each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
          r = _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
    , configure = function (options) {
        // configNativeQSA: use fully-internal selector or native qSA where present
        if (typeof options[useNativeQSA] !== 'undefined')
          select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
      }

    configure({ useNativeQSA: true })

    qwery.configure = configure
    qwery.uniq = uniq
    qwery.is = is
    qwery.pseudos = {}

    return qwery
  })();

  var bonzo = (function() {
    var win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null // used for setting a selector engine host
      , specialAttributes = /^(checked|value|selected|disabled)$/i
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i // tags that we have trouble inserting *into*
      , table = ['<table>', '</table>', 1]
      , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
      , option = ['<select>', '</select>', 1]
      , noscope = ['_', '', 0, 1]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: ['<table><tbody>', '</tbody></table>', 2]
          , th: td , td: td
          , col: ['<table><colgroup>', '</colgroup></table>', 2]
          , fieldset: ['<form>', '</form>', 1]
          , legend: ['<form><fieldset>', '</fieldset></form>', 2]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected|disabled)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          , opasity: function () {
              return typeof doc.createElement('a').style.opacity !== 'undefined'
            }()
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }


    /**
     * @param {string} c a class name to test
     * @return {boolean}
     */
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }


    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @param {boolean=} opt_rev
     * @return {Bonzo|Array}
     */
    function each(ar, fn, opt_scope, opt_rev) {
      var ind, i = 0, l = ar.length
      for (; i < l; i++) {
        ind = opt_rev ? ar.length - i - 1 : i
        fn.call(opt_scope || ar[ind], ar[ind], ind, ar)
      }
      return ar
    }


    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {Bonzo|Array}
     */
    function deepEach(ar, fn, opt_scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, opt_scope)
          fn.call(opt_scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }


    // /**
    //  * @param {string} s
    //  * @return {string}
    //  */
    // function camelize(s) {
    //   return s.replace(/-(.)/g, function (m, m1) {
    //     return m1.toUpperCase()
    //   })
    // }


    // /**
    //  * @param {string} s
    //  * @return {string}
    //  */
    // function decamelize(s) {
    //   return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    // }

    var camelize = $.camelize
      , decamelize = $.dasherize;


    /**
     * @param {Element} el
     * @return {*}
     */
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      var uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }


    /**
     * removes the data associated with an element
     * @param {Element} el
     */
    function clearData(el) {
      var uid = el[getAttribute]('data-node-uid')
      if (uid) delete uidMap[uid]
    }


    function dataValue(d) {
      var f
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }

    function isNode(node) {
      return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11)
    }


    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {boolean} whether `some`thing was found
     */
    function some(ar, fn, opt_scope) {
      for (var i = 0, j = ar.length; i < j; ++i) if (fn.call(opt_scope || null, ar[i], i, ar)) return true
      return false
    }


    /**
     * this could be a giant enum of CSS properties
     * but in favor of file size sans-closure deadcode optimizations
     * we're just asking for any ol string
     * then it gets transformed into the appropriate style property for JS access
     * @param {string} p
     * @return {string}
     */
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }

    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :

      (ie && html.currentStyle) ?

      /**
       * @param {Element} el
       * @param {string} property
       * @return {string|number}
       */
      function (el, property) {
        if (property == 'opacity' && !features.opasity) {
          var val = 100
          try {
            val = el['filters']['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el['filters']('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :

      function (el, property) {
        return el.style[property]
      }

    // this insert method is intense
    function insert(target, host, fn, rev) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t, j) {
        each(self, function (el) {
          fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el)
        }, null, rev)
      }, this, rev)
      self.length = i
      each(r, function (e) {
        self[--i] = e
      }, null, !rev)
      return self
    }


    /**
     * sets an element to an explicit x/y position on the page
     * @param {Element} el
     * @param {?number} x
     * @param {?number} y
     */
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]

      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }

      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)

      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)

    }

    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }


    /**
     * this allows method calling for setting values
     *
     * @example
     * bonzo(elements).css('color', function (el) {
     *   return el.getAttribute('data-original-color')
     * })
     *
     * @param {Element} el
     * @param {function (Element)|string}
     * @return {string}
     */
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }

    /**
     * @constructor
     * @param {Array.<Element>|Element|Node|string} elements
     */
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }

    Bonzo.prototype = {

        /**
         * @param {number} index
         * @return {Element|Node}
         */
        get: function (index) {
          return this[index] || null
        }

        // itetators
        /**
         * @param {function(Element|Node)} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , each: function (fn, opt_scope) {
          return each(this, fn, opt_scope)
        }

        /**
         * @param {Function} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , deepEach: function (fn, opt_scope) {
          return deepEach(this, fn, opt_scope)
        }


        /**
         * @param {Function} fn
         * @param {Function=} opt_reject
         * @return {Array}
         */
      , map: function (fn, opt_reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            opt_reject ? (opt_reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }

      // text and html inserters!

      /**
       * @param {string} h the HTML to insert
       * @param {boolean=} opt_text whether to set or get text content
       * @return {Bonzo|string}
       */
      , html: function (h, opt_text) {
          var method = opt_text
                ? html.textContent === undefined ? 'innerText' : 'textContent'
                : 'innerHTML'
            , that = this
            , append = function (el, i) {
                each(normalize(h, that, i), function (node) {
                  el.appendChild(node)
                })
              }
            , updateElement = function (el, i) {
                try {
                  if (opt_text || (typeof h == 'string' && !specialTags.test(el.tagName))) {
                    return el[method] = h
                  }
                } catch (e) {}
                append(el, i)
              }
          return typeof h != 'undefined'
            ? this.empty().each(updateElement)
            : this[0] ? this[0][method] : ''
        }

        /**
         * @param {string=} opt_text the text to set, otherwise this is a getter
         * @return {Bonzo|string}
         */
      , text: function (opt_text) {
          return this.html(opt_text, true)
        }

        // more related insertion methods

        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , append: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el.appendChild(i)
            })
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , prepend: function (node) {
          var that = this
          return this.each(function (el, i) {
            var first = el.firstChild
            each(normalize(node, that, i), function (i) {
              el.insertBefore(i, first)
            })
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , appendTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.appendChild(el)
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , prependTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          }, 1)
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , before: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , after: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            }, null, 1)
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertBefore: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertAfter: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            var sibling = t.nextSibling
            sibling ?
              t[parentNode].insertBefore(el, sibling) :
              t[parentNode].appendChild(el)
          }, 1)
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , replaceWith: function (node, opt_host) {
          var ret = bonzo(normalize(node)).insertAfter(this, opt_host)
          this.remove()
          Bonzo.call(opt_host || this, ret)
          return opt_host || this
        }

        // class management

        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }


        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }


        /**
         * @param {string} c
         * @return {boolean}
         */
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }


        /**
         * @param {string} c classname to toggle
         * @param {boolean=} opt_condition whether to add or remove the class straight away
         * @return {Bonzo}
         */
      , toggleClass: function (c, opt_condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof opt_condition !== 'undefined' ?
                  opt_condition ? addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }

        // display togglers

        /**
         * @param {string=} opt_type useful to set back to anything other than an empty string
         * @return {Bonzo}
         */
      , show: function (opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : ''
          return this.each(function (el) {
            el.style.display = opt_type
          })
        }


        /**
         * @return {Bonzo}
         */
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }


        /**
         * @param {Function=} opt_callback
         * @param {string=} opt_type
         * @return {Bonzo}
         */
      , toggle: function (opt_callback, opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : '';
          typeof opt_callback != 'function' && (opt_callback = null)
          return this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : opt_type;
            opt_callback && opt_callback.call(el)
          })
        }


        // DOM Walkers & getters

        /**
         * @return {Element|Node}
         */
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }


        /**
         * @return {Element|Node}
         */
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }


        /**
         * @return {Element|Node}
         */
      , next: function () {
          return this.related('nextSibling')
        }


        /**
         * @return {Element|Node}
         */
      , previous: function () {
          return this.related('previousSibling')
        }


        /**
         * @return {Element|Node}
         */
      , parent: function() {
          return this.related(parentNode)
        }


        /**
         * @private
         * @param {string} method the directional DOM method
         * @return {Element|Node}
         */
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }


        /**
         * @return {Bonzo}
         */
      , focus: function () {
          this.length && this[0].focus()
          return this
        }


        /**
         * @return {Bonzo}
         */
      , blur: function () {
          this.length && this[0].blur()
          return this
        }

        // style getter setter & related methods

        /**
         * @param {Object|string} o
         * @param {string=} opt_v
         * @return {Bonzo|string}
         */
      , css: function (o, opt_v) {
          var p, iter = o
          // is this a request for just getting a style?
          if (opt_v === undefined && typeof o == 'string') {
            // repurpose 'v'
            opt_v = this[0]
            if (!opt_v) return null
            if (opt_v === doc || opt_v === win) {
              p = (opt_v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
          }

          if (typeof o == 'string') {
            iter = {}
            iter[o] = opt_v
          }

          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }

          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                try { el.style[p] = setter(el, v) } catch(e) {}
              }
            }
          }
          return this.each(fn)
        }


        /**
         * @param {number=} opt_x
         * @param {number=} opt_y
         * @return {Bonzo|number}
         */
      , offset: function (opt_x, opt_y) {
          if (typeof opt_x == 'number' || typeof opt_y == 'number') {
            return this.each(function (el) {
              xy(el, opt_x, opt_y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft

            if (el != doc.body) {
              top -= el.scrollTop
              left -= el.scrollLeft
            }
          }

          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }


        /**
         * @return {number}
         */
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t) {
                 var s = {
                     position: el.style.position || ''
                   , visibility: el.style.visibility || ''
                   , display: el.style.display || ''
                 }
                 t.first().css({
                     position: 'absolute'
                   , visibility: 'hidden'
                   , display: 'block'
                 })
                 return s
              }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight

          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }

        // attributes are hard. go shopping

        /**
         * @param {string} k an attribute to get or set
         * @param {string=} opt_v the value to set
         * @return {Bonzo|string}
         */
      , attr: function (k, opt_v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof opt_v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, opt_v)) : el[setAttribute](k, setter(el, opt_v))
            })
        }


        /**
         * @param {string} k
         * @return {Bonzo}
         */
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }


        /**
         * @param {string=} opt_s
         * @return {Bonzo|string}
         */
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }

        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
        /**
         * @param {string|Object=} opt_k the key for which to get or set data
         * @param {Object=} opt_v
         * @return {Bonzo|Object}
         */
      , data: function (opt_k, opt_v) {
          var el = this[0], o, m
          if (typeof opt_v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof opt_k === 'undefined') {
              each(el.attributes, function (a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[opt_k] === 'undefined')
                o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)))
              return o[opt_k]
            }
          } else {
            return this.each(function (el) { data(el)[opt_k] = opt_v })
          }
        }

        // DOM detachment & related

        /**
         * @return {Bonzo}
         */
      , remove: function () {
          this.deepEach(clearData)

          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }


        /**
         * @return {Bonzo}
         */
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)

            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }


        /**
         * @return {Bonzo}
         */
      , detach: function () {
          return this.each(function (el) {
            el[parentNode].removeChild(el)
          })
        }

        // who uses a mouse anyway? oh right.

        /**
         * @param {number} y
         */
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }


        /**
         * @param {number} x
         */
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }

    }

    function normalize(node, host, clone) {
      var i, l, ret
      if (typeof node == 'string') return bonzo.create(node)
      if (isNode(node)) node = [ node ]
      if (clone) {
        ret = [] // don't change original array
        for (i = 0, l = node.length; i < l; i++) ret[i] = cloneNode(host, node[i])
        return ret
      }
      return node
    }

    function cloneNode(host, el) {
      var c = el.cloneNode(true)
        , cloneElems
        , elElems

      // check for existence of an event cloner
      // preferably https://github.com/fat/bean
      // otherwise Bonzo won't do this for you
      if (host.$ && typeof host.cloneEvents == 'function') {
        host.$(c).cloneEvents(el)

        // clone events from every child node
        cloneElems = host.$(c).find('*')
        elElems = host.$(el).find('*')

        for (var i = 0; i < elElems.length; i++)
          host.$(cloneElems[i]).cloneEvents(elElems[i])
      }
      return c
    }

    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }

    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }

    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }

    /**
     * @param {Array.<Element>|Element|Node|string} els
     * @return {Bonzo}
     */
    function bonzo(els) {
      return new Bonzo(els)
    }

    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }

    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }

    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)

          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }

    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }

    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }

    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }

    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }

    return bonzo
  })();

  var ready = (function () {

    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])

    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }

    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)


    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })

    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })();

  var bean = (function () {
    var win = window
      , overOut = /over|out/
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex = /\..*/
      , addEvent = 'addEventListener'
      , attachEvent = 'attachEvent'
      , removeEvent = 'removeEventListener'
      , detachEvent = 'detachEvent'
      , ownerDocument = 'ownerDocument'
      , targetS = 'target'
      , qSA = 'querySelectorAll'
      , doc = document || {}
      , root = doc.documentElement || {}
      , W3C_MODEL = root[addEvent]
      , eventSupport = W3C_MODEL ? addEvent : attachEvent
      , slice = Array.prototype.slice
      , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
      , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
      , textTypeRegex = /^text/i
      , touchTypeRegex = /^touch|^gesture/i
      , ONE = {} // singleton for quick matching making add() do one()

      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++)
            hash[events[i]] = 1
          return hash
        }({}, (
            'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
            'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
            'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
            'keydown keypress keyup ' +                                        // keyboard
            'orientationchange ' +                                             // mobile
            'focus blur change reset select submit ' +                         // form elements
            'load unload beforeunload resize move DOMContentLoaded '+          // window
            'readystatechange message ' +                                      // window
            'error abort scroll ' +                                            // misc
            (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                         // that doesn't actually exist, so make sure we only do these on newer browsers
              'show ' +                                                          // mouse buttons
              'input invalid ' +                                                 // form elements
              'touchstart touchmove touchend touchcancel ' +                     // touch
              'gesturestart gesturechange gestureend ' +                         // gesture
              'readystatechange pageshow pagehide popstate ' +                   // window
              'hashchange offline online ' +                                     // window
              'afterprint beforeprint ' +                                        // printing
              'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
              'loadstart progress suspend emptied stalled loadmetadata ' +       // media
              'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
              'seeked ended durationchange timeupdate play pause ratechange ' +  // media
              'volumechange cuechange ' +                                        // media
              'checking noupdate downloading cached updateready obsolete ' +     // appcache
              '' : '')
          ).split(' ')
        ))

      , customEvents = (function () {
          var cdp = 'compareDocumentPosition'
            , isAncestor = cdp in root
                ? function (element, container) {
                    return container[cdp] && (container[cdp](element) & 16) === 16
                  }
                : 'contains' in root
                  ? function (element, container) {
                      container = container.nodeType === 9 || container === window ? root : container
                      return container !== element && container.contains(element)
                    }
                  : function (element, container) {
                      while (element = element.parentNode) if (element === container) return 1
                      return 0
                    }

          function check(event) {
            var related = event.relatedTarget
            return !related
              ? related === null
              : (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isAncestor(related, this))
          }

          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        }())

      , fixEvent = (function () {
          var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
            , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
            , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
            , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
            , textProps = commonProps.concat(['data'])
            , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
            , messageProps = commonProps.concat(['data', 'origin', 'source'])
            , stateProps = commonProps.concat(['state'])
            , preventDefault = 'preventDefault'
            , createPreventDefault = function (event) {
                return function () {
                  if (event[preventDefault])
                    event[preventDefault]()
                  else
                    event.returnValue = false
                }
              }
            , stopPropagation = 'stopPropagation'
            , createStopPropagation = function (event) {
                return function () {
                  if (event[stopPropagation])
                    event[stopPropagation]()
                  else
                    event.cancelBubble = true
                }
              }
            , createStop = function (synEvent) {
                return function () {
                  synEvent[preventDefault]()
                  synEvent[stopPropagation]()
                  synEvent.stopped = true
                }
              }
            , copyProps = function (event, result, props) {
                var i, p
                for (i = props.length; i--;) {
                  p = props[i]
                  if (!(p in result) && p in event) result[p] = event[p]
                }
              }

          return function (event, isNative) {
            var result = { originalEvent: event, isNative: isNative }
            if (!event)
              return result

            var props
              , type = event.type
              , target = event[targetS] || event.srcElement

            result[preventDefault] = createPreventDefault(event)
            result[stopPropagation] = createStopPropagation(event)
            result.stop = createStop(result)
            result[targetS] = target && target.nodeType === 3 ? target.parentNode : target
            if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
              if (type.indexOf('key') !== -1) {
                props = keyProps
                result.keyCode = event.keyCode || event.which
              } else if (mouseTypeRegex.test(type)) {
                props = mouseProps
                result.rightClick = event.which === 3 || event.button === 2
                result.pos = { x: 0, y: 0 }
                if (event.pageX || event.pageY) {
                  result.clientX = event.pageX
                  result.clientY = event.pageY
                } else if (event.clientX || event.clientY) {
                  result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                  result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                }
              if (overOut.test(type))
                  result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
              } else if (touchTypeRegex.test(type)) {
                props = touchProps
              } else if (mouseWheelTypeRegex.test(type)) {
                props = mouseWheelProps
              } else if (textTypeRegex.test(type)) {
                props = textProps
              } else if (type === 'message') {
                props = messageProps
              } else if (type === 'popstate') {
                props = stateProps;
              }
              copyProps(event, result, props || commonProps)
            }
            return result
          }
        }())

        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }

        // we use one of these per listener, of any type
      , RegEntry = (function () {
          function entry(element, type, handler, original, namespaces) {
            var isNative = this.isNative = nativeEvents[type] && element[eventSupport]
            this.element = element
            this.type = type
            this.handler = handler
            this.original = original
            this.namespaces = namespaces
            this.custom = customEvents[type]
            this.eventType = W3C_MODEL || isNative ? type : 'propertychange'
            this.customType = !W3C_MODEL && !isNative && type
            this[targetS] = targetElement(element, isNative)
            this[eventSupport] = this[targetS][eventSupport]
          }

          entry.prototype = {
              // given a list of namespaces, is our entry in any of them?
              inNamespaces: function (checkNamespaces) {
                var i, j
                if (!checkNamespaces)
                  return true
                if (!this.namespaces)
                  return false
                for (i = checkNamespaces.length; i--;) {
                  for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] === this.namespaces[j])
                      return true
                  }
                }
                return false
              }

              // match by element, original fn (opt), handler fn (opt)
            , matches: function (checkElement, checkOriginal, checkHandler) {
                return this.element === checkElement &&
                  (!checkOriginal || this.original === checkOriginal) &&
                  (!checkHandler || this.handler === checkHandler)
              }
          }

          return entry
        }())

      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array. uses '$' as a prefix for the keys for safety
          var map = {}

            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, fn) {
                if (!type || type === '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) === '$')
                      forAll(element, t.substr(1), original, handler, fn)
                  }
                } else {
                  var i = 0, l, list = map['$' + type], all = element === '*'
                  if (!list)
                    return
                  for (l = list.length; i < l; i++) {
                    if (all || list[i].matches(element, original, handler))
                      if (!fn(list[i], list, i, type))
                        return
                  }
                }
              }

            , has = function (element, type, original) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map['$' + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (list[i].matches(element, original, null))
                      return true
                  }
                }
                return false
              }

            , get = function (element, type, original) {
                var entries = []
                forAll(element, type, original, null, function (entry) { return entries.push(entry) })
                return entries
              }

            , put = function (entry) {
                (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
                return entry
              }

            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                  list.splice(i, 1)
                  if (list.length === 0)
                    delete map['$' + entry.type]
                  return false
                })
              }

              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) === '$')
                    entries = entries.concat(map[t])
                }
                return entries
              }

          return { has: has, get: get, put: put, del: del, entries: entries }
        }())

      , selectorEngine = doc[qSA]
          ? function (s, r) {
              return r[qSA](s)
            }
          : function () {
              throw new Error('Bean: No selector engine installed') // eeek
            }

      , setSelectorEngine = function (e) {
          selectorEngine = e
        }

        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }

      , nativeHandler = function (element, fn, args) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, true)
            if (beanDel) // delegated event, fix the fix
              event.currentTarget = beanDel.ft(event[targetS], element)
            return fn.apply(element, [event].concat(args))
          }
          handler.__beanDel = beanDel
          return handler
        }

      , customHandler = function (element, fn, type, condition, args, isNative) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            var target = beanDel ? beanDel.ft(event[targetS], element) : this // deleated event
            if (condition ? condition.apply(target, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event) {
                event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, isNative)
                event.currentTarget = target
              }
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
          handler.__beanDel = beanDel
          return handler
        }

      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }

      , removeListener = function (element, orgType, handler, namespaces) {
          var i, l, entry
            , type = (orgType && orgType.replace(nameRegex, ''))
            , handlers = registry.get(element, type, handler)

          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(namespaces)) {
              if ((entry = handlers[i])[eventSupport])
                listener(entry[targetS], entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }

      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(nameRegex, '')
            , namespaces = orgType.replace(namespaceRegex, '').split('.')

          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            if (customEvents[type].condition)
              fn = customHandler(element, fn, type, customEvents[type].condition, args, true)
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry[eventSupport])
            listener(entry[targetS], entry.eventType, entry.handler, true, entry.customType)
        }

      , del = function (selector, fn, $) {
              //TODO: findTarget (therefore $) is called twice, once for match and once for
              // setting e.currentTarget, fix this so it's only needed once
          var findTarget = function (target, root) {
                var i, array = typeof selector === 'string' ? $(selector, root) : selector
                for (; target && target !== root; target = target.parentNode) {
                  for (i = array.length; i--;) {
                    if (array[i] === target)
                      return target
                  }
                }
              }
            , handler = function (e) {
                var match = findTarget(e[targetS], this)
                match && fn.apply(match, arguments)
              }

          handler.__beanDel = {
              ft: findTarget // attach it here for customEvents to use too
            , selector: selector
            , $: $
          }
          return handler
        }

      , remove = function (element, typeSpec, fn) {
          var k, type, namespaces, i
            , rm = removeListener
            , isString = typeSpec && typeof typeSpec === 'string'

          if (isString && typeSpec.indexOf(' ') > 0) {
            // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
            typeSpec = typeSpec.split(' ')
            for (i = typeSpec.length; i--;)
              remove(element, typeSpec[i], fn)
            return element
          }
          type = isString && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type])
            type = customEvents[type].type
          if (!typeSpec || isString) {
            // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
            if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
              namespaces = namespaces.split('.')
            rm(element, type, fn, namespaces)
          } else if (typeof typeSpec === 'function') {
            // remove(el, fn)
            rm(element, null, typeSpec)
          } else {
            // remove(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k))
                remove(element, k, typeSpec[k])
            }
          }
          return element
        }

        // 5th argument, $=selector engine, is deprecated and will be removed
      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'

          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $ || selectorEngine)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }

      , one = function () {
          return add.apply(ONE, arguments)
        }

      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }

      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')

          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }

      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length
            , args, beanDel

          for (;i < l; i++) {
            if (handlers[i].original) {
              beanDel = handlers[i].handler.__beanDel
              if (beanDel) {
                args = [ element, beanDel.selector, handlers[i].type, handlers[i].original, beanDel.$]
              } else
                args = [ element, handlers[i].type, handlers[i].original ]
              add.apply(null, args)
            }
          }
          return element
        }

      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , setSelectorEngine: setSelectorEngine
        }

    if (win[attachEvent]) {
      // for IE, clean up on unload to avoid leaks
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload')
            remove(entries[i].element, entries[i].type)
        }
        win[detachEvent]('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win[attachEvent]('onunload', cleanup)
    }

    return bean
  })();

  var fragmentRE = /^\s*</
    , elementTypes = [1, 9, 11]; //ELEMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE;

  function indexOf(ar, val) {
    for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
    return -1
  }

  function uniq(ar) {
    var r = [], i = 0, j = 0, k, item, inIt
    for (; item = ar[i]; ++i) {
      inIt = false
      for (k = 0; k < r.length; ++k) {
        if (r[k] === item) {
          inIt = true; break
        }
      }
      if (!inIt) r[j++] = item
    }
    return r
  }

  /**
   * @param {string} type either width or height
   * @param {number=} opt_v becomes a setter instead of a getter
   * @return {number}
   */
  function dimension(type, opt_v) {
    return typeof opt_v == 'undefined'
      ? bonzo(this).dim()[type]
      : this.css(type, opt_v)
  }

  Dom.fn = $.extend({}, bonzo(), {
    parents: function (selector, closest) {
      if (!this.length) return this
      var collection = $(selector), j, k, p, r = []
      for (j = 0, k = this.length; j < k; j++) {
        p = this[j]
        while (p = p.parentNode) {
          if (~indexOf(collection, p)) {
            r.push(p)
            if (closest) break;
          }
        }
      }
      return $(uniq(r))
    }

  , parent: function() {
      return $(uniq(bonzo(this).parent()))
    }

  , closest: function (selector) {
      return this.parents(selector, true)
    }

  , first: function () {
      return $(this.length ? this[0] : this)
    }

  , last: function () {
      return $(this.length ? this[this.length - 1] : [])
    }

  , next: function () {
      return $(bonzo(this).next())
    }

  , previous: function () {
      return $(bonzo(this).previous())
    }

  , appendTo: function (t) {
      return bonzo(this.selector).appendTo(t, this)
    }

  , prependTo: function (t) {
      return bonzo(this.selector).prependTo(t, this)
    }

  , insertAfter: function (t) {
      return bonzo(this.selector).insertAfter(t, this)
    }

  , insertBefore: function (t) {
      return bonzo(this.selector).insertBefore(t, this)
    }

  , replaceWith: function (t) {
      return bonzo(this.selector).replaceWith(t, this)
    }

  , siblings: function () {
      var i, l, p, r = []
      for (i = 0, l = this.length; i < l; i++) {
        p = this[i]
        while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
        p = this[i]
        while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
      }
      return $(r)
    }

  , children: function () {
      var i, l, el, r = []
      for (i = 0, l = this.length; i < l; i++) {
        if (!(el = bonzo.firstChild(this[i]))) continue;
        r.push(el)
        while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
      }
      return $(uniq(r))
    }

  , height: function (v) {
      return dimension.call(this, 'height', v)
    }

  , width: function (v) {
      return dimension.call(this, 'width', v)
    }

  , find: function (s) {
      var r = [], i, l, j, k, els
      for (i = 0, l = this.length; i < l; i++) {
        els = qwery(s, this[i])
        for (j = 0, k = els.length; j < k; j++) r.push(els[j])
      }
      return $(qwery.uniq(r))
    }

  , and: function (s) {
      var plus = $(s)
      for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
        this[i] = plus[j]
      }
      this.length += plus.length
      return this
    }

  , is: function(s, r) {
      var i, l
      for (i = 0, l = this.length; i < l; i++) {
        if (qwery.is(this[i], s, r)) {
          return true
        }
      }
      return false
    }
  });


  var integrate = function (method, type, method2) {
        var _args = type ? [type] : []
        return function () {
          for (var i = 0, l = this.length; i < l; i++) {
            if (!arguments.length && method == 'add' && type) method = 'fire'
            bean[method].apply(this, [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0)))
          }
          return this
        }
      }
    , add = integrate('add')
    , remove = integrate('remove')
    , fire = integrate('fire')

    , methods = {
          on: add // NOTE: .on() is likely to change in the near future, don't rely on this as-is see https://github.com/fat/bean/issues/55
        , addListener: add
        , bind: add
        , listen: add
        , delegate: add

        , one: integrate('one')

        , off: remove
        , unbind: remove
        , unlisten: remove
        , removeListener: remove
        , undelegate: remove

        , emit: fire
        , trigger: fire

        , cloneEvents: integrate('clone')

        , hover: function (enter, leave, i) { // i for internal
            for (i = this.length; i--;) {
              bean.add.call(this, this[i], 'mouseenter', enter)
              bean.add.call(this, this[i], 'mouseleave', leave)
            }
            return this
          }
      }

    , shortcuts =
         ('blur change click dblclick error focus focusin focusout keydown keypress '
        + 'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup '
        + 'mousemove resize scroll select submit unload').split(' ')

  for (var i = shortcuts.length; i--;) {
    methods[shortcuts[i]] = integrate('add', shortcuts[i])
  }

  Dom.fn = $.extend(Dom.fn, methods);

  $.domReady = ready;
  Dom.fn = $.extend(Dom.fn, {
    ready: function (f) {
      ready(f)
      return this
    }
  });

  Dom.$ = function(selector, context) {
    if (!selector)
      return Dom();
    if (context !== undefined) 
      return Dom(qwery(selector, context), selector);
    else if (isFunction(selector))
      return ready(selector);
    else if (selector instanceof Dom) 
      return selector;
    else {
      var dom;
      if (isArray(selector)) 
        dom = compact(selector);
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null;
      else if (fragmentRE.test(selector))
        dom = bonzo.create(selector, context), selector = null;
      else if (selector.nodeType && selector.nodeType == 3) 
        dom = [selector];
      else 
        dom = qwery(selector);
      return Dom(dom, selector);
    }
  }

  Dom.constructor = function(dom, selector){
    dom = dom || [];
    dom.__proto__ = Dom.prototype;
    dom.selector = selector || '';
    return dom;
  };
  Dom.prototype = Dom.fn;
  function Dom() { return Dom.constructor.apply(this, arguments) }

  $.Dom = Dom;
  $.constructor = Dom.$;

  bonzo.setQueryEngine(Dom.$)
  bean.setSelectorEngine(Dom.$)
  

})(Core);
/*** EVENTS.JS ***/

/*!
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var addListener, removeListener
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
  
  removeListener = function (name, fn) {
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
  };
  
  emit = function (name) {
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
  };

  EventEmitter.prototype = {

    on: addListener,
    addListener: addListener,
    
    off: removeListener,
    removeListener: removeListener,
    
    emit: emit,
    trigger: emit,


    once: function (name, fn) {
      var self = this;

      function on() {
        self.off(name, on);
        fn.apply(this, arguments);
      };
      on.listener = fn;
      this.on(name, on);
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
    }
  };
  
  $.extend($, EventEmitter.prototype)

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
/*** PROMISE.JS ***/

/*!
 * Copyright (c) 2010 Kris Zyp
 * Copyright (c) 2012 Aliaksandr Zhuhrou <zhygrr@gmail.com>
 * Some ideas taken from dart implementation of futures
 */

(function($) {

  /**
   * Default constructor that creates a self-resolving Promise. Not all promise implementations
   * need to use this constructor.
   */
  var Promise = function(){
    this._isComplete = false;
    this._value = null;
    this._error = null;
    this._errorHandled = false;
    this._successListeners = [];
    this._errorHandlers = [];
    this._completionListeners = [];
  };

  Promise.prototype = {
    
    /**
     * @return a value for a resolved promise. Throws exception if a given promise
     * was either rejected or not resolved yet
     */
    value: function(){
      if (!this._isComplete) {
        throw new Error("Promise is not resolved yet!");
      }
      if (this._error !== null) {
        throw this._error;
      }

      return this._value;
    },

    /**
     * @return exception if a given promise was rejected.
     */
    error: function() {
      if (!this._isComplete) {
        throw new Error("Promise is not resolved yet!");
      }
      return this._error;
    },

    /** @return either given promise was resolved or rejected */
    isComplete: function() {
      return this._isComplete;
    },

    /** @return true if the promise was resolved. */
    hasValue: function() {
      return this._isComplete && this._error === null;
    },

    /**
     * If this promise is resolved and has a value, the resolvedCallback is called
     * with the value. If this promise is rejected then errorCallback is called.
     * throws an exception if errorCallback is not provided.
     *
     * If errorCallback returns true the error is considered handled
     * In other case the error will be throws when the promise is rejected.
     *
     * @param resolvedCallback callback invoked on resolution
     * @param errorCallback callback invoked on error handling (Optional)
     */
    then: function(resolvedCallback, errorCallback){
      if (this.hasValue()) {
        resolvedCallback(this._value);
      } else if (!this.isComplete()) {
        this._successListeners.push(resolvedCallback);
        if (errorCallback) {
          this._errorHandlers.push(errorCallback);
        }
      } else if (!this._errorHandled) {
        if (errorCallback) {
          errorCallback(this._error);
        } else {
          throw this._error;
        }
      }
    },

    /**
     * @param completeCallback invokes a given callback when promise is complete
     */
    onComplete: function(completeCallback) {
      if (this._isComplete) {
        try {
          completeCallback(this);
        } catch(e) {}
      } else {
        this._completionListeners.push(completeCallback);
      }
    },

    /**
     * Allows chain multiple async method that being based on promise api.
     * @param transformation async function that allows chain multiple promises
     */
    chain: function(transformation) {
      var deferred = new Deferred();
      this.onComplete(function( promise ) {
        if (!promise.hasValue()) {
          deferred.reject(promise.error());
          return;
        }

        try {
          var chainPromise = transformation(promise.value());
          chainPromise.then(function(value) { deferred.resolve(value); },
                  function(error) { deferred.reject(error); });
        } catch (e) {
          deferred.reject(e);
        }
      });
      return deferred.promise();
    },

    /**
     * Applies a sync transformation for a given future
     * @param transformation a sync transformation
     */
    transform: function(transformation) {
      var deferred = new Deferred();
      var that = this;
      this.onComplete(function(promise) {
        if (!that.hasValue()) {
          deferred.reject(promise.error());
        } else {
          try {
            var transformed = transformation(promise.value());
            deferred.resolve(transformed);
          } catch (e) {
            deferred.reject(e);
          }
        }
      });
      return deferred.promise();
    },

    /// Private prototype members

    /** Internal function that invoked either on resolving or rejecting of a given promise */
    _complete: function() {
      this._isComplete = true;

      try {
        if (this._error !== null) {
          for (var i = 0; i < this._errorHandlers.length; i++) {
            var handler = this._errorHandlers[i];
            if (handler(this._error) === true) {
              this._errorHandled = true;
              break;
            }
          }
        }

        if (this.hasValue()) {
          for (var i = 0; i < this._successListeners.length; i++) {
            var listener = this._successListeners[i];
            listener(this.value());
          }
        }
//        todo zhugrov a - should we throw exception in case if we don't explicitly stated that we have handled a exception
//        else {
//          if (!this._errorHandled) {
//            throw this._error;
//          }
//        }
      } finally {
        for (var i = 0; i < this._completionListeners.length; i++) {
          var listener = this._completionListeners[i];
          try {
            listener(this);
          }
          catch (e) {}
        }
      }
    },

    /**
     * Internal method used by Deferred for resolving a given promise
     * @param value
     * @private
     */
    _resolve: function(value) {
      if (this._isComplete) {
        throw new Error("This promise is already fulfilled");
      }
      this._value = value;
      this._complete();
    },

    /**
     * Internal method used by Deferred for rejecting a given promise
     * @param error
     * @private
     */
    _reject: function(error) {
      if (!error) {
        throw new Error("error argument should be provided");
      }
      if (this._isComplete) {
        throw new Error("This promise is already fulfilled");
      }

      this._error = error;
      this._complete();
    }
  };


  /** An utility that could create promises */
  function Deferred(){
    this._promise = new Promise();
  }
  
  Deferred.prototype = {
    
    /** @return a given promise */
    promise: function() {
      return this._promise;
    },

    /** calling resolve will resolve the promise */
    resolve: function(value){
      this._promise._resolve(value);
    },

    /** calling error will indicate that the promise failed */
    reject: function(error){
      this._promise._reject(error);
    }
    
  };
  
  // A deferred provides an API for creating and resolving a promise.
  $.Deferred = Deferred;
  
})(Core);
var $ = Core;
var require = $.require;