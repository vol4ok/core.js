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