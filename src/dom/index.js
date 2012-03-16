/*!
 * Copyright (c) 2010-2012, Thomas Fuchs
 * Copyright (c) 2011, John Resig
 * Copyright (c) 2012, Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  var Dom = (function(Core) {
    var
      camelize  = Core.camelize,
      dasherize = Core.dasherize, 
      each      = Core.each,
      uniq      = Core.uniq,
      slice     = Core.slice,
      compact   = Core.compact
      plunk     = Core.plunk,
      map       = Core.map,
      isF       = Core.isFunction,
      isO       = Core.isObject,
      isA       = Core.isArray;
    
    var
      document = window.document,
      getComputedStyle = document.defaultView.getComputedStyle,
      elementTypes = [1, 9, 11], //ELEMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE
      classSelectorRE = /^\.([\w-]+)$/,
      idSelectorRE = /^#([\w-]+)$/,
      tagSelectorRE = /^[\w-]+$/;
      fragmentRE = /^\s*<(\w+)[^>]*>/,
      table = document.createElement('table'),
      tableRow = document.createElement('tr'),
      containers = {
        'tr': document.createElement('tbody'),
        'tbody': table, 
        'thead': table, 
        'tfoot': table,
        'td': tableRow, 
        'th': tableRow,
        '*': document.createElement('div')
      },
      slice = Array.prototype.slice,
      rclass = /[\n\t\r]/g;
        
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
      return isF(arg) ? arg.call(context, idx, payload) : arg;
    }
    
    maybeAddPx = function(name, value) { 
      return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value; 
    }

    Dom.extend = function() {
      Core.extend.apply(this, [this].concat($.slice.call(arguments)) );
    };

    $ = Dom.$ = function(selector, context) {
      if (!selector)
        return Dom();
      if (context !== undefined) 
        return $(context).find(selector);
      else if (isF(selector))
        return $(document).ready(selector);
      else if (selector instanceof Dom) 
        return selector;
      else {
        var dom;
        if (isA(selector)) 
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
    
    $$ = Dom._$$ = function(element, selector){
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

    Dom.extend = function(){
      extend.apply(this, args)
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
        return el && !isO(el) ? el : $(el);
      },
      
      last: function() {
        var el = this[this.length - 1]; 
        return el && !isO(el) ? el : $(el);
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
        if (isF(selector) && selector.call !== undefined)
          this.each(function(idx){
            if (!selector.call(this,idx)) nodes.push(this);
          });
        else {
          var excludes = typeof selector == 'string' ? this.filter(selector) :
            (likeArray(selector) && isF(selector.item)) ? slice.call(selector) : $(selector);
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
      
      addClass: function(name) {
        return this.each(function(idx) {
          var 
            classList = [],
            cls = this.className, 
            newName = funcArg(this, name, idx, cls);
          newName.split(/\s+/g).forEach(function(klass) {
            if (!$(this).hasClass(klass))
              classList.push(klass)
          }, this);
          classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
        });
      },
      
      hasClass: function(name) {
        var 
          className = " " + name + " ",
          i = 0,
          l = this.length;
        for ( ; i < l; i++ ) {
          if ( this[i].nodeType === 1 
               && (" " + this[i].className + " ")
                .replace(rclass, " ")
                .indexOf( className ) > -1 ) 
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
      
      removeClass: function(name) {
        return this.each(function(idx) {
          if(name === undefined)
            return this.className = '';
          var classList = this.className;
          funcArg(this, name, idx, classList)
            .split(/\s+/g)
            .forEach(function(klass) {
              classList = classList.replace(classRE(klass), " ")
            });
          this.className = classList.trim()
        });
      },
      
      attr: function(name, value) {
        var res;
        return (typeof name == 'string' && value === undefined) ?
          (this.length == 0 ? undefined :
            (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
            (!(res = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : res
          ) :
          this.each(function(idx){
            if (isO(name)) for (key in name) this.setAttribute(key, name[key])
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
      },
      
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
        var nodes = isO(html) ? html : fragment(html);
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
    
    Dom.prototype = Dom.fn
    function Dom() { return Dom.constructor.apply(this, arguments) }
    return Dom;
  })($);

  $.Dom = $.constructor = Dom.$;
})(Core);