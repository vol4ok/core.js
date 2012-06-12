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