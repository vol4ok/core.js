/*!
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

var Core = (function() {
  Core.constructor = function(){};
  Core.VERSION = "0.4.0";
  function Core() { return Core.constructor.apply(this, arguments) }
  return Core;
})();

(function($) {

  $.slice   = Array.prototype.slice;
  $.hasProp = $.hasOwnProperty = Object.prototype.hasOwnProperty;
  $.indexOf = Array.prototype.indexOf;
  
  $.bind = function(func) {
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
    var i, len;
    if (!$.m) $.m = {}
    module = {
      scopes: scopes,
      exports: {}
    };
    block(module, module.exports);
    for (i = 0, len = scopes.length; i < len; i++)
      $.m[scopes[i]] = module;
    return module.exports
  };
  
  $.require = function(module) {
    return $.m[module].exports;
  }

})(Core);

var $ = Core;
var require = $.require;

$.ns(['underscore'], function (module, exports) {
    (function () {
        var root = this;
        var previousUnderscore = root._;
        var breaker = {};
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
        var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
        var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
        var _ = function (obj) {
            if (obj instanceof _)
                return obj;
            if (!(this instanceof _))
                return new _(obj);
            this._wrapped = obj;
        };
        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = _;
            }
            exports._ = _;
        } else {
            root._ = _;
        }
        _.VERSION = '1.4.3';
        var each = _.each = _.forEach = function (obj, iterator, context) {
                if (obj == null)
                    return;
                if (nativeForEach && obj.forEach === nativeForEach) {
                    obj.forEach(iterator, context);
                } else if (obj.length === +obj.length) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        if (iterator.call(context, obj[i], i, obj) === breaker)
                            return;
                    }
                } else {
                    for (var key in obj) {
                        if (_.has(obj, key)) {
                            if (iterator.call(context, obj[key], key, obj) === breaker)
                                return;
                        }
                    }
                }
            };
        _.map = _.collect = function (obj, iterator, context) {
            var results = [];
            if (obj == null)
                return results;
            if (nativeMap && obj.map === nativeMap)
                return obj.map(iterator, context);
            each(obj, function (value, index, list) {
                results[results.length] = iterator.call(context, value, index, list);
            });
            return results;
        };
        var reduceError = 'Reduce of empty array with no initial value';
        _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            if (nativeReduce && obj.reduce === nativeReduce) {
                if (context)
                    iterator = _.bind(iterator, context);
                return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
            }
            each(obj, function (value, index, list) {
                if (!initial) {
                    memo = value;
                    initial = true;
                } else {
                    memo = iterator.call(context, memo, value, index, list);
                }
            });
            if (!initial)
                throw new TypeError(reduceError);
            return memo;
        };
        _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
                if (context)
                    iterator = _.bind(iterator, context);
                return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
            }
            var length = obj.length;
            if (length !== +length) {
                var keys = _.keys(obj);
                length = keys.length;
            }
            each(obj, function (value, index, list) {
                index = keys ? keys[--length] : --length;
                if (!initial) {
                    memo = obj[index];
                    initial = true;
                } else {
                    memo = iterator.call(context, memo, obj[index], index, list);
                }
            });
            if (!initial)
                throw new TypeError(reduceError);
            return memo;
        };
        _.find = _.detect = function (obj, iterator, context) {
            var result;
            any(obj, function (value, index, list) {
                if (iterator.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });
            return result;
        };
        _.filter = _.select = function (obj, iterator, context) {
            var results = [];
            if (obj == null)
                return results;
            if (nativeFilter && obj.filter === nativeFilter)
                return obj.filter(iterator, context);
            each(obj, function (value, index, list) {
                if (iterator.call(context, value, index, list))
                    results[results.length] = value;
            });
            return results;
        };
        _.reject = function (obj, iterator, context) {
            return _.filter(obj, function (value, index, list) {
                return !iterator.call(context, value, index, list);
            }, context);
        };
        _.every = _.all = function (obj, iterator, context) {
            iterator || (iterator = _.identity);
            var result = true;
            if (obj == null)
                return result;
            if (nativeEvery && obj.every === nativeEvery)
                return obj.every(iterator, context);
            each(obj, function (value, index, list) {
                if (!(result = result && iterator.call(context, value, index, list)))
                    return breaker;
            });
            return !!result;
        };
        var any = _.some = _.any = function (obj, iterator, context) {
                iterator || (iterator = _.identity);
                var result = false;
                if (obj == null)
                    return result;
                if (nativeSome && obj.some === nativeSome)
                    return obj.some(iterator, context);
                each(obj, function (value, index, list) {
                    if (result || (result = iterator.call(context, value, index, list)))
                        return breaker;
                });
                return !!result;
            };
        _.contains = _.include = function (obj, target) {
            if (obj == null)
                return false;
            if (nativeIndexOf && obj.indexOf === nativeIndexOf)
                return obj.indexOf(target) != -1;
            return any(obj, function (value) {
                return value === target;
            });
        };
        _.invoke = function (obj, method) {
            var args = slice.call(arguments, 2);
            return _.map(obj, function (value) {
                return (_.isFunction(method) ? method : value[method]).apply(value, args);
            });
        };
        _.pluck = function (obj, key) {
            return _.map(obj, function (value) {
                return value[key];
            });
        };
        _.where = function (obj, attrs) {
            if (_.isEmpty(attrs))
                return [];
            return _.filter(obj, function (value) {
                for (var key in attrs) {
                    if (attrs[key] !== value[key])
                        return false;
                }
                return true;
            });
        };
        _.max = function (obj, iterator, context) {
            if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                return Math.max.apply(Math, obj);
            }
            if (!iterator && _.isEmpty(obj))
                return -Infinity;
            var result = {
                    computed: -Infinity,
                    value: -Infinity
                };
            each(obj, function (value, index, list) {
                var computed = iterator ? iterator.call(context, value, index, list) : value;
                computed >= result.computed && (result = {
                    value: value,
                    computed: computed
                });
            });
            return result.value;
        };
        _.min = function (obj, iterator, context) {
            if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                return Math.min.apply(Math, obj);
            }
            if (!iterator && _.isEmpty(obj))
                return Infinity;
            var result = {
                    computed: Infinity,
                    value: Infinity
                };
            each(obj, function (value, index, list) {
                var computed = iterator ? iterator.call(context, value, index, list) : value;
                computed < result.computed && (result = {
                    value: value,
                    computed: computed
                });
            });
            return result.value;
        };
        _.shuffle = function (obj) {
            var rand;
            var index = 0;
            var shuffled = [];
            each(obj, function (value) {
                rand = _.random(index++);
                shuffled[index - 1] = shuffled[rand];
                shuffled[rand] = value;
            });
            return shuffled;
        };
        var lookupIterator = function (value) {
            return _.isFunction(value) ? value : function (obj) {
                return obj[value];
            };
        };
        _.sortBy = function (obj, value, context) {
            var iterator = lookupIterator(value);
            return _.pluck(_.map(obj, function (value, index, list) {
                return {
                    value: value,
                    index: index,
                    criteria: iterator.call(context, value, index, list)
                };
            }).sort(function (left, right) {
                var a = left.criteria;
                var b = right.criteria;
                if (a !== b) {
                    if (a > b || a === void 0)
                        return 1;
                    if (a < b || b === void 0)
                        return -1;
                }
                return left.index < right.index ? -1 : 1;
            }), 'value');
        };
        var group = function (obj, value, context, behavior) {
            var result = {};
            var iterator = lookupIterator(value || _.identity);
            each(obj, function (value, index) {
                var key = iterator.call(context, value, index, obj);
                behavior(result, key, value);
            });
            return result;
        };
        _.groupBy = function (obj, value, context) {
            return group(obj, value, context, function (result, key, value) {
                (_.has(result, key) ? result[key] : result[key] = []).push(value);
            });
        };
        _.countBy = function (obj, value, context) {
            return group(obj, value, context, function (result, key) {
                if (!_.has(result, key))
                    result[key] = 0;
                result[key]++;
            });
        };
        _.sortedIndex = function (array, obj, iterator, context) {
            iterator = iterator == null ? _.identity : lookupIterator(iterator);
            var value = iterator.call(context, obj);
            var low = 0, high = array.length;
            while (low < high) {
                var mid = low + high >>> 1;
                iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
        };
        _.toArray = function (obj) {
            if (!obj)
                return [];
            if (_.isArray(obj))
                return slice.call(obj);
            if (obj.length === +obj.length)
                return _.map(obj, _.identity);
            return _.values(obj);
        };
        _.size = function (obj) {
            if (obj == null)
                return 0;
            return obj.length === +obj.length ? obj.length : _.keys(obj).length;
        };
        _.first = _.head = _.take = function (array, n, guard) {
            if (array == null)
                return void 0;
            return n != null && !guard ? slice.call(array, 0, n) : array[0];
        };
        _.initial = function (array, n, guard) {
            return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
        };
        _.last = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n != null && !guard) {
                return slice.call(array, Math.max(array.length - n, 0));
            } else {
                return array[array.length - 1];
            }
        };
        _.rest = _.tail = _.drop = function (array, n, guard) {
            return slice.call(array, n == null || guard ? 1 : n);
        };
        _.compact = function (array) {
            return _.filter(array, _.identity);
        };
        var flatten = function (input, shallow, output) {
            each(input, function (value) {
                if (_.isArray(value)) {
                    shallow ? push.apply(output, value) : flatten(value, shallow, output);
                } else {
                    output.push(value);
                }
            });
            return output;
        };
        _.flatten = function (array, shallow) {
            return flatten(array, shallow, []);
        };
        _.without = function (array) {
            return _.difference(array, slice.call(arguments, 1));
        };
        _.uniq = _.unique = function (array, isSorted, iterator, context) {
            if (_.isFunction(isSorted)) {
                context = iterator;
                iterator = isSorted;
                isSorted = false;
            }
            var initial = iterator ? _.map(array, iterator, context) : array;
            var results = [];
            var seen = [];
            each(initial, function (value, index) {
                if (isSorted ? !index || seen[seen.length - 1] !== value : !_.contains(seen, value)) {
                    seen.push(value);
                    results.push(array[index]);
                }
            });
            return results;
        };
        _.union = function () {
            return _.uniq(concat.apply(ArrayProto, arguments));
        };
        _.intersection = function (array) {
            var rest = slice.call(arguments, 1);
            return _.filter(_.uniq(array), function (item) {
                return _.every(rest, function (other) {
                    return _.indexOf(other, item) >= 0;
                });
            });
        };
        _.difference = function (array) {
            var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
            return _.filter(array, function (value) {
                return !_.contains(rest, value);
            });
        };
        _.zip = function () {
            var args = slice.call(arguments);
            var length = _.max(_.pluck(args, 'length'));
            var results = new Array(length);
            for (var i = 0; i < length; i++) {
                results[i] = _.pluck(args, '' + i);
            }
            return results;
        };
        _.object = function (list, values) {
            if (list == null)
                return {};
            var result = {};
            for (var i = 0, l = list.length; i < l; i++) {
                if (values) {
                    result[list[i]] = values[i];
                } else {
                    result[list[i][0]] = list[i][1];
                }
            }
            return result;
        };
        _.indexOf = function (array, item, isSorted) {
            if (array == null)
                return -1;
            var i = 0, l = array.length;
            if (isSorted) {
                if (typeof isSorted == 'number') {
                    i = isSorted < 0 ? Math.max(0, l + isSorted) : isSorted;
                } else {
                    i = _.sortedIndex(array, item);
                    return array[i] === item ? i : -1;
                }
            }
            if (nativeIndexOf && array.indexOf === nativeIndexOf)
                return array.indexOf(item, isSorted);
            for (; i < l; i++)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.lastIndexOf = function (array, item, from) {
            if (array == null)
                return -1;
            var hasIndex = from != null;
            if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
                return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
            }
            var i = hasIndex ? from : array.length;
            while (i--)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.range = function (start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = arguments[2] || 1;
            var len = Math.max(Math.ceil((stop - start) / step), 0);
            var idx = 0;
            var range = new Array(len);
            while (idx < len) {
                range[idx++] = start;
                start += step;
            }
            return range;
        };
        var ctor = function () {
        };
        _.bind = function (func, context) {
            var args, bound;
            if (func.bind === nativeBind && nativeBind)
                return nativeBind.apply(func, slice.call(arguments, 1));
            if (!_.isFunction(func))
                throw new TypeError();
            args = slice.call(arguments, 2);
            return bound = function () {
                if (!(this instanceof bound))
                    return func.apply(context, args.concat(slice.call(arguments)));
                ctor.prototype = func.prototype;
                var self = new ctor();
                ctor.prototype = null;
                var result = func.apply(self, args.concat(slice.call(arguments)));
                if (Object(result) === result)
                    return result;
                return self;
            };
        };
        _.bindAll = function (obj) {
            var funcs = slice.call(arguments, 1);
            if (funcs.length == 0)
                funcs = _.functions(obj);
            each(funcs, function (f) {
                obj[f] = _.bind(obj[f], obj);
            });
            return obj;
        };
        _.memoize = function (func, hasher) {
            var memo = {};
            hasher || (hasher = _.identity);
            return function () {
                var key = hasher.apply(this, arguments);
                return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
            };
        };
        _.delay = function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        };
        _.defer = function (func) {
            return _.delay.apply(_, [
                func,
                1
            ].concat(slice.call(arguments, 1)));
        };
        _.throttle = function (func, wait) {
            var context, args, timeout, result;
            var previous = 0;
            var later = function () {
                previous = new Date();
                timeout = null;
                result = func.apply(context, args);
            };
            return function () {
                var now = new Date();
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        };
        _.debounce = function (func, wait, immediate) {
            var timeout, result;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate)
                        result = func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow)
                    result = func.apply(context, args);
                return result;
            };
        };
        _.once = function (func) {
            var ran = false, memo;
            return function () {
                if (ran)
                    return memo;
                ran = true;
                memo = func.apply(this, arguments);
                func = null;
                return memo;
            };
        };
        _.wrap = function (func, wrapper) {
            return function () {
                var args = [func];
                push.apply(args, arguments);
                return wrapper.apply(this, args);
            };
        };
        _.compose = function () {
            var funcs = arguments;
            return function () {
                var args = arguments;
                for (var i = funcs.length - 1; i >= 0; i--) {
                    args = [funcs[i].apply(this, args)];
                }
                return args[0];
            };
        };
        _.after = function (times, func) {
            if (times <= 0)
                return func();
            return function () {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };
        _.keys = nativeKeys || function (obj) {
            if (obj !== Object(obj))
                throw new TypeError('Invalid object');
            var keys = [];
            for (var key in obj)
                if (_.has(obj, key))
                    keys[keys.length] = key;
            return keys;
        };
        _.values = function (obj) {
            var values = [];
            for (var key in obj)
                if (_.has(obj, key))
                    values.push(obj[key]);
            return values;
        };
        _.pairs = function (obj) {
            var pairs = [];
            for (var key in obj)
                if (_.has(obj, key))
                    pairs.push([
                        key,
                        obj[key]
                    ]);
            return pairs;
        };
        _.invert = function (obj) {
            var result = {};
            for (var key in obj)
                if (_.has(obj, key))
                    result[obj[key]] = key;
            return result;
        };
        _.functions = _.methods = function (obj) {
            var names = [];
            for (var key in obj) {
                if (_.isFunction(obj[key]))
                    names.push(key);
            }
            return names.sort();
        };
        _.extend = function (obj) {
            each(slice.call(arguments, 1), function (source) {
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        };
        _.pick = function (obj) {
            var copy = {};
            var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
            each(keys, function (key) {
                if (key in obj)
                    copy[key] = obj[key];
            });
            return copy;
        };
        _.omit = function (obj) {
            var copy = {};
            var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
            for (var key in obj) {
                if (!_.contains(keys, key))
                    copy[key] = obj[key];
            }
            return copy;
        };
        _.defaults = function (obj) {
            each(slice.call(arguments, 1), function (source) {
                if (source) {
                    for (var prop in source) {
                        if (obj[prop] == null)
                            obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        };
        _.clone = function (obj) {
            if (!_.isObject(obj))
                return obj;
            return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
        };
        _.tap = function (obj, interceptor) {
            interceptor(obj);
            return obj;
        };
        var eq = function (a, b, aStack, bStack) {
            if (a === b)
                return a !== 0 || 1 / a == 1 / b;
            if (a == null || b == null)
                return a === b;
            if (a instanceof _)
                a = a._wrapped;
            if (b instanceof _)
                b = b._wrapped;
            var className = toString.call(a);
            if (className != toString.call(b))
                return false;
            switch (className) {
            case '[object String]':
                return a == String(b);
            case '[object Number]':
                return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a == +b;
            case '[object RegExp]':
                return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
            }
            if (typeof a != 'object' || typeof b != 'object')
                return false;
            var length = aStack.length;
            while (length--) {
                if (aStack[length] == a)
                    return bStack[length] == b;
            }
            aStack.push(a);
            bStack.push(b);
            var size = 0, result = true;
            if (className == '[object Array]') {
                size = a.length;
                result = size == b.length;
                if (result) {
                    while (size--) {
                        if (!(result = eq(a[size], b[size], aStack, bStack)))
                            break;
                    }
                }
            } else {
                var aCtor = a.constructor, bCtor = b.constructor;
                if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                    return false;
                }
                for (var key in a) {
                    if (_.has(a, key)) {
                        size++;
                        if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)))
                            break;
                    }
                }
                if (result) {
                    for (key in b) {
                        if (_.has(b, key) && !size--)
                            break;
                    }
                    result = !size;
                }
            }
            aStack.pop();
            bStack.pop();
            return result;
        };
        _.isEqual = function (a, b) {
            return eq(a, b, [], []);
        };
        _.isEmpty = function (obj) {
            if (obj == null)
                return true;
            if (_.isArray(obj) || _.isString(obj))
                return obj.length === 0;
            for (var key in obj)
                if (_.has(obj, key))
                    return false;
            return true;
        };
        _.isElement = function (obj) {
            return !!(obj && obj.nodeType === 1);
        };
        _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) == '[object Array]';
        };
        _.isObject = function (obj) {
            return obj === Object(obj);
        };
        each([
            'Arguments',
            'Function',
            'String',
            'Number',
            'Date',
            'RegExp'
        ], function (name) {
            _['is' + name] = function (obj) {
                return toString.call(obj) == '[object ' + name + ']';
            };
        });
        if (!_.isArguments(arguments)) {
            _.isArguments = function (obj) {
                return !!(obj && _.has(obj, 'callee'));
            };
        }
        if (typeof /./ !== 'function') {
            _.isFunction = function (obj) {
                return typeof obj === 'function';
            };
        }
        _.isFinite = function (obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        };
        _.isNaN = function (obj) {
            return _.isNumber(obj) && obj != +obj;
        };
        _.isBoolean = function (obj) {
            return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
        };
        _.isNull = function (obj) {
            return obj === null;
        };
        _.isUndefined = function (obj) {
            return obj === void 0;
        };
        _.has = function (obj, key) {
            return hasOwnProperty.call(obj, key);
        };
        _.noConflict = function () {
            root._ = previousUnderscore;
            return this;
        };
        _.identity = function (value) {
            return value;
        };
        _.times = function (n, iterator, context) {
            var accum = Array(n);
            for (var i = 0; i < n; i++)
                accum[i] = iterator.call(context, i);
            return accum;
        };
        _.random = function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + (0 | Math.random() * (max - min + 1));
        };
        var entityMap = {
                escape: {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    '\'': '&#x27;',
                    '/': '&#x2F;'
                }
            };
        entityMap.unescape = _.invert(entityMap.escape);
        var entityRegexes = {
                escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
                unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
            };
        _.each([
            'escape',
            'unescape'
        ], function (method) {
            _[method] = function (string) {
                if (string == null)
                    return '';
                return ('' + string).replace(entityRegexes[method], function (match) {
                    return entityMap[method][match];
                });
            };
        });
        _.result = function (object, property) {
            if (object == null)
                return null;
            var value = object[property];
            return _.isFunction(value) ? value.call(object) : value;
        };
        _.mixin = function (obj) {
            each(_.functions(obj), function (name) {
                var func = _[name] = obj[name];
                _.prototype[name] = function () {
                    var args = [this._wrapped];
                    push.apply(args, arguments);
                    return result.call(this, func.apply(_, args));
                };
            });
        };
        var idCounter = 0;
        _.uniqueId = function (prefix) {
            var id = '' + ++idCounter;
            return prefix ? prefix + id : id;
        };
        _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/;
        var escapes = {
                '\'': '\'',
                '\\': '\\',
                '\r': 'r',
                '\n': 'n',
                '\t': 't',
                '\u2028': 'u2028',
                '\u2029': 'u2029'
            };
        var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        _.template = function (text, data, settings) {
            settings = _.defaults({}, settings, _.templateSettings);
            var matcher = new RegExp([
                    (settings.escape || noMatch).source,
                    (settings.interpolate || noMatch).source,
                    (settings.evaluate || noMatch).source
                ].join('|') + '|$', 'g');
            var index = 0;
            var source = '__p+=\'';
            text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset).replace(escaper, function (match) {
                    return '\\' + escapes[match];
                });
                if (escape) {
                    source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
                }
                if (interpolate) {
                    source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
                }
                if (evaluate) {
                    source += '\';\n' + evaluate + '\n__p+=\'';
                }
                index = offset + match.length;
                return match;
            });
            source += '\';\n';
            if (!settings.variable)
                source = 'with(obj||{}){\n' + source + '}\n';
            source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';
            try {
                var render = new Function(settings.variable || 'obj', '_', source);
            } catch (e) {
                e.source = source;
                throw e;
            }
            if (data)
                return render(data, _);
            var template = function (data) {
                return render.call(this, data, _);
            };
            template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
            return template;
        };
        _.chain = function (obj) {
            return _(obj).chain();
        };
        var result = function (obj) {
            return this._chain ? _(obj).chain() : obj;
        };
        _.mixin(_);
        each([
            'pop',
            'push',
            'reverse',
            'shift',
            'sort',
            'splice',
            'unshift'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                var obj = this._wrapped;
                method.apply(obj, arguments);
                if ((name == 'shift' || name == 'splice') && obj.length === 0)
                    delete obj[0];
                return result.call(this, obj);
            };
        });
        each([
            'concat',
            'join',
            'slice'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                return result.call(this, method.apply(this._wrapped, arguments));
            };
        });
        _.extend(_.prototype, {
            chain: function () {
                this._chain = true;
                return this;
            },
            value: function () {
                return this._wrapped;
            }
        });
    }.call(this));
});

/*!
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){
  _ = require("underscore");
  delete _.VERSION;
  $.ext(_);

  // Array Remove - By John Resig (MIT Licensed)
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

})(Core);

$.ns(['underscore.string'], function (module, exports) {
    !function (root, String) {
        'use strict';
        var nativeTrim = String.prototype.trim;
        var nativeTrimRight = String.prototype.trimRight;
        var nativeTrimLeft = String.prototype.trimLeft;
        var parseNumber = function (source) {
            return source * 1 || 0;
        };
        var strRepeat = function (str, qty) {
            if (qty < 1)
                return '';
            var result = '';
            while (qty > 0) {
                if (qty & 1)
                    result += str;
                qty >>= 1, str += str;
            }
            return result;
        };
        var slice = [].slice;
        var defaultToWhiteSpace = function (characters) {
            if (characters == null)
                return '\\s';
            else if (characters.source)
                return characters.source;
            else
                return '[' + _s.escapeRegExp(characters) + ']';
        };
        var escapeChars = {
                lt: '<',
                gt: '>',
                quot: '"',
                amp: '&',
                apos: '\''
            };
        var reversedEscapeChars = {};
        for (var key in escapeChars)
            reversedEscapeChars[escapeChars[key]] = key;
        reversedEscapeChars['\''] = '#39';
        var sprintf = function () {
                function get_type(variable) {
                    return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
                }
                var str_repeat = strRepeat;
                var str_format = function () {
                    if (!str_format.cache.hasOwnProperty(arguments[0])) {
                        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
                    }
                    return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
                };
                str_format.format = function (parse_tree, argv) {
                    var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
                    for (i = 0; i < tree_length; i++) {
                        node_type = get_type(parse_tree[i]);
                        if (node_type === 'string') {
                            output.push(parse_tree[i]);
                        } else if (node_type === 'array') {
                            match = parse_tree[i];
                            if (match[2]) {
                                arg = argv[cursor];
                                for (k = 0; k < match[2].length; k++) {
                                    if (!arg.hasOwnProperty(match[2][k])) {
                                        throw new Error(sprintf('[_.sprintf] property "%s" does not exist', match[2][k]));
                                    }
                                    arg = arg[match[2][k]];
                                }
                            } else if (match[1]) {
                                arg = argv[match[1]];
                            } else {
                                arg = argv[cursor++];
                            }
                            if (/[^s]/.test(match[8]) && get_type(arg) != 'number') {
                                throw new Error(sprintf('[_.sprintf] expecting number but found %s', get_type(arg)));
                            }
                            switch (match[8]) {
                            case 'b':
                                arg = arg.toString(2);
                                break;
                            case 'c':
                                arg = String.fromCharCode(arg);
                                break;
                            case 'd':
                                arg = parseInt(arg, 10);
                                break;
                            case 'e':
                                arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                                break;
                            case 'f':
                                arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                                break;
                            case 'o':
                                arg = arg.toString(8);
                                break;
                            case 's':
                                arg = (arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg;
                                break;
                            case 'u':
                                arg = Math.abs(arg);
                                break;
                            case 'x':
                                arg = arg.toString(16);
                                break;
                            case 'X':
                                arg = arg.toString(16).toUpperCase();
                                break;
                            }
                            arg = /[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg;
                            pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                            pad_length = match[6] - String(arg).length;
                            pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                            output.push(match[5] ? arg + pad : pad + arg);
                        }
                    }
                    return output.join('');
                };
                str_format.cache = {};
                str_format.parse = function (fmt) {
                    var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
                    while (_fmt) {
                        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                            parse_tree.push(match[0]);
                        } else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                            parse_tree.push('%');
                        } else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                            if (match[2]) {
                                arg_names |= 1;
                                var field_list = [], replacement_field = match[2], field_match = [];
                                if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                    while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                        if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                            field_list.push(field_match[1]);
                                        } else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                            field_list.push(field_match[1]);
                                        } else {
                                            throw new Error('[_.sprintf] huh?');
                                        }
                                    }
                                } else {
                                    throw new Error('[_.sprintf] huh?');
                                }
                                match[2] = field_list;
                            } else {
                                arg_names |= 2;
                            }
                            if (arg_names === 3) {
                                throw new Error('[_.sprintf] mixing positional and named placeholders is not (yet) supported');
                            }
                            parse_tree.push(match);
                        } else {
                            throw new Error('[_.sprintf] huh?');
                        }
                        _fmt = _fmt.substring(match[0].length);
                    }
                    return parse_tree;
                };
                return str_format;
            }();
        var _s = {
                VERSION: '2.3.0',
                isBlank: function (str) {
                    if (str == null)
                        str = '';
                    return /^\s*$/.test(str);
                },
                stripTags: function (str) {
                    if (str == null)
                        return '';
                    return String(str).replace(/<\/?[^>]+>/g, '');
                },
                capitalize: function (str) {
                    str = str == null ? '' : String(str);
                    return str.charAt(0).toUpperCase() + str.slice(1);
                },
                chop: function (str, step) {
                    if (str == null)
                        return [];
                    str = String(str);
                    step = ~~step;
                    return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
                },
                clean: function (str) {
                    return _s.strip(str).replace(/\s+/g, ' ');
                },
                count: function (str, substr) {
                    if (str == null || substr == null)
                        return 0;
                    str = String(str);
                    substr = String(substr);
                    var count = 0, pos = 0, length = substr.length;
                    while (true) {
                        pos = str.indexOf(substr, pos);
                        if (pos === -1)
                            break;
                        count++;
                        pos += length;
                    }
                    return count;
                },
                chars: function (str) {
                    if (str == null)
                        return [];
                    return String(str).split('');
                },
                swapCase: function (str) {
                    if (str == null)
                        return '';
                    return String(str).replace(/\S/g, function (c) {
                        return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
                    });
                },
                escapeHTML: function (str) {
                    if (str == null)
                        return '';
                    return String(str).replace(/[&<>"']/g, function (m) {
                        return '&' + reversedEscapeChars[m] + ';';
                    });
                },
                unescapeHTML: function (str) {
                    if (str == null)
                        return '';
                    return String(str).replace(/\&([^;]+);/g, function (entity, entityCode) {
                        var match;
                        if (entityCode in escapeChars) {
                            return escapeChars[entityCode];
                        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
                            return String.fromCharCode(parseInt(match[1], 16));
                        } else if (match = entityCode.match(/^#(\d+)$/)) {
                            return String.fromCharCode(~~match[1]);
                        } else {
                            return entity;
                        }
                    });
                },
                escapeRegExp: function (str) {
                    if (str == null)
                        return '';
                    return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
                },
                splice: function (str, i, howmany, substr) {
                    var arr = _s.chars(str);
                    arr.splice(~~i, ~~howmany, substr);
                    return arr.join('');
                },
                insert: function (str, i, substr) {
                    return _s.splice(str, i, 0, substr);
                },
                include: function (str, needle) {
                    if (needle === '')
                        return true;
                    if (str == null)
                        return false;
                    return String(str).indexOf(needle) !== -1;
                },
                join: function () {
                    var args = slice.call(arguments), separator = args.shift();
                    if (separator == null)
                        separator = '';
                    return args.join(separator);
                },
                lines: function (str) {
                    if (str == null)
                        return [];
                    return String(str).split('\n');
                },
                reverse: function (str) {
                    return _s.chars(str).reverse().join('');
                },
                startsWith: function (str, starts) {
                    if (starts === '')
                        return true;
                    if (str == null || starts == null)
                        return false;
                    str = String(str);
                    starts = String(starts);
                    return str.length >= starts.length && str.slice(0, starts.length) === starts;
                },
                endsWith: function (str, ends) {
                    if (ends === '')
                        return true;
                    if (str == null || ends == null)
                        return false;
                    str = String(str);
                    ends = String(ends);
                    return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
                },
                succ: function (str) {
                    if (str == null)
                        return '';
                    str = String(str);
                    return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
                },
                titleize: function (str) {
                    if (str == null)
                        return '';
                    return String(str).replace(/(?:^|\s)\S/g, function (c) {
                        return c.toUpperCase();
                    });
                },
                camelize: function (str) {
                    return _s.trim(str).replace(/[-_\s]+(.)?/g, function (match, c) {
                        return c.toUpperCase();
                    });
                },
                underscored: function (str) {
                    return _s.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
                },
                dasherize: function (str) {
                    return _s.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
                },
                classify: function (str) {
                    return _s.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
                },
                humanize: function (str) {
                    return _s.capitalize(_s.underscored(str).replace(/_id$/, '').replace(/_/g, ' '));
                },
                trim: function (str, characters) {
                    if (str == null)
                        return '';
                    if (!characters && nativeTrim)
                        return nativeTrim.call(str);
                    characters = defaultToWhiteSpace(characters);
                    return String(str).replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
                },
                ltrim: function (str, characters) {
                    if (str == null)
                        return '';
                    if (!characters && nativeTrimLeft)
                        return nativeTrimLeft.call(str);
                    characters = defaultToWhiteSpace(characters);
                    return String(str).replace(new RegExp('^' + characters + '+'), '');
                },
                rtrim: function (str, characters) {
                    if (str == null)
                        return '';
                    if (!characters && nativeTrimRight)
                        return nativeTrimRight.call(str);
                    characters = defaultToWhiteSpace(characters);
                    return String(str).replace(new RegExp(characters + '+$'), '');
                },
                truncate: function (str, length, truncateStr) {
                    if (str == null)
                        return '';
                    str = String(str);
                    truncateStr = truncateStr || '...';
                    length = ~~length;
                    return str.length > length ? str.slice(0, length) + truncateStr : str;
                },
                prune: function (str, length, pruneStr) {
                    if (str == null)
                        return '';
                    str = String(str);
                    length = ~~length;
                    pruneStr = pruneStr != null ? String(pruneStr) : '...';
                    if (str.length <= length)
                        return str;
                    var tmpl = function (c) {
                            return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' ';
                        }, template = str.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, tmpl);
                    if (template.slice(template.length - 2).match(/\w\w/))
                        template = template.replace(/\s*\S+$/, '');
                    else
                        template = _s.rtrim(template.slice(0, template.length - 1));
                    return (template + pruneStr).length > str.length ? str : str.slice(0, template.length) + pruneStr;
                },
                words: function (str, delimiter) {
                    if (_s.isBlank(str))
                        return [];
                    return _s.trim(str, delimiter).split(delimiter || /\s+/);
                },
                pad: function (str, length, padStr, type) {
                    str = str == null ? '' : String(str);
                    length = ~~length;
                    var padlen = 0;
                    if (!padStr)
                        padStr = ' ';
                    else if (padStr.length > 1)
                        padStr = padStr.charAt(0);
                    switch (type) {
                    case 'right':
                        padlen = length - str.length;
                        return str + strRepeat(padStr, padlen);
                    case 'both':
                        padlen = length - str.length;
                        return strRepeat(padStr, Math.ceil(padlen / 2)) + str + strRepeat(padStr, Math.floor(padlen / 2));
                    default:
                        padlen = length - str.length;
                        return strRepeat(padStr, padlen) + str;
                    }
                },
                lpad: function (str, length, padStr) {
                    return _s.pad(str, length, padStr);
                },
                rpad: function (str, length, padStr) {
                    return _s.pad(str, length, padStr, 'right');
                },
                lrpad: function (str, length, padStr) {
                    return _s.pad(str, length, padStr, 'both');
                },
                sprintf: sprintf,
                vsprintf: function (fmt, argv) {
                    argv.unshift(fmt);
                    return sprintf.apply(null, argv);
                },
                toNumber: function (str, decimals) {
                    if (!str)
                        return 0;
                    str = _s.trim(str);
                    if (!str.match(/^-?\d+(?:\.\d+)?$/))
                        return NaN;
                    return parseNumber(parseNumber(str).toFixed(~~decimals));
                },
                numberFormat: function (number, dec, dsep, tsep) {
                    if (isNaN(number) || number == null)
                        return '';
                    number = number.toFixed(~~dec);
                    tsep = typeof tsep == 'string' ? tsep : ',';
                    var parts = number.split('.'), fnums = parts[0], decimals = parts[1] ? (dsep || '.') + parts[1] : '';
                    return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
                },
                strRight: function (str, sep) {
                    if (str == null)
                        return '';
                    str = String(str);
                    sep = sep != null ? String(sep) : sep;
                    var pos = !sep ? -1 : str.indexOf(sep);
                    return ~pos ? str.slice(pos + sep.length, str.length) : str;
                },
                strRightBack: function (str, sep) {
                    if (str == null)
                        return '';
                    str = String(str);
                    sep = sep != null ? String(sep) : sep;
                    var pos = !sep ? -1 : str.lastIndexOf(sep);
                    return ~pos ? str.slice(pos + sep.length, str.length) : str;
                },
                strLeft: function (str, sep) {
                    if (str == null)
                        return '';
                    str = String(str);
                    sep = sep != null ? String(sep) : sep;
                    var pos = !sep ? -1 : str.indexOf(sep);
                    return ~pos ? str.slice(0, pos) : str;
                },
                strLeftBack: function (str, sep) {
                    if (str == null)
                        return '';
                    str += '';
                    sep = sep != null ? '' + sep : sep;
                    var pos = str.lastIndexOf(sep);
                    return ~pos ? str.slice(0, pos) : str;
                },
                toSentence: function (array, separator, lastSeparator, serial) {
                    separator = separator || ', ';
                    lastSeparator = lastSeparator || ' and ';
                    var a = array.slice(), lastMember = a.pop();
                    if (array.length > 2 && serial)
                        lastSeparator = _s.rtrim(separator) + lastSeparator;
                    return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;
                },
                toSentenceSerial: function () {
                    var args = slice.call(arguments);
                    args[3] = true;
                    return _s.toSentence.apply(_s, args);
                },
                slugify: function (str) {
                    if (str == null)
                        return '';
                    var from = '\u0105\xe0\xe1\xe4\xe2\xe3\xe5\xe6\u0107\u0119\xe8\xe9\xeb\xea\xec\xed\xef\xee\u0142\u0144\xf2\xf3\xf6\xf4\xf5\xf8\xf9\xfa\xfc\xfb\xf1\xe7\u017c\u017a', to = 'aaaaaaaaceeeeeiiiilnoooooouuuunczz', regex = new RegExp(defaultToWhiteSpace(from), 'g');
                    str = String(str).toLowerCase().replace(regex, function (c) {
                        var index = from.indexOf(c);
                        return to.charAt(index) || '-';
                    });
                    return _s.dasherize(str.replace(/[^\w\s-]/g, ''));
                },
                surround: function (str, wrapper) {
                    return [
                        wrapper,
                        str,
                        wrapper
                    ].join('');
                },
                quote: function (str) {
                    return _s.surround(str, '"');
                },
                exports: function () {
                    var result = {};
                    for (var prop in this) {
                        if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse)$/))
                            continue;
                        result[prop] = this[prop];
                    }
                    return result;
                },
                repeat: function (str, qty, separator) {
                    if (str == null)
                        return '';
                    qty = ~~qty;
                    if (separator == null)
                        return strRepeat(String(str), qty);
                    for (var repeat = []; qty > 0; repeat[--qty] = str) {
                    }
                    return repeat.join(separator);
                },
                levenshtein: function (str1, str2) {
                    if (str1 == null && str2 == null)
                        return 0;
                    if (str1 == null)
                        return String(str2).length;
                    if (str2 == null)
                        return String(str1).length;
                    str1 = String(str1);
                    str2 = String(str2);
                    var current = [], prev, value;
                    for (var i = 0; i <= str2.length; i++)
                        for (var j = 0; j <= str1.length; j++) {
                            if (i && j)
                                if (str1.charAt(j - 1) === str2.charAt(i - 1))
                                    value = prev;
                                else
                                    value = Math.min(current[j], current[j - 1], prev) + 1;
                            else
                                value = i + j;
                            prev = current[j];
                            current[j] = value;
                        }
                    return current.pop();
                }
            };
        _s.strip = _s.trim;
        _s.lstrip = _s.ltrim;
        _s.rstrip = _s.rtrim;
        _s.center = _s.lrpad;
        _s.rjust = _s.lpad;
        _s.ljust = _s.rpad;
        _s.contains = _s.include;
        _s.q = _s.quote;
        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports)
                module.exports = _s;
            exports._s = _s;
        }
        if (typeof define === 'function' && define.amd)
            define('underscore.string', [], function () {
                return _s;
            });
        root._ = root._ || {};
        root._.string = root._.str = _s;
    }(this, String);
});

/*!
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){
  _s = require("underscore.string");
  delete _s.VERSION;
  $.ext(_s);
})(Core);

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

(function($){

  var guid_rexp = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  $.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var 
        r = Math.random() * 16 | 0,
        v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    }).toUpperCase();
  };

  $.checkGuid = function(id) {
    return guid_rexp.test(id);
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

$.ns(['bonzo'], function (module, exports) {
    (function (name, context, definition) {
        if (typeof module != 'undefined' && module.exports)
            module.exports = definition();
        else if (typeof context['define'] == 'function' && context['define']['amd'])
            define(definition);
        else
            context[name] = definition();
    }('bonzo', this, function () {
        var win = window, doc = win.document, html = doc.documentElement, parentNode = 'parentNode', specialAttributes = /^(checked|value|selected|disabled)$/i, specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i, simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/, table = [
                '<table>',
                '</table>',
                1
            ], td = [
                '<table><tbody><tr>',
                '</tr></tbody></table>',
                3
            ], option = [
                '<select>',
                '</select>',
                1
            ], noscope = [
                '_',
                '',
                0,
                1
            ], tagMap = {
                thead: table,
                tbody: table,
                tfoot: table,
                colgroup: table,
                caption: table,
                tr: [
                    '<table><tbody>',
                    '</tbody></table>',
                    2
                ],
                th: td,
                td: td,
                col: [
                    '<table><colgroup>',
                    '</colgroup></table>',
                    2
                ],
                fieldset: [
                    '<form>',
                    '</form>',
                    1
                ],
                legend: [
                    '<form><fieldset>',
                    '</fieldset></form>',
                    2
                ],
                option: option,
                optgroup: option,
                script: noscope,
                style: noscope,
                link: noscope,
                param: noscope,
                base: noscope
            }, stateAttributes = /^(checked|selected|disabled)$/, ie = /msie/i.test(navigator.userAgent), hasClass, addClass, removeClass, uidMap = {}, uuids = 0, digit = /^-?[\d\.]+$/, dattr = /^data-(.+)$/, px = 'px', setAttribute = 'setAttribute', getAttribute = 'getAttribute', byTag = 'getElementsByTagName', features = function () {
                var e = doc.createElement('p');
                e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>';
                return {
                    hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x',
                    autoTbody: e[byTag]('tbody').length !== 0,
                    computedStyle: doc.defaultView && doc.defaultView.getComputedStyle,
                    cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat',
                    transform: function () {
                        var props = [
                                'transform',
                                'webkitTransform',
                                'MozTransform',
                                'OTransform',
                                'msTransform'
                            ], i;
                        for (i = 0; i < props.length; i++) {
                            if (props[i] in e.style)
                                return props[i];
                        }
                    }(),
                    classList: 'classList' in e,
                    opasity: function () {
                        return typeof doc.createElement('a').style.opacity !== 'undefined';
                    }()
                };
            }(), trimReplace = /(^\s*|\s*$)/g, whitespaceRegex = /\s+/, toString = String.prototype.toString, unitless = {
                lineHeight: 1,
                zoom: 1,
                zIndex: 1,
                opacity: 1,
                boxFlex: 1,
                WebkitBoxFlex: 1,
                MozBoxFlex: 1
            }, query = doc.querySelectorAll && function (selector) {
                return doc.querySelectorAll(selector);
            }, trim = String.prototype.trim ? function (s) {
                return s.trim();
            } : function (s) {
                return s.replace(trimReplace, '');
            };
        function isNode(node) {
            return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11);
        }
        function normalize(node, host, clone) {
            var i, l, ret;
            if (typeof node == 'string')
                return bonzo.create(node);
            if (isNode(node))
                node = [node];
            if (clone) {
                ret = [];
                for (i = 0, l = node.length; i < l; i++)
                    ret[i] = cloneNode(host, node[i]);
                return ret;
            }
            return node;
        }
        function classReg(c) {
            return new RegExp('(^|\\s+)' + c + '(\\s+|$)');
        }
        function each(ar, fn, opt_scope, opt_rev) {
            var ind, i = 0, l = ar.length;
            for (; i < l; i++) {
                ind = opt_rev ? ar.length - i - 1 : i;
                fn.call(opt_scope || ar[ind], ar[ind], ind, ar);
            }
            return ar;
        }
        function deepEach(ar, fn, opt_scope) {
            for (var i = 0, l = ar.length; i < l; i++) {
                if (isNode(ar[i])) {
                    deepEach(ar[i].childNodes, fn, opt_scope);
                    fn.call(opt_scope || ar[i], ar[i], i, ar);
                }
            }
            return ar;
        }
        function camelize(s) {
            return s.replace(/-(.)/g, function (m, m1) {
                return m1.toUpperCase();
            });
        }
        function decamelize(s) {
            return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s;
        }
        function data(el) {
            el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids);
            var uid = el[getAttribute]('data-node-uid');
            return uidMap[uid] || (uidMap[uid] = {});
        }
        function clearData(el) {
            var uid = el[getAttribute]('data-node-uid');
            if (uid)
                delete uidMap[uid];
        }
        function dataValue(d) {
            var f;
            try {
                return d === null || d === undefined ? undefined : d === 'true' ? true : d === 'false' ? false : d === 'null' ? null : (f = parseFloat(d)) == d ? f : d;
            } catch (e) {
            }
            return undefined;
        }
        function some(ar, fn, opt_scope) {
            for (var i = 0, j = ar.length; i < j; ++i)
                if (fn.call(opt_scope || null, ar[i], i, ar))
                    return true;
            return false;
        }
        function styleProperty(p) {
            p == 'transform' && (p = features.transform) || /^transform-?[Oo]rigin$/.test(p) && (p = features.transform + 'Origin') || p == 'float' && (p = features.cssFloat);
            return p ? camelize(p) : null;
        }
        var getStyle = features.computedStyle ? function (el, property) {
                var value = null, computed = doc.defaultView.getComputedStyle(el, '');
                computed && (value = computed[property]);
                return el.style[property] || value;
            } : ie && html.currentStyle ? function (el, property) {
                if (property == 'opacity' && !features.opasity) {
                    var val = 100;
                    try {
                        val = el['filters']['DXImageTransform.Microsoft.Alpha'].opacity;
                    } catch (e1) {
                        try {
                            val = el['filters']('alpha').opacity;
                        } catch (e2) {
                        }
                    }
                    return val / 100;
                }
                var value = el.currentStyle ? el.currentStyle[property] : null;
                return el.style[property] || value;
            } : function (el, property) {
                return el.style[property];
            };
        function insert(target, host, fn, rev) {
            var i = 0, self = host || this, r = [], nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target;
            each(normalize(nodes), function (t, j) {
                each(self, function (el) {
                    fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el);
                }, null, rev);
            }, this, rev);
            self.length = i;
            each(r, function (e) {
                self[--i] = e;
            }, null, !rev);
            return self;
        }
        function xy(el, x, y) {
            var $el = bonzo(el), style = $el.css('position'), offset = $el.offset(), rel = 'relative', isRel = style == rel, delta = [
                    parseInt($el.css('left'), 10),
                    parseInt($el.css('top'), 10)
                ];
            if (style == 'static') {
                $el.css('position', rel);
                style = rel;
            }
            isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft);
            isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop);
            x != null && (el.style.left = x - offset.left + delta[0] + px);
            y != null && (el.style.top = y - offset.top + delta[1] + px);
        }
        if (features.classList) {
            hasClass = function (el, c) {
                return el.classList.contains(c);
            };
            addClass = function (el, c) {
                el.classList.add(c);
            };
            removeClass = function (el, c) {
                el.classList.remove(c);
            };
        } else {
            hasClass = function (el, c) {
                return classReg(c).test(el.className);
            };
            addClass = function (el, c) {
                el.className = trim(el.className + ' ' + c);
            };
            removeClass = function (el, c) {
                el.className = trim(el.className.replace(classReg(c), ' '));
            };
        }
        function setter(el, v) {
            return typeof v == 'function' ? v(el) : v;
        }
        function Bonzo(elements) {
            this.length = 0;
            if (elements) {
                elements = typeof elements !== 'string' && !elements.nodeType && typeof elements.length !== 'undefined' ? elements : [elements];
                this.length = elements.length;
                for (var i = 0; i < elements.length; i++)
                    this[i] = elements[i];
            }
        }
        Bonzo.prototype = {
            get: function (index) {
                return this[index] || null;
            },
            each: function (fn, opt_scope) {
                return each(this, fn, opt_scope);
            },
            deepEach: function (fn, opt_scope) {
                return deepEach(this, fn, opt_scope);
            },
            map: function (fn, opt_reject) {
                var m = [], n, i;
                for (i = 0; i < this.length; i++) {
                    n = fn.call(this, this[i], i);
                    opt_reject ? opt_reject(n) && m.push(n) : m.push(n);
                }
                return m;
            },
            html: function (h, opt_text) {
                var method = opt_text ? html.textContent === undefined ? 'innerText' : 'textContent' : 'innerHTML', that = this, append = function (el, i) {
                        each(normalize(h, that, i), function (node) {
                            el.appendChild(node);
                        });
                    }, updateElement = function (el, i) {
                        try {
                            if (opt_text || typeof h == 'string' && !specialTags.test(el.tagName)) {
                                return el[method] = h;
                            }
                        } catch (e) {
                        }
                        append(el, i);
                    };
                return typeof h != 'undefined' ? this.empty().each(updateElement) : this[0] ? this[0][method] : '';
            },
            text: function (opt_text) {
                return this.html(opt_text, true);
            },
            append: function (node) {
                var that = this;
                return this.each(function (el, i) {
                    each(normalize(node, that, i), function (i) {
                        el.appendChild(i);
                    });
                });
            },
            prepend: function (node) {
                var that = this;
                return this.each(function (el, i) {
                    var first = el.firstChild;
                    each(normalize(node, that, i), function (i) {
                        el.insertBefore(i, first);
                    });
                });
            },
            appendTo: function (target, opt_host) {
                return insert.call(this, target, opt_host, function (t, el) {
                    t.appendChild(el);
                });
            },
            prependTo: function (target, opt_host) {
                return insert.call(this, target, opt_host, function (t, el) {
                    t.insertBefore(el, t.firstChild);
                }, 1);
            },
            before: function (node) {
                var that = this;
                return this.each(function (el, i) {
                    each(normalize(node, that, i), function (i) {
                        el[parentNode].insertBefore(i, el);
                    });
                });
            },
            after: function (node) {
                var that = this;
                return this.each(function (el, i) {
                    each(normalize(node, that, i), function (i) {
                        el[parentNode].insertBefore(i, el.nextSibling);
                    }, null, 1);
                });
            },
            insertBefore: function (target, opt_host) {
                return insert.call(this, target, opt_host, function (t, el) {
                    t[parentNode].insertBefore(el, t);
                });
            },
            insertAfter: function (target, opt_host) {
                return insert.call(this, target, opt_host, function (t, el) {
                    var sibling = t.nextSibling;
                    sibling ? t[parentNode].insertBefore(el, sibling) : t[parentNode].appendChild(el);
                }, 1);
            },
            replaceWith: function (node) {
                bonzo(normalize(node)).insertAfter(this);
                return this.remove();
            },
            addClass: function (c) {
                c = toString.call(c).split(whitespaceRegex);
                return this.each(function (el) {
                    each(c, function (c) {
                        if (c && !hasClass(el, setter(el, c)))
                            addClass(el, setter(el, c));
                    });
                });
            },
            removeClass: function (c) {
                c = toString.call(c).split(whitespaceRegex);
                return this.each(function (el) {
                    each(c, function (c) {
                        if (c && hasClass(el, setter(el, c)))
                            removeClass(el, setter(el, c));
                    });
                });
            },
            hasClass: function (c) {
                c = toString.call(c).split(whitespaceRegex);
                return some(this, function (el) {
                    return some(c, function (c) {
                        return c && hasClass(el, c);
                    });
                });
            },
            toggleClass: function (c, opt_condition) {
                c = toString.call(c).split(whitespaceRegex);
                return this.each(function (el) {
                    each(c, function (c) {
                        if (c) {
                            typeof opt_condition !== 'undefined' ? opt_condition ? addClass(el, c) : removeClass(el, c) : hasClass(el, c) ? removeClass(el, c) : addClass(el, c);
                        }
                    });
                });
            },
            show: function (opt_type) {
                opt_type = typeof opt_type == 'string' ? opt_type : '';
                return this.each(function (el) {
                    el.style.display = opt_type;
                });
            },
            hide: function () {
                return this.each(function (el) {
                    el.style.display = 'none';
                });
            },
            toggle: function (opt_callback, opt_type) {
                opt_type = typeof opt_type == 'string' ? opt_type : '';
                typeof opt_callback != 'function' && (opt_callback = null);
                return this.each(function (el) {
                    el.style.display = el.offsetWidth || el.offsetHeight ? 'none' : opt_type;
                    opt_callback && opt_callback.call(el);
                });
            },
            first: function () {
                return bonzo(this.length ? this[0] : []);
            },
            last: function () {
                return bonzo(this.length ? this[this.length - 1] : []);
            },
            next: function () {
                return this.related('nextSibling');
            },
            previous: function () {
                return this.related('previousSibling');
            },
            parent: function () {
                return this.related(parentNode);
            },
            related: function (method) {
                return this.map(function (el) {
                    el = el[method];
                    while (el && el.nodeType !== 1) {
                        el = el[method];
                    }
                    return el || 0;
                }, function (el) {
                    return el;
                });
            },
            focus: function () {
                this.length && this[0].focus();
                return this;
            },
            blur: function () {
                this.length && this[0].blur();
                return this;
            },
            css: function (o, opt_v) {
                var p, iter = o;
                if (opt_v === undefined && typeof o == 'string') {
                    opt_v = this[0];
                    if (!opt_v)
                        return null;
                    if (opt_v === doc || opt_v === win) {
                        p = opt_v === doc ? bonzo.doc() : bonzo.viewport();
                        return o == 'width' ? p.width : o == 'height' ? p.height : '';
                    }
                    return (o = styleProperty(o)) ? getStyle(opt_v, o) : null;
                }
                if (typeof o == 'string') {
                    iter = {};
                    iter[o] = opt_v;
                }
                if (ie && iter.opacity) {
                    iter.filter = 'alpha(opacity=' + iter.opacity * 100 + ')';
                    iter.zoom = o.zoom || 1;
                    delete iter.opacity;
                }
                function fn(el, p, v) {
                    for (var k in iter) {
                        if (iter.hasOwnProperty(k)) {
                            v = iter[k];
                            (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px);
                            try {
                                el.style[p] = setter(el, v);
                            } catch (e) {
                            }
                        }
                    }
                }
                return this.each(fn);
            },
            offset: function (opt_x, opt_y) {
                if (opt_x && typeof opt_x == 'object' && (typeof opt_x.top == 'number' || typeof opt_x.left == 'number')) {
                    return this.each(function (el) {
                        xy(el, opt_x.left, opt_x.top);
                    });
                } else if (typeof opt_x == 'number' || typeof opt_y == 'number') {
                    return this.each(function (el) {
                        xy(el, opt_x, opt_y);
                    });
                }
                if (!this[0])
                    return {
                        top: 0,
                        left: 0,
                        height: 0,
                        width: 0
                    };
                var el = this[0], de = el.ownerDocument.documentElement, bcr = el.getBoundingClientRect(), scroll = getWindowScroll(), width = el.offsetWidth, height = el.offsetHeight, top = bcr.top + scroll.y - Math.max(0, de && de.clientTop, doc.body.clientTop), left = bcr.left + scroll.x - Math.max(0, de && de.clientLeft, doc.body.clientLeft);
                return {
                    top: top,
                    left: left,
                    height: height,
                    width: width
                };
            },
            dim: function () {
                if (!this.length)
                    return {
                        height: 0,
                        width: 0
                    };
                var el = this[0], de = el.nodeType == 9 && el.documentElement, orig = !de && !!el.style && !el.offsetWidth && !el.offsetHeight ? function (t) {
                        var s = {
                                position: el.style.position || '',
                                visibility: el.style.visibility || '',
                                display: el.style.display || ''
                            };
                        t.first().css({
                            position: 'absolute',
                            visibility: 'hidden',
                            display: 'block'
                        });
                        return s;
                    }(this) : null, width = de ? Math.max(el.body.scrollWidth, el.body.offsetWidth, de.scrollWidth, de.offsetWidth, de.clientWidth) : el.offsetWidth, height = de ? Math.max(el.body.scrollHeight, el.body.offsetHeight, de.scrollWidth, de.offsetWidth, de.clientHeight) : el.offsetHeight;
                orig && this.first().css(orig);
                return {
                    height: height,
                    width: width
                };
            },
            attr: function (k, opt_v) {
                var el = this[0];
                if (typeof k != 'string' && !(k instanceof String)) {
                    for (var n in k) {
                        k.hasOwnProperty(n) && this.attr(n, k[n]);
                    }
                    return this;
                }
                return typeof opt_v == 'undefined' ? !el ? null : specialAttributes.test(k) ? stateAttributes.test(k) && typeof el[k] == 'string' ? true : el[k] : (k == 'href' || k == 'src') && features.hrefExtended ? el[getAttribute](k, 2) : el[getAttribute](k) : this.each(function (el) {
                    specialAttributes.test(k) ? el[k] = setter(el, opt_v) : el[setAttribute](k, setter(el, opt_v));
                });
            },
            removeAttr: function (k) {
                return this.each(function (el) {
                    stateAttributes.test(k) ? el[k] = false : el.removeAttribute(k);
                });
            },
            val: function (s) {
                return typeof s == 'string' ? this.attr('value', s) : this.length ? this[0].value : null;
            },
            data: function (opt_k, opt_v) {
                var el = this[0], o, m;
                if (typeof opt_v === 'undefined') {
                    if (!el)
                        return null;
                    o = data(el);
                    if (typeof opt_k === 'undefined') {
                        each(el.attributes, function (a) {
                            (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value));
                        });
                        return o;
                    } else {
                        if (typeof o[opt_k] === 'undefined')
                            o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)));
                        return o[opt_k];
                    }
                } else {
                    return this.each(function (el) {
                        data(el)[opt_k] = opt_v;
                    });
                }
            },
            remove: function () {
                this.deepEach(clearData);
                return this.detach();
            },
            empty: function () {
                return this.each(function (el) {
                    deepEach(el.childNodes, clearData);
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                });
            },
            detach: function () {
                return this.each(function (el) {
                    el[parentNode] && el[parentNode].removeChild(el);
                });
            },
            scrollTop: function (y) {
                return scroll.call(this, null, y, 'y');
            },
            scrollLeft: function (x) {
                return scroll.call(this, x, null, 'x');
            }
        };
        function cloneNode(host, el) {
            var c = el.cloneNode(true), cloneElems, elElems;
            if (host.$ && typeof host.cloneEvents == 'function') {
                host.$(c).cloneEvents(el);
                cloneElems = host.$(c).find('*');
                elElems = host.$(el).find('*');
                for (var i = 0; i < elElems.length; i++)
                    host.$(cloneElems[i]).cloneEvents(elElems[i]);
            }
            return c;
        }
        function scroll(x, y, type) {
            var el = this[0];
            if (!el)
                return this;
            if (x == null && y == null) {
                return (isBody(el) ? getWindowScroll() : {
                    x: el.scrollLeft,
                    y: el.scrollTop
                })[type];
            }
            if (isBody(el)) {
                win.scrollTo(x, y);
            } else {
                x != null && (el.scrollLeft = x);
                y != null && (el.scrollTop = y);
            }
            return this;
        }
        function isBody(element) {
            return element === win || /^(?:body|html)$/i.test(element.tagName);
        }
        function getWindowScroll() {
            return {
                x: win.pageXOffset || html.scrollLeft,
                y: win.pageYOffset || html.scrollTop
            };
        }
        function createScriptFromHtml(html) {
            var scriptEl = document.createElement('script'), matches = html.match(simpleScriptTagRe);
            scriptEl.src = matches[1];
            return scriptEl;
        }
        function bonzo(els) {
            return new Bonzo(els);
        }
        bonzo.setQueryEngine = function (q) {
            query = q;
            delete bonzo.setQueryEngine;
        };
        bonzo.aug = function (o, target) {
            for (var k in o) {
                o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k]);
            }
        };
        bonzo.create = function (node) {
            return typeof node == 'string' && node !== '' ? function () {
                if (simpleScriptTagRe.test(node))
                    return [createScriptFromHtml(node)];
                var tag = node.match(/^\s*<([^\s>]+)/), el = doc.createElement('div'), els = [], p = tag ? tagMap[tag[1].toLowerCase()] : null, dep = p ? p[2] + 1 : 1, ns = p && p[3], pn = parentNode, tb = features.autoTbody && p && p[0] == '<table>' && !/<tbody/i.test(node);
                el.innerHTML = p ? p[0] + node + p[1] : node;
                while (dep--)
                    el = el.firstChild;
                if (ns && el && el.nodeType !== 1)
                    el = el.nextSibling;
                do {
                    if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
                        els.push(el);
                    }
                } while (el = el.nextSibling);
                each(els, function (el) {
                    el[pn] && el[pn].removeChild(el);
                });
                return els;
            }() : isNode(node) ? [node.cloneNode(true)] : [];
        };
        bonzo.doc = function () {
            var vp = bonzo.viewport();
            return {
                width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width),
                height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
            };
        };
        bonzo.firstChild = function (el) {
            for (var c = el.childNodes, i = 0, j = c && c.length || 0, e; i < j; i++) {
                if (c[i].nodeType === 1)
                    e = c[j = i];
            }
            return e;
        };
        bonzo.viewport = function () {
            return {
                width: ie ? html.clientWidth : self.innerWidth,
                height: ie ? html.clientHeight : self.innerHeight
            };
        };
        bonzo.isAncestor = 'compareDocumentPosition' in html ? function (container, element) {
            return (container.compareDocumentPosition(element) & 16) == 16;
        } : 'contains' in html ? function (container, element) {
            return container !== element && container.contains(element);
        } : function (container, element) {
            while (element = element[parentNode]) {
                if (element === container) {
                    return true;
                }
            }
            return false;
        };
        return bonzo;
    }));
});

$.ns(['bean'], function (module, exports) {
    !function (name, context, definition) {
        if (typeof module != 'undefined' && module.exports)
            module.exports = definition(name, context);
        else if (typeof define == 'function' && typeof define.amd == 'object')
            define(definition);
        else
            context[name] = definition(name, context);
    }('bean', this, function (name, context) {
        var win = window, old = context[name], namespaceRegex = /[^\.]*(?=\..*)\.|.*/, nameRegex = /\..*/, addEvent = 'addEventListener', removeEvent = 'removeEventListener', doc = document || {}, root = doc.documentElement || {}, W3C_MODEL = root[addEvent], eventSupport = W3C_MODEL ? addEvent : 'attachEvent', ONE = {}, slice = Array.prototype.slice, str2arr = function (s, d) {
                return s.split(d || ' ');
            }, isString = function (o) {
                return typeof o == 'string';
            }, isFunction = function (o) {
                return typeof o == 'function';
            }, standardNativeEvents = 'click dblclick mouseup mousedown contextmenu ' + 'mousewheel mousemultiwheel DOMMouseScroll ' + 'mouseover mouseout mousemove selectstart selectend ' + 'keydown keypress keyup ' + 'orientationchange ' + 'focus blur change reset select submit ' + 'load unload beforeunload resize move DOMContentLoaded ' + 'readystatechange message ' + 'error abort scroll ', w3cNativeEvents = 'show ' + 'input invalid ' + 'touchstart touchmove touchend touchcancel ' + 'gesturestart gesturechange gestureend ' + 'textinput' + 'readystatechange pageshow pagehide popstate ' + 'hashchange offline online ' + 'afterprint beforeprint ' + 'dragstart dragenter dragover dragleave drag drop dragend ' + 'loadstart progress suspend emptied stalled loadmetadata ' + 'loadeddata canplay canplaythrough playing waiting seeking ' + 'seeked ended durationchange timeupdate play pause ratechange ' + 'volumechange cuechange ' + 'checking noupdate downloading cached updateready obsolete ', nativeEvents = function (hash, events, i) {
                for (i = 0; i < events.length; i++)
                    events[i] && (hash[events[i]] = 1);
                return hash;
            }({}, str2arr(standardNativeEvents + (W3C_MODEL ? w3cNativeEvents : ''))), customEvents = function () {
                var isAncestor = 'compareDocumentPosition' in root ? function (element, container) {
                        return container.compareDocumentPosition && (container.compareDocumentPosition(element) & 16) === 16;
                    } : 'contains' in root ? function (element, container) {
                        container = container.nodeType === 9 || container === window ? root : container;
                        return container !== element && container.contains(element);
                    } : function (element, container) {
                        while (element = element.parentNode)
                            if (element === container)
                                return 1;
                        return 0;
                    }, check = function (event) {
                        var related = event.relatedTarget;
                        return !related ? related == null : related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isAncestor(related, this);
                    };
                return {
                    mouseenter: {
                        base: 'mouseover',
                        condition: check
                    },
                    mouseleave: {
                        base: 'mouseout',
                        condition: check
                    },
                    mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
                };
            }(), Event = function () {
                var commonProps = str2arr('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' + 'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey ' + 'srcElement target timeStamp type view which propertyName'), mouseProps = commonProps.concat(str2arr('button buttons clientX clientY dataTransfer ' + 'fromElement offsetX offsetY pageX pageY screenX screenY toElement')), mouseWheelProps = mouseProps.concat(str2arr('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' + 'axis')), keyProps = commonProps.concat(str2arr('char charCode key keyCode keyIdentifier ' + 'keyLocation location')), textProps = commonProps.concat(str2arr('data')), touchProps = commonProps.concat(str2arr('touches targetTouches changedTouches scale rotation')), messageProps = commonProps.concat(str2arr('data origin source')), stateProps = commonProps.concat(str2arr('state')), overOutRegex = /over|out/, typeFixers = [
                        {
                            reg: /key/i,
                            fix: function (event, newEvent) {
                                newEvent.keyCode = event.keyCode || event.which;
                                return keyProps;
                            }
                        },
                        {
                            reg: /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i,
                            fix: function (event, newEvent, type) {
                                newEvent.rightClick = event.which === 3 || event.button === 2;
                                newEvent.pos = {
                                    x: 0,
                                    y: 0
                                };
                                if (event.pageX || event.pageY) {
                                    newEvent.clientX = event.pageX;
                                    newEvent.clientY = event.pageY;
                                } else if (event.clientX || event.clientY) {
                                    newEvent.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft;
                                    newEvent.clientY = event.clientY + doc.body.scrollTop + root.scrollTop;
                                }
                                if (overOutRegex.test(type)) {
                                    newEvent.relatedTarget = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
                                }
                                return mouseProps;
                            }
                        },
                        {
                            reg: /mouse.*(wheel|scroll)/i,
                            fix: function () {
                                return mouseWheelProps;
                            }
                        },
                        {
                            reg: /^text/i,
                            fix: function () {
                                return textProps;
                            }
                        },
                        {
                            reg: /^touch|^gesture/i,
                            fix: function () {
                                return touchProps;
                            }
                        },
                        {
                            reg: /^message$/i,
                            fix: function () {
                                return messageProps;
                            }
                        },
                        {
                            reg: /^popstate$/i,
                            fix: function () {
                                return stateProps;
                            }
                        },
                        {
                            reg: /.*/,
                            fix: function () {
                                return commonProps;
                            }
                        }
                    ], typeFixerMap = {}, Event = function (event, element, isNative) {
                        if (!arguments.length)
                            return;
                        event = event || ((element.ownerDocument || element.document || element).parentWindow || win).event;
                        this.originalEvent = event;
                        this.isNative = isNative;
                        this.isBean = true;
                        if (!event)
                            return;
                        var type = event.type, target = event.target || event.srcElement, i, l, p, props, fixer;
                        this.target = target && target.nodeType === 3 ? target.parentNode : target;
                        if (isNative) {
                            fixer = typeFixerMap[type];
                            if (!fixer) {
                                for (i = 0, l = typeFixers.length; i < l; i++) {
                                    if (typeFixers[i].reg.test(type)) {
                                        typeFixerMap[type] = fixer = typeFixers[i].fix;
                                        break;
                                    }
                                }
                            }
                            props = fixer(event, this, type);
                            for (i = props.length; i--;) {
                                if (!((p = props[i]) in this) && p in event)
                                    this[p] = event[p];
                            }
                        }
                    };
                Event.prototype.preventDefault = function () {
                    if (this.originalEvent.preventDefault)
                        this.originalEvent.preventDefault();
                    else
                        this.originalEvent.returnValue = false;
                };
                Event.prototype.stopPropagation = function () {
                    if (this.originalEvent.stopPropagation)
                        this.originalEvent.stopPropagation();
                    else
                        this.originalEvent.cancelBubble = true;
                };
                Event.prototype.stop = function () {
                    this.preventDefault();
                    this.stopPropagation();
                    this.stopped = true;
                };
                Event.prototype.stopImmediatePropagation = function () {
                    if (this.originalEvent.stopImmediatePropagation)
                        this.originalEvent.stopImmediatePropagation();
                    this.isImmediatePropagationStopped = function () {
                        return true;
                    };
                };
                Event.prototype.isImmediatePropagationStopped = function () {
                    return this.originalEvent.isImmediatePropagationStopped && this.originalEvent.isImmediatePropagationStopped();
                };
                Event.prototype.clone = function (currentTarget) {
                    var ne = new Event(this, this.element, this.isNative);
                    ne.currentTarget = currentTarget;
                    return ne;
                };
                return Event;
            }(), targetElement = function (element, isNative) {
                return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element;
            }, RegEntry = function () {
                var wrappedHandler = function (element, fn, condition, args) {
                        var call = function (event, eargs) {
                                return fn.apply(element, args ? slice.call(eargs, event ? 0 : 1).concat(args) : eargs);
                            }, findTarget = function (event, eventElement) {
                                return fn.__beanDel ? fn.__beanDel.ft(event.target, element) : eventElement;
                            }, handler = condition ? function (event) {
                                var target = findTarget(event, this);
                                if (condition.apply(target, arguments)) {
                                    if (event)
                                        event.currentTarget = target;
                                    return call(event, arguments);
                                }
                            } : function (event) {
                                if (fn.__beanDel)
                                    event = event.clone(findTarget(event));
                                return call(event, arguments);
                            };
                        handler.__beanDel = fn.__beanDel;
                        return handler;
                    }, RegEntry = function (element, type, handler, original, namespaces, args, root) {
                        var customType = customEvents[type], isNative;
                        if (type == 'unload') {
                            handler = once(removeListener, element, type, handler, original);
                        }
                        if (customType) {
                            if (customType.condition) {
                                handler = wrappedHandler(element, handler, customType.condition, args);
                            }
                            type = customType.base || type;
                        }
                        this.isNative = isNative = nativeEvents[type] && !!element[eventSupport];
                        this.customType = !W3C_MODEL && !isNative && type;
                        this.element = element;
                        this.type = type;
                        this.original = original;
                        this.namespaces = namespaces;
                        this.eventType = W3C_MODEL || isNative ? type : 'propertychange';
                        this.target = targetElement(element, isNative);
                        this[eventSupport] = !!this.target[eventSupport];
                        this.root = root;
                        this.handler = wrappedHandler(element, handler, null, args);
                    };
                RegEntry.prototype.inNamespaces = function (checkNamespaces) {
                    var i, j, c = 0;
                    if (!checkNamespaces)
                        return true;
                    if (!this.namespaces)
                        return false;
                    for (i = checkNamespaces.length; i--;) {
                        for (j = this.namespaces.length; j--;) {
                            if (checkNamespaces[i] == this.namespaces[j])
                                c++;
                        }
                    }
                    return checkNamespaces.length === c;
                };
                RegEntry.prototype.matches = function (checkElement, checkOriginal, checkHandler) {
                    return this.element === checkElement && (!checkOriginal || this.original === checkOriginal) && (!checkHandler || this.handler === checkHandler);
                };
                return RegEntry;
            }(), registry = function () {
                var map = {}, forAll = function (element, type, original, handler, root, fn) {
                        var pfx = root ? 'r' : '$';
                        if (!type || type == '*') {
                            for (var t in map) {
                                if (t.charAt(0) == pfx) {
                                    forAll(element, t.substr(1), original, handler, root, fn);
                                }
                            }
                        } else {
                            var i = 0, l, list = map[pfx + type], all = element == '*';
                            if (!list)
                                return;
                            for (l = list.length; i < l; i++) {
                                if ((all || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type))
                                    return;
                            }
                        }
                    }, has = function (element, type, original, root) {
                        var i, list = map[(root ? 'r' : '$') + type];
                        if (list) {
                            for (i = list.length; i--;) {
                                if (!list[i].root && list[i].matches(element, original, null))
                                    return true;
                            }
                        }
                        return false;
                    }, get = function (element, type, original, root) {
                        var entries = [];
                        forAll(element, type, original, null, root, function (entry) {
                            return entries.push(entry);
                        });
                        return entries;
                    }, put = function (entry) {
                        var has = !entry.root && !this.has(entry.element, entry.type, null, false), key = (entry.root ? 'r' : '$') + entry.type;
                        ;
                        (map[key] || (map[key] = [])).push(entry);
                        return has;
                    }, del = function (entry) {
                        forAll(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
                            list.splice(i, 1);
                            entry.removed = true;
                            if (list.length === 0)
                                delete map[(entry.root ? 'r' : '$') + entry.type];
                            return false;
                        });
                    }, entries = function () {
                        var t, entries = [];
                        for (t in map) {
                            if (t.charAt(0) == '$')
                                entries = entries.concat(map[t]);
                        }
                        return entries;
                    };
                return {
                    has: has,
                    get: get,
                    put: put,
                    del: del,
                    entries: entries
                };
            }(), selectorEngine, setSelectorEngine = function (e) {
                if (!arguments.length) {
                    selectorEngine = doc.querySelectorAll ? function (s, r) {
                        return r.querySelectorAll(s);
                    } : function () {
                        throw new Error('Bean: No selector engine installed');
                    };
                } else {
                    selectorEngine = e;
                }
            }, rootListener = function (event, type) {
                if (!W3C_MODEL && type && event && event.propertyName != '_on' + type)
                    return;
                var listeners = registry.get(this, type || event.type, null, false), l = listeners.length, i = 0;
                event = new Event(event, this, true);
                if (type)
                    event.type = type;
                for (; i < l && !event.isImmediatePropagationStopped(); i++) {
                    if (!listeners[i].removed)
                        listeners[i].handler.call(this, event);
                }
            }, listener = W3C_MODEL ? function (element, type, add) {
                element[add ? addEvent : removeEvent](type, rootListener, false);
            } : function (element, type, add, custom) {
                var entry;
                if (add) {
                    registry.put(entry = new RegEntry(element, custom || type, function (event) {
                        rootListener.call(element, event, custom);
                    }, rootListener, null, null, true));
                    if (custom && element['_on' + custom] == null)
                        element['_on' + custom] = 0;
                    entry.target.attachEvent('on' + entry.eventType, entry.handler);
                } else {
                    entry = registry.get(element, custom || type, rootListener, true)[0];
                    if (entry) {
                        entry.target.detachEvent('on' + entry.eventType, entry.handler);
                        registry.del(entry);
                    }
                }
            }, once = function (rm, element, type, fn, originalFn) {
                return function () {
                    fn.apply(this, arguments);
                    rm(element, type, originalFn);
                };
            }, removeListener = function (element, orgType, handler, namespaces) {
                var type = orgType && orgType.replace(nameRegex, ''), handlers = registry.get(element, type, null, false), removed = {}, i, l;
                for (i = 0, l = handlers.length; i < l; i++) {
                    if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
                        registry.del(handlers[i]);
                        if (!removed[handlers[i].eventType] && handlers[i][eventSupport])
                            removed[handlers[i].eventType] = {
                                t: handlers[i].eventType,
                                c: handlers[i].type
                            };
                    }
                }
                for (i in removed) {
                    if (!registry.has(element, removed[i].t, null, false)) {
                        listener(element, removed[i].t, false, removed[i].c);
                    }
                }
            }, delegate = function (selector, fn) {
                var findTarget = function (target, root) {
                        var i, array = isString(selector) ? selectorEngine(selector, root) : selector;
                        for (; target && target !== root; target = target.parentNode) {
                            for (i = array.length; i--;) {
                                if (array[i] === target)
                                    return target;
                            }
                        }
                    }, handler = function (e) {
                        var match = findTarget(e.target, this);
                        if (match)
                            fn.apply(match, arguments);
                    };
                handler.__beanDel = {
                    ft: findTarget,
                    selector: selector
                };
                return handler;
            }, fireListener = W3C_MODEL ? function (isNative, type, element) {
                var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents');
                evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1);
                element.dispatchEvent(evt);
            } : function (isNative, type, element) {
                element = targetElement(element, isNative);
                isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++;
            }, off = function (element, typeSpec, fn) {
                var isTypeStr = isString(typeSpec), k, type, namespaces, i;
                if (isTypeStr && typeSpec.indexOf(' ') > 0) {
                    typeSpec = str2arr(typeSpec);
                    for (i = typeSpec.length; i--;)
                        off(element, typeSpec[i], fn);
                    return element;
                }
                type = isTypeStr && typeSpec.replace(nameRegex, '');
                if (type && customEvents[type])
                    type = customEvents[type].base;
                if (!typeSpec || isTypeStr) {
                    if (namespaces = isTypeStr && typeSpec.replace(namespaceRegex, ''))
                        namespaces = str2arr(namespaces, '.');
                    removeListener(element, type, fn, namespaces);
                } else if (isFunction(typeSpec)) {
                    removeListener(element, null, typeSpec);
                } else {
                    for (k in typeSpec) {
                        if (typeSpec.hasOwnProperty(k))
                            off(element, k, typeSpec[k]);
                    }
                }
                return element;
            }, on = function (element, events, selector, fn) {
                var originalFn, type, types, i, args, entry, first;
                if (selector === undefined && typeof events == 'object') {
                    for (type in events) {
                        if (events.hasOwnProperty(type)) {
                            on.call(this, element, type, events[type]);
                        }
                    }
                    return;
                }
                if (!isFunction(selector)) {
                    originalFn = fn;
                    args = slice.call(arguments, 4);
                    fn = delegate(selector, originalFn, selectorEngine);
                } else {
                    args = slice.call(arguments, 3);
                    fn = originalFn = selector;
                }
                types = str2arr(events);
                if (this === ONE) {
                    fn = once(off, element, events, fn, originalFn);
                }
                for (i = types.length; i--;) {
                    first = registry.put(entry = new RegEntry(element, types[i].replace(nameRegex, ''), fn, originalFn, str2arr(types[i].replace(namespaceRegex, ''), '.'), args, false));
                    if (entry[eventSupport] && first) {
                        listener(element, entry.eventType, true, entry.customType);
                    }
                }
                return element;
            }, add = function (element, events, fn, delfn) {
                return on.apply(null, !isString(fn) ? slice.call(arguments) : [
                    element,
                    fn,
                    events,
                    delfn
                ].concat(arguments.length > 3 ? slice.call(arguments, 5) : []));
            }, one = function () {
                return on.apply(ONE, arguments);
            }, fire = function (element, type, args) {
                var types = str2arr(type), i, j, l, names, handlers;
                for (i = types.length; i--;) {
                    type = types[i].replace(nameRegex, '');
                    if (names = types[i].replace(namespaceRegex, ''))
                        names = str2arr(names, '.');
                    if (!names && !args && element[eventSupport]) {
                        fireListener(nativeEvents[type], type, element);
                    } else {
                        handlers = registry.get(element, type, null, false);
                        args = [false].concat(args);
                        for (j = 0, l = handlers.length; j < l; j++) {
                            if (handlers[j].inNamespaces(names)) {
                                handlers[j].handler.apply(element, args);
                            }
                        }
                    }
                }
                return element;
            }, clone = function (element, from, type) {
                var handlers = registry.get(from, type, null, false), l = handlers.length, i = 0, args, beanDel;
                for (; i < l; i++) {
                    if (handlers[i].original) {
                        args = [
                            element,
                            handlers[i].type
                        ];
                        if (beanDel = handlers[i].handler.__beanDel)
                            args.push(beanDel.selector);
                        args.push(handlers[i].original);
                        on.apply(null, args);
                    }
                }
                return element;
            }, bean = {
                on: on,
                add: add,
                one: one,
                off: off,
                remove: off,
                clone: clone,
                fire: fire,
                setSelectorEngine: setSelectorEngine,
                noConflict: function () {
                    context[name] = old;
                    return this;
                }
            };
        if (win.attachEvent) {
            var cleanup = function () {
                var i, entries = registry.entries();
                for (i in entries) {
                    if (entries[i].type && entries[i].type !== 'unload')
                        off(entries[i].element, entries[i].type);
                }
                win.detachEvent('onunload', cleanup);
                win.CollectGarbage && win.CollectGarbage();
            };
            win.attachEvent('onunload', cleanup);
        }
        setSelectorEngine();
        return bean;
    });
});

