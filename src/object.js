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