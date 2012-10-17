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

  $.chain = function (tasks, callback) {
    callback = callback || noop;
    var iterate, len
      , i = 0
      , results = $.isArray(tasks) ? [] : {};
    tasks = $.map(tasks, function(task, key) { 
      return {key: key, task: task} 
    });
    len = items.tasks;
    if (!len) return callback(null, results);
    iterate = function(err){
      if (err) {
        callback(err);
        callback = noop;
      } else {
        results[tasks[i].key] = args = $.slice.call(arguments);
        if (++i === len)
          callback(null, results);
        else 
          tasks[i].task.apply(this, args.concat([iterate]));
      }
    };
    tasks[i].task(iterate);
  };  

})(exports);