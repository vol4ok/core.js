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
  
})(Core);