$.ns(['qwery'], function (module, exports) {
    (function (name, context, definition) {
        if (typeof module != 'undefined' && module.exports)
            module.exports = definition();
        else if (typeof context['define'] == 'function' && context['define']['amd'])
            define(definition);
        else
            context[name] = definition();
    }('qwery', this, function () {
        var doc = document, html = doc.documentElement, byClass = 'getElementsByClassName', byTag = 'getElementsByTagName', qSA = 'querySelectorAll', useNativeQSA = 'useNativeQSA', tagName = 'tagName', nodeType = 'nodeType', select, id = /#([\w\-]+)/, clas = /\.[\w\-]+/g, idOnly = /^#([\w\-]+)$/, classOnly = /^\.([\w\-]+)$/, tagOnly = /^([\w\-]+)$/, tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/, splittable = /(^|,)\s*[>~+]/, normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g, splitters = /[\s\>\+\~]/, splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/, specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g, simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/, attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/, pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/, easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source), dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g'), tokenizr = new RegExp(splitters.source + splittersMore.source), chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?');
        var walker = {
                ' ': function (node) {
                    return node && node !== html && node.parentNode;
                },
                '>': function (node, contestant) {
                    return node && node.parentNode == contestant.parentNode && node.parentNode;
                },
                '~': function (node) {
                    return node && node.previousSibling;
                },
                '+': function (node, contestant, p1, p2) {
                    if (!node)
                        return false;
                    return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1;
                }
            };
        function cache() {
            this.c = {};
        }
        cache.prototype = {
            g: function (k) {
                return this.c[k] || undefined;
            },
            s: function (k, v, r) {
                v = r ? new RegExp(v) : v;
                return this.c[k] = v;
            }
        };
        var classCache = new cache(), cleanCache = new cache(), attrCache = new cache(), tokenCache = new cache();
        function classRegex(c) {
            return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1);
        }
        function each(a, fn) {
            var i = 0, l = a.length;
            for (; i < l; i++)
                fn(a[i]);
        }
        function flatten(ar) {
            for (var r = [], i = 0, l = ar.length; i < l; ++i)
                arrayLike(ar[i]) ? r = r.concat(ar[i]) : r[r.length] = ar[i];
            return r;
        }
        function arrayify(ar) {
            var i = 0, l = ar.length, r = [];
            for (; i < l; i++)
                r[i] = ar[i];
            return r;
        }
        function previous(n) {
            while (n = n.previousSibling)
                if (n[nodeType] == 1)
                    break;
            return n;
        }
        function q(query) {
            return query.match(chunker);
        }
        function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
            var i, m, k, o, classes;
            if (this[nodeType] !== 1)
                return false;
            if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag)
                return false;
            if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id)
                return false;
            if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
                for (i = classes.length; i--;)
                    if (!classRegex(classes[i].slice(1)).test(this.className))
                        return false;
            }
            if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal))
                return false;
            if (wholeAttribute && !value) {
                o = this.attributes;
                for (k in o) {
                    if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
                        return this;
                    }
                }
            }
            if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
                return false;
            }
            return this;
        }
        function clean(s) {
            return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'));
        }
        function checkAttr(qualify, actual, val) {
            switch (qualify) {
            case '=':
                return actual == val;
            case '^=':
                return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1));
            case '$=':
                return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1));
            case '*=':
                return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1));
            case '~=':
                return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1));
            case '|=':
                return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1));
            }
            return 0;
        }
        function _qwery(selector, _root) {
            var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root, tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr)), dividedTokens = selector.match(dividers);
            if (!tokens.length)
                return r;
            token = (tokens = tokens.slice(0)).pop();
            if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly)))
                root = byId(_root, m[1]);
            if (!root)
                return r;
            intr = q(token);
            els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ? function (r) {
                while (root = root.nextSibling) {
                    root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root);
                }
                return r;
            }([]) : root[byTag](intr[1] || '*');
            for (i = 0, l = els.length; i < l; i++) {
                if (item = interpret.apply(els[i], intr))
                    r[r.length] = item;
            }
            if (!tokens.length)
                return r;
            each(r, function (e) {
                if (ancestorMatch(e, tokens, dividedTokens))
                    ret[ret.length] = e;
            });
            return ret;
        }
        function is(el, selector, root) {
            if (isNode(selector))
                return el == selector;
            if (arrayLike(selector))
                return !!~flatten(selector).indexOf(el);
            var selectors = selector.split(','), tokens, dividedTokens;
            while (selector = selectors.pop()) {
                tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr));
                dividedTokens = selector.match(dividers);
                tokens = tokens.slice(0);
                if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
                    return true;
                }
            }
            return false;
        }
        function ancestorMatch(el, tokens, dividedTokens, root) {
            var cand;
            function crawl(e, i, p) {
                while (p = walker[dividedTokens[i]](p, e)) {
                    if (isNode(p) && interpret.apply(p, q(tokens[i]))) {
                        if (i) {
                            if (cand = crawl(p, i - 1, p))
                                return cand;
                        } else
                            return p;
                    }
                }
            }
            return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root));
        }
        function isNode(el, t) {
            return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9);
        }
        function uniq(ar) {
            var a = [], i, j;
            o:
                for (i = 0; i < ar.length; ++i) {
                    for (j = 0; j < a.length; ++j)
                        if (a[j] == ar[i])
                            continue o;
                    a[a.length] = ar[i];
                }
            return a;
        }
        function arrayLike(o) {
            return typeof o === 'object' && isFinite(o.length);
        }
        function normalizeRoot(root) {
            if (!root)
                return doc;
            if (typeof root == 'string')
                return qwery(root)[0];
            if (!root[nodeType] && arrayLike(root))
                return root[0];
            return root;
        }
        function byId(root, id, el) {
            return root[nodeType] === 9 ? root.getElementById(id) : root.ownerDocument && ((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el || !isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]);
        }
        function qwery(selector, _root) {
            var m, el, root = normalizeRoot(_root);
            if (!root || !selector)
                return [];
            if (selector === window || isNode(selector)) {
                return !_root || selector !== window && isNode(root) && isAncestor(selector, root) ? [selector] : [];
            }
            if (selector && arrayLike(selector))
                return flatten(selector);
            if (m = selector.match(easy)) {
                if (m[1])
                    return (el = byId(root, m[1])) ? [el] : [];
                if (m[2])
                    return arrayify(root[byTag](m[2]));
                if (hasByClass && m[3])
                    return arrayify(root[byClass](m[3]));
            }
            return select(selector, root);
        }
        function collectSelector(root, collector) {
            return function (s) {
                var oid, nid;
                if (splittable.test(s)) {
                    if (root[nodeType] !== 9) {
                        if (!(nid = oid = root.getAttribute('id')))
                            root.setAttribute('id', nid = '__qwerymeupscotty');
                        s = '[id="' + nid + '"]' + s;
                        collector(root.parentNode || root, s, true);
                        oid || root.removeAttribute('id');
                    }
                    return;
                }
                s.length && collector(root, s, false);
            };
        }
        var isAncestor = 'compareDocumentPosition' in html ? function (element, container) {
                return (container.compareDocumentPosition(element) & 16) == 16;
            } : 'contains' in html ? function (element, container) {
                container = container[nodeType] === 9 || container == window ? html : container;
                return container !== element && container.contains(element);
            } : function (element, container) {
                while (element = element.parentNode)
                    if (element === container)
                        return 1;
                return 0;
            }, getAttr = function () {
                var e = doc.createElement('p');
                return (e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x' ? function (e, a) {
                    return a === 'class' ? e.className : a === 'href' || a === 'src' ? e.getAttribute(a, 2) : e.getAttribute(a);
                } : function (e, a) {
                    return e.getAttribute(a);
                };
            }(), hasByClass = !!doc[byClass], hasQSA = doc.querySelector && doc[qSA], selectQSA = function (selector, root) {
                var result = [], ss, e;
                try {
                    if (root[nodeType] === 9 || !splittable.test(selector)) {
                        return arrayify(root[qSA](selector));
                    }
                    each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
                        e = ctx[qSA](s);
                        if (e.length == 1)
                            result[result.length] = e.item(0);
                        else if (e.length)
                            result = result.concat(arrayify(e));
                    }));
                    return ss.length > 1 && result.length > 1 ? uniq(result) : result;
                } catch (ex) {
                }
                return selectNonNative(selector, root);
            }, selectNonNative = function (selector, root) {
                var result = [], items, m, i, l, r, ss;
                selector = selector.replace(normalizr, '$1');
                if (m = selector.match(tagAndOrClass)) {
                    r = classRegex(m[2]);
                    items = root[byTag](m[1] || '*');
                    for (i = 0, l = items.length; i < l; i++) {
                        if (r.test(items[i].className))
                            result[result.length] = items[i];
                    }
                    return result;
                }
                each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
                    r = _qwery(s, ctx);
                    for (i = 0, l = r.length; i < l; i++) {
                        if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root))
                            result[result.length] = r[i];
                    }
                }));
                return ss.length > 1 && result.length > 1 ? uniq(result) : result;
            }, configure = function (options) {
                if (typeof options[useNativeQSA] !== 'undefined')
                    select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative;
            };
        configure({ useNativeQSA: true });
        qwery.configure = configure;
        qwery.uniq = uniq;
        qwery.is = is;
        qwery.pseudos = {};
        return qwery;
    }));
});

