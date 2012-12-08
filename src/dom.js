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