/*!
 * Copyright (c) 2010-2012, Thomas Fuchs
 * Copyright (c) 2011, John Resig
 * Copyright (c) 2012, Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var extend     = $.extend
    , camelize   = $.camelize
    , dasherize  = $.dasherize
    , trim       = $.trim
    , each       = $.each
    , uniq       = $.uniq
    , slice      = $.slice
    , compact    = $.compact
    , pluck      = $.pluck
    , map        = $.map
    , isFunction = $.isFunction
    , isObject   = $.isObject
    , isArray    = $.isArray;

  $.Dom = (function(Core) {
    
    var document = window.document
      , emptyArray       = []
      , getComputedStyle = document.defaultView.getComputedStyle
      , elementTypes     = [1, 9, 11] //ELEMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE
      , classSelectorRE  = /^\.([\w-]+)$/
      , idSelectorRE     = /^#([\w-]+)$/
      , tagSelectorRE    = /^[\w-]+$/
      , fragmentRE       = /^\s*<(\w+)[^>]*>/
      , classRE          = /[\n\t\r]/g
      , spaceRE          = /\s+/
      , readyRE          = /complete|loaded|interactive/
      , table            = document.createElement('table')
      , tableRow         = document.createElement('tr')
      , containers       = {
            'tr': document.createElement('tbody')
          , 'tbody': table 
          , 'thead': table 
          , 'tfoot': table
          , 'td': tableRow 
          , 'th': tableRow
          , '*': document.createElement('div')
        };
      
        
    var fragment, filtered, funcArg, maybeAddPx, $, $$;
      
    fragment = function (html, name) {
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
      if (!(name in containers)) name = '*';
      var container = containers[name];
      container.innerHTML = '' + html;
      return slice.call(container.childNodes);
    }

    filtered = function(nodes, selector) {
      return selector === undefined ? $(nodes) : $(nodes).filter(selector);
    }

    funcArg = function(context, arg, idx, payload) {
      return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }
    
    maybeAddPx = function(name, value) { 
      return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value; 
    }

    $ = Dom.$ = function(selector, context) {
      if (!selector)
        return Dom();
      if (context !== undefined) 
        return $(context).find(selector);
      else if (isFunction(selector))
        return $(document).ready(selector);
      else if (selector instanceof Dom) 
        return selector;
      else {
        var dom;
        if (isArray(selector)) 
          dom = compact(selector);
        else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
          dom = [selector], selector = null;
        else if (fragmentRE.test(selector))
          dom = fragment(selector.trim(), RegExp.$1), selector = null;
        else if (selector.nodeType && selector.nodeType == 3) 
          dom = [selector];
        else 
          dom = $$(document, selector);
        return Dom(dom, selector);
      }
    }
    
    $$ = function(element, selector){
      var found;
      return (element === document && idSelectorRE.test(selector)) ?
        ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
        (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
          slice.call(
            classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
            tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
            element.querySelectorAll(selector)
        );
    }
    
    Dom.fn = {
      concat: Array.prototype.concat,
      indexOf: Array.prototype.indexOf,
      
      at: function(idx) { return idx === undefined ? slice.call(this) : this[idx] },
      size: function(){ return this.length },
      map: function(fn){ return map(this, function(el, i){ return fn.call(el, i, el) }); },
      slice: function(){ return $(slice.apply(this, arguments)); },
      
      each: function(callback){
        each(this, function(el, idx){ 
          callback.call(el, idx, el) 
        });
        return this;
      },

      ready: function(callback){
        if (readyRE.test(document.readyState)) 
          callback($);
        else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false);
        return this;
      },
      
      /* Traversing 
      -------------------------------------------------------- */
      
      add: function(selector,context) {
        return $(uniq(this.concat($(selector,context))));
      },
      
      next: function() {
        return $(pluck(this, 'nextElementSibling'));
      },
      
      prev: function() {
        return $(pluck(this, 'previousElementSibling'));
      },
      
      siblings: function(selector) {
        return filtered(this.map(function(i, el) {
          return slice
            .call(el.parentNode.children)
            .filter(function(child) { 
              return child !== el 
            });
        }), selector);
      },
      
      children: function(selector) {
        return filtered(this.map(function(){ 
          return slice.call(this.children);
        }), selector);
      },
      
      parent: function(selector) {
        return filtered(uniq(pluck(this, 'parentNode')), selector);
      },
      
      find: function(selector) {
        var result;
        if (this.length == 1) 
          result = $$(this[0], selector);
        else 
          result = this.map(function(){ 
            return $$(this, selector);
          });
        return $(result);
      },
      
      closest: function(selector, context) {
        var 
          node = this[0], 
          candidates = $$(context || document, selector);
        if (!candidates.length) node = null;
        while (node && candidates.indexOf(node) < 0)
          node = node !== context && node !== document && node.parentNode;
        return $(node);
      },
      
      parents: function(selector) {
        var ancestors = [], nodes = this;
        while (nodes.length > 0)
          nodes = map(nodes, function(node){
            if ((node = node.parentNode) 
                && node !== document 
                && ancestors.indexOf(node) < 0) 
            {
              ancestors.push(node);
              return node;
            }
          });
        return filtered(ancestors, selector);
      },
      
      /* Filtering 
      -------------------------------------------------------- */
      
      first: function() {
        var el = this[0]; 
        return el && !isObject(el) ? el : $(el);
      },
      
      last: function() {
        var el = this[this.length - 1]; 
        return el && !isObject(el) ? el : $(el);
      },
      
      filter: function(selector) {
        return $(Array.prototype.filter.call(this, function(element){
          return element.parentNode && $$(element.parentNode, selector).indexOf(element) >= 0;
        }));
      },
      
      eq: function(idx) {
        return this.length > 0 && $(this[0]).filter(selector).length > 0;
      },
      
      not: function(selector) {
        var nodes=[];
        if (isFunction(selector) && selector.call !== undefined)
          this.each(function(idx){
            if (!selector.call(this,idx)) nodes.push(this);
          });
        else {
          var excludes = typeof selector == 'string' ? this.filter(selector) :
            (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector);
          this.forEach(function(el){
            if (excludes.indexOf(el) < 0) nodes.push(el);
          });
        }
        return $(nodes);
      },
      
      end: function() {
        return this.prevObject || $();
      },
      
      is: function(selector) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1);
      },
      
      
      /* Manipulation 
      -------------------------------------------------------- */
      
      empty: function() {
        return this.each(function(){ 
          this.innerHTML = '' 
        });
      },
      
      html: function(html) {
        return html === undefined ?
          (this.length > 0 ? this[0].innerHTML : null) :
          this.each(function (idx) {
            var originHtml = this.innerHTML;
            $(this)
              .empty()
              .append( funcArg(this, html, idx, originHtml) );
          });
      },
      
      text: function() {
        return text === undefined ?
          (this.length > 0 ? this[0].textContent : null) :
          this.each(function() { 
            this.textContent = text 
          });
      },
      
      remove: function(){
        return this.each(function () {
          if (this.parentNode != null) {
            this.parentNode.removeChild(this);
          }
        });
      },
      
      /* Attributes
      -------------------------------------------------------- */
      
      addClass: function( value ) {
        var classNames, i, l, elem, setClass, c, cl;

        if (isFunction(value))
          return this.each(function( j ) {
            $(this).addClass(value.call(this, j, this.className));
          });

        if (value && typeof value === "string") {
          classNames = value.split( spaceRE );
          for ( i = 0, l = this.length; i < l; i++ ) {
            elem = this[ i ];
            if ( elem.nodeType === 1 ) {
              if ( !elem.className && classNames.length === 1 ) {
                elem.className = value;
              } else {
                setClass = " " + elem.className + " ";
                for ( c = 0, cl = classNames.length; c < cl; c++ )
                  if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) )
                    setClass += classNames[ c ] + " ";
                elem.className = trim(setClass);
              }
            }
          }
        }
        return this;
      },
      
      hasClass: function(name) {
        var 
          className = " " + name + " ",
          i = 0,
          l = this.length;
        for ( ; i < l; i++ ) {
          if ( this[i].nodeType === 1 
               && (" " + this[i].className + " ")
                .replace(classRE, " ")
                .indexOf(className) > -1)
          {
            return true;
          }
        }
        return false;
      },
      
      toggleClass: function(name, when) {
        return this.each(function(idx){
          var newName = funcArg(this, name, idx, this.className);
          (when === undefined ? !$(this).hasClass(newName) : when) ?
            $(this).addClass(newName) : $(this).removeClass(newName);
        });
      },
      
      removeClass: function( value ) {
        var classNames, i, l, elem, className, c, cl;

        if (isFunction( value ))
          return this.each(function( j ) {
            $(this).removeClass( value.call(this, j, this.className) );
          });

        if ((value && typeof value === "string") || value === undefined) {
          classNames = ( value || "" ).split( spaceRE );
          for ( i = 0, l = this.length; i < l; i++ ) {
            elem = this[i];
            if ( elem.nodeType === 1 && elem.className )
              if ( value ) {
                className = (" " + elem.className + " ").replace( classRE, " " );
                for ( c = 0, cl = classNames.length; c < cl; c++ )
                  className = className.replace(" " + classNames[ c ] + " ", " ");
                elem.className = trim( className );

              } else
                elem.className = "";
          }
        }
        return this;
      },
      
      attr: function(name, value) {
        var res;
        return (typeof name == 'string' && value === undefined) ?
          (this.length == 0 ? undefined :
            (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
            (!(res = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : res
          ) :
          this.each(function(idx){
            if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
            else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)));
          });
      },
      
      removeAttr: function(name) {
        return this.each(function() { this.removeAttribute(name); });
      },
      
      data: function(name, value) {
        return this.attr('data-' + name, value);
      },
      
      val: function() {
        return (value === undefined) ?
          (this.length > 0 ? this[0].value : null) :
          this.each(function(idx){
            this.value = funcArg(this, value, idx, this.value);
          });
      },
      
      /* CSS & Dimensions
      -------------------------------------------------------- */
      
      css: function(property, value) {
        if (value === undefined && typeof property == 'string') {
          return(
            this.length == 0
              ? undefined
              : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property)
          );
        }
        var css = '';
        for (key in property) 
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
        if (typeof property == 'string') 
          css = dasherize(property) + ":" + maybeAddPx(property, value);
        return this.each(function() { 
          this.style.cssText += ';' + css 
        });
      },
      
      offset: function() {
        if(this.length == 0) return null;
        var obj = this[0].getBoundingClientRect();
        return {
          left: obj.left + window.pageXOffset,
          top: obj.top + window.pageYOffset,
          width: obj.width,
          height: obj.height
        };
      }
      
    };
    
    [ "filter", "add", "not", "eq", "first", 
      "last", "find", "closest", "parents", 
      "parent", "children", "siblings" ].forEach(function(property) {
        var fn = Dom.fn[property];
        Dom.fn[property] = function() {
          var ret = fn.apply(this, arguments);
          ret.prevObject = this;
          return ret;
        }
      });
    
    ['width', 'height'].forEach(function(dimension){
      Dom.fn[dimension] = function(value) {
        var offset, Dimension = dimension.replace(/./, function(m) { return m[0].toUpperCase() });
        if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
          this[0] == document ? document.documentElement['offset' + Dimension] :
          (offset = this.offset()) && offset[dimension];
        else return this.each(function(idx){
          var el = $(this);
          el.css(dimension, funcArg(this, value, idx, el[dimension]()));
        });
      }
    });

    var insert, traverseNode;
    
    insert = function(operator, target, node) {
      var parent = (operator % 2) ? target : target.parentNode;
      parent && parent.insertBefore(node,
        !operator ? target.nextSibling :      // after
        operator == 1 ? parent.firstChild :   // prepend
        operator == 2 ? target :              // before
        null);                                // append
    };

    traverseNode = function (node, fun) {
      fun(node);
      for (var key in node.childNodes)
        traverseNode(node.childNodes[key], fun);
    };
    
    [ 'after', 'prepend', 'before', 'append' ].forEach(function(key, operator) {
      Dom.fn[key] = function(html){
        var nodes = isObject(html) ? html : fragment(html);
        if (!('length' in nodes) || nodes.nodeType) nodes = [nodes];
        if (nodes.length < 1) return this;
        var 
          size = this.length, 
          copyByClone = size > 1, 
          inReverse = operator < 2;
        return this.each(function(index, target){
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[inReverse ? nodes.length-i-1 : i];
            traverseNode(node, function (node) {
              if (node.nodeName != null 
                  && node.nodeName.toUpperCase() === 'SCRIPT' 
                  && (!node.type || node.type === 'text/javascript')) 
              {
                window['eval'].call(window, node.innerHTML);
              }
            });
            if (copyByClone && index < size - 1) 
              node = node.cloneNode(true);
            insert(operator, target, node);
          }
        });
      };

      var reverseKey = (operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After');
      Dom.fn[reverseKey] = function(html) {
        $(html)[key](this);
        return this;
      };

    });
    
    Dom.constructor = function(dom, selector){
      dom = dom || emptyArray;
      dom.__proto__ = Dom.prototype;
      dom.selector = selector || '';
      return dom;
    };
    
    Dom.prototype = Dom.fn;
    function Dom() { return Dom.constructor.apply(this, arguments) }
    return Dom;
  })($);


  /* EVENTS
   ================================================================================================ */


  (function(Dom) {

    var Event
      , _zid = 1
      , handlers = {}
      , specialEvents = {};

    specialEvents.click 
      = specialEvents.mousedown 
      = specialEvents.mouseup 
      = specialEvents.mousemove = 'MouseEvents';


    function zid(element) {
      return element._zid || (element._zid = _zid++);
    }


    function parse(event) {
      var parts = ('' + event).split('.');
      return {
          e: parts[0]
        , ns: parts.slice(1).sort().join(' ')
      };
    }


    function eachEvent(events, fn, iterator) {
      if (isObject(events)) 
        each(events, iterator);
      else 
        events.split(/\s/).forEach(function(type){ 
          iterator(type, fn) 
        });
    }

    function matcherFor(ns) {
      return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
    }

    function findHandlers(element, event, fn, selector) {
      event = parse(event);
      if (event.ns) 
        var matcher = matcherFor(event.ns);
      return (handlers[zid(element)] || []).filter(function(handler) {
        return handler
          && (!event.e  || handler.e == event.e)
          && (!event.ns || matcher.test(handler.ns))
          && (!fn       || handler.fn == fn)
          && (!selector || handler.sel == selector);
      });
    }
    
    var returnTrue = function()  { return true  }
      , returnFalse = function() { return false }
      , eventMethods = {
          preventDefault: 'isDefaultPrevented'
        , stopImmediatePropagation: 'isImmediatePropagationStopped'
        , stopPropagation: 'isPropagationStopped'
        };

    function createProxy(event) {
      var proxy = {};
      for (key in event) {
        if (key !== "layerX" && key !== "layerY")
          proxy[key] = event[key]
      }
      proxy.originalEvent = event;
      each(eventMethods, function(name, predicate) {
        proxy[name] = function(){
          this[predicate] = returnTrue;
          return event[name].apply(event, arguments);
        };
        proxy[predicate] = returnFalse;
      })
      return proxy;
    }

    var eventRepl = {mouseenter: "mouseover", mouseleave: "mouseout"};
    
    function add(element, events, fn, selector, getDelegate) {
      var id = zid(element)
        , set = (handlers[id] || (handlers[id] = []));
      eachEvent(events, fn, function(event, fn) {
        var delegate = getDelegate && getDelegate(fn, event)
          , callback = delegate || fn;
        
        var handler = parse(event)
          , e = handler.e;
        
        if (eventRepl[e]) {
          callback = (function(cb, orig, repl) {
            return function(event) {
              var result
                , related = event.relatedTarget;
              if (!related || (related !== this && !this.contains(related))){
                ev = createProxy(event);
                ev.type = orig;
                result = cb.apply(this, [ev].concat(slice.call(arguments,1)));
                ev.type = repl;
              }
              return result;
            };
          })(callback, e, eventRepl[e]);
          handler.e = e = eventRepl[e];
        }
        
        var proxyfn = function (event) {
          var result = callback.apply(element, [event].concat(event.data));
          if (result === false) 
            event.preventDefault();
          return result;
        };
        
        handler = extend(handler, {
            fn: fn
          , proxy: proxyfn
          , sel: selector
          , del: delegate
          , i: set.length
        });
        
        set.push(handler);
        element.addEventListener(e, proxyfn, false);
      });
    }

    function findHandlers(element, event, fn, selector) {
      var event = parse(event);
      if (event.ns) 
        var matcher = matcherFor(event.ns);
      return (handlers[zid(element)] || []).filter(function(handler) {
        return handler
          && (!event.e  || handler.e == event.e)
          && (!event.ns || matcher.test(handler.ns))
          && (!fn       || handler.fn == fn)
          && (!selector || handler.sel == selector);
      });
    }


    function remove(element, events, fn, selector) {
      var id = zid(element);
      eachEvent(events || '', fn, function(event, fn){
        findHandlers(element, event, fn, selector).forEach(function(handler){
          delete handlers[id][handler.i];
          element.removeEventListener(handler.e, handler.proxy, false);
        });
      });
    }

    Dom.event = { add: add, remove: remove }


    function fix(event) {
      if (!('defaultPrevented' in event)) {
        event.defaultPrevented = false;
        var prevent = event.preventDefault;
        event.preventDefault = function() {
          this.defaultPrevented = true;
          prevent.call(this);
        }
      }
    }

    extend(Dom.fn, {

      on: function(event, selector, callback) {
        return selector === undefined || $.isFunction(selector)
          ? this.each(function(){ add(this, event, selector); }) 
          : this.delegate(selector, event, callback);
      },

      
      off: function(event, selector, callback) {
        return selector === undefined || $.isFunction(selector)
          ? this.each(function(){ remove(this, event, selector); }) 
          : this.undelegate(selector, event, callback);
      },


      one: function(event, callback) {
        return this.each(function(i, element){
          add(this, event, callback, null, function(fn, type){
            return function(){
              var result = fn.apply(element, arguments);
              remove(element, type, fn);
              return result;
            }
          });
        });
      },


      delegate: function(selector, event, callback) {
        return this.each(function(i, element){
          add(element, event, callback, selector, function(fn){
            return function(e){
              var evt
                , match = $(e.target)
                    .closest(selector, element)
                    .at(0);
              if (match) {
                evt = extend(createProxy(e), {
                  currentTarget: match
                , liveFired: element
                });
                return fn.apply(match, [evt].concat(slice.call(arguments, 1)));
              }
            }
          });
        });
      },


      undelegate: function(selector, event, callback) {
        return this.each(function(){
          remove(this, event, callback, selector);
        });
      },


      trigger: function(event, data){
        if (typeof event == 'string') 
          event = Event(event);
        fix(event);
        event.data = data;
        return this.each(function(){ 
          this.dispatchEvent(event) 
        });
      },


      triggerHandler: function(event, data){
        var e, result;
        this.each(function(i, element){
          e = createProxy(typeof event == 'string' ? Event(event) : event);
          e.data = data; e.target = element;
          each(findHandlers(element, event.type || event), function(i, handler){
            result = handler.proxy(e);
            if (e.isImmediatePropagationStopped()) return false;
          });
        });
        return result;
      }

    });

    [ "focusin", "focusout", "load", "resize", 
      "scroll", "unload", "click", "dblclick", 
      "mousedown", "mouseup", "mousemove", "mouseover", 
      "mouseout", "mouseenter", "mouseleave", "change", 
      "select", "keydown", "keypress", "keyup", "error"
    ].forEach(function(event) {
      Dom.fn[event] = function(callback){ 
        return this.on(event, callback) 
      };
    });

    ['focus', 'blur'].forEach(function(name) {
      Dom.fn[name] = function(callback) {
        if (callback) 
          this.on(name, callback);
        else if (this.length) 
          try { 
            this.get(0)[name]() 
          } catch(e) {};
        return this;
      };
    });


    Event = Dom.Event = function(type, props) {
      var event = document.createEvent(specialEvents[type] || 'Events')
        , bubbles = true;
      if (props) 
        for (var name in props) 
          (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
      event.initEvent(type, bubbles, true, null, null, null, 
        null, null, null, null, null, null, null, null, null);
      return event;
    };

  })($.Dom);

  $.constructor = $.Dom.$;
})(Core);