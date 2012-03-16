(function(Core){
  Dom = Core.Dom;

  var
    extend = Core.extend;

  Dom.extend({

    on: function() {
      return this.each(function(){
        add(this, event, callback);
      });
    },
    
    off: function() {
      return this.each(function(){
        remove(this, event, callback);
      });
    },

    delegate: function() {

    },

    undelegate: function() {

    },

    ready: function() {

    },

  });
})(Core);