$.ns(['ready'], function (module, exports) {
    !function (name, definition) {
        if (typeof module != 'undefined')
            module.exports = definition();
        else if (typeof define == 'function' && typeof define.amd == 'object')
            define(definition);
        else
            this[name] = definition();
    }('domready', function (ready) {
        var fns = [], fn, f = false, doc = document, testEl = doc.documentElement, hack = testEl.doScroll, domContentLoaded = 'DOMContentLoaded', addEventListener = 'addEventListener', onreadystatechange = 'onreadystatechange', readyState = 'readyState', loaded = /^loade|c/.test(doc[readyState]);
        function flush(f) {
            loaded = 1;
            while (f = fns.shift())
                f();
        }
        doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
            doc.removeEventListener(domContentLoaded, fn, f);
            flush();
        }, f);
        hack && doc.attachEvent(onreadystatechange, fn = function () {
            if (/^c/.test(doc[readyState])) {
                doc.detachEvent(onreadystatechange, fn);
                flush();
            }
        });
        return ready = hack ? function (fn) {
            self != top ? loaded ? fn() : fns.push(fn) : function () {
                try {
                    testEl.doScroll('left');
                } catch (e) {
                    return setTimeout(function () {
                        ready(fn);
                    }, 50);
                }
                fn();
            }();
        } : function (fn) {
            loaded ? fn() : fns.push(fn);
        };
    });
});

/*!
 * Copyright (c) 2010-2012, Thomas Fuchs
 * Copyright (c) 2011, John Resig
 * Copyright (c) 2012, Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var qwery = require("qwery");
  var bonzo = require("bonzo");
  var ready = require("ready");
  var bean  = require("bean");

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
    else if ($.isFunction(selector))
      return ready(selector);
    else if (selector instanceof Dom) 
      return selector;
    else {
      var dom;
      if ($.isArray(selector)) 
        dom = $.compact(selector);
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

