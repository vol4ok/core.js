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
