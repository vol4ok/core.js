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

  $.slice = Array.prototype.slice;

  $.extend = function(target) {
    $.slice.call(arguments, 1).forEach(function(source) {
      for (key in source) target[key] = source[key];
    })
    return target;
  }

  $.ext = function() {
    $.extend.apply(this, [this].concat($.slice.call(arguments)) );
  }

})(Core);

var $ = Core;