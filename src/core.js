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
  
  $.ns = $.namespace = function(target, name, block) {
    if (arguments.length < 3) {
      block  = name;
      name   = target;
      target = typeof exports !== 'undefined' ? exports : window;
    }
    var i, len, item
      , top = target
      , scopes = name.split('.');
    for (i = 0, len = scopes.length; i < len; i++)
      scope = scopes[i];
      target = target[scope] || (target[scope] = {});
    return block(target, top);
  };

})(Core);

var $ = Core;