/*!
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($){

  $.ajax = $.xhr = $.request = function(exports){
    
    exports = request;
    exports.version = '0.3.0';

    var noop = $.noop
      , trim = $.trim
      , isFunction = $.isFunction
      , isObject = $.isObject
      , EventEmitter = $.EventEmitter;

    function getXHR() {
      if (window.XMLHttpRequest
        && ('file:' != window.location.protocol || !window.ActiveXObject)) {
        return new XMLHttpRequest;
      } else {
        try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
      }
      return false;
    }

    function serialize(obj) {
      if (!isObject(obj)) return obj;
      var pairs = [];
      for (var key in obj) {
        pairs.push(encodeURIComponent(key)
          + '=' + encodeURIComponent(obj[key]));
      }
      return pairs.join('&');
    }

    exports.serializeObject = serialize;

    function parseString(str) {
      var obj = {}
        , pairs = str.split('&')
        , parts
        , pair;

      for (var i = 0, len = pairs.length; i < len; ++i) {
        pair = pairs[i];
        parts = pair.split('=');
        obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
      }

      return obj;
    }

    exports.parseString = parseString;

    exports.types = {
        html: 'text/html'
      , json: 'application/json'
      , urlencoded: 'application/x-www-form-urlencoded'
      , 'form-data': 'application/x-www-form-urlencoded'
    };

     exports.serialize = {
         'application/x-www-form-urlencoded': serialize
       , 'application/json': JSON.stringify
     };

    exports.parse = {
        'application/x-www-form-urlencoded': parseString
      , 'application/json': JSON.parse
    };

    function parseHeader(str) {
      var lines = str.split(/\r?\n/)
        , fields = {}
        , index
        , line
        , field
        , val;

      lines.pop(); // trailing CRLF

      for (var i = 0, len = lines.length; i < len; ++i) {
        line = lines[i];
        index = line.indexOf(':');
        field = line.slice(0, index).toLowerCase();
        val = trim(line.slice(index + 1));
        fields[field] = val;
      }

      return fields;
    }

    function type(str){
      return str.split(/ *; */).shift();
    };

    function params(str){
      return str.split(/ *; */).reduce(function(obj, str){
        var parts = str.split(/ *= */)
          , key = parts.shift()
          , val = parts.shift();

        if (key && val) obj[key] = val;
        return obj;
      }, {});
    };



    function Response(xhr, options) {
      options = options || {};
      this.xhr = xhr;
      this.text = xhr.responseText;
      this.setStatusProperties(xhr.status);
      this.header = parseHeader(xhr.getAllResponseHeaders());
      this.setHeaderProperties(this.header);
      this.body = this.parseBody(this.text);
    }


    Response.prototype.setHeaderProperties = function(header){
      // content-type
      var ct = this.header['content-type'] || '';
      this.type = type(ct);

      // params
      var obj = params(ct);
      for (var key in obj) this[key] = obj[key];
    };


    Response.prototype.parseBody = function(str){
      var parse = exports.parse[this.type];
      return parse
        ? parse(str)
        : null;
    };


    Response.prototype.setStatusProperties = function(status){
      var type = status / 100 | 0;

      // status / class
      this.status = status;
      this.statusType = type;

      // basics
      this.info = 1 == type;
      this.ok = 2 == type;
      this.clientError = 4 == type;
      this.serverError = 5 == type;
      this.error = 4 == type || 5 == type;

      // sugar
      this.accepted = 202 == status;
      this.noContent = 204 == status || 1223 == status;
      this.badRequest = 400 == status;
      this.unauthorized = 401 == status;
      this.notAcceptable = 406 == status;
      this.notFound = 404 == status;
    };

    exports.Response = Response;


    
    function Request(method, url) {
      var self = this;
      EventEmitter.call(this);
      this.method = method;
      this.url = url;
      this.header = {};
      this.set('X-Requested-With', 'XMLHttpRequest');
      this.on('end', function(){
        self.callback(new Response(self.xhr));
      });
    }

    Request.prototype = new EventEmitter;
    Request.prototype.constructor = Request;


    Request.prototype.set = function(field, val){
      if (isObject(field)) {
        for (var key in field) {
          this.set(key, field[key]);
        }
        return this;
      }
      this.header[field.toLowerCase()] = val;
      return this;
    };

    Request.prototype.type = function(type){
      this.set('Content-Type', exports.types[type] || type);
      return this;
    };

    Request.prototype.query = function(obj){
      this._query = this._query || {};
      for (var key in obj) {
        this._query[key] = obj[key];
      }
      return this;
    };

    Request.prototype.send = function(data){
      if ('GET' == this.method) return this.query(data);
      var obj = isObject(data);

      // merge
      if (obj && isObject(this._data)) {
        for (var key in data) {
          this._data[key] = data[key];
        }
      } else {
        this._data = data;
      }

      if (!obj) return this;
      if (this.header['content-type']) return this;
      this.type('json');
      return this;
    };

    Request.prototype.end = function(fn){
      var self = this
        , xhr = this.xhr = getXHR()
        , query = this._query
        , data = this._data;

      // store callback
      this.callback = fn || noop;

      // state change
      xhr.onreadystatechange = function(){
        if (4 == xhr.readyState) self.emit('end');
      };

      // querystring
      if (query) {
        query = exports.serializeObject(query);
        this.url += ~this.url.indexOf('?')
          ? '&' + query
          : '?' + query;
      }

      // initiate request
      xhr.open(this.method, this.url, true);

      // body
      if ('GET' != this.method && 'HEAD' != this.method) {
        // serialize stuff
        var serialize = exports.serialize[this.header['content-type']];
        if (serialize) data = serialize(data);
      }

      // set header fields
      for (var field in this.header) {
        xhr.setRequestHeader(field, this.header[field]);
      }

      // send stuff
      xhr.send(data);
      return this;
    };
    
    exports.Request = Request;



    function request(method, url) {
      if ('function' == typeof url) {
        return new Request('GET', method).end(url);
      }

      if (1 == arguments.length) {
        return new Request('GET', method);
      }

      return new Request(method, url);
    }


    request.get = function(url, data, fn){
      var req = request('GET', url);
      if (isFunction(data)) fn = data, data = null;
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.head = function(url, data, fn){
      var req = request('HEAD', url);
      if (isFunction(data)) fn = data, data = null;
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.del = function(url, fn){
      var req = request('DELETE', url);
      if (fn) req.end(fn);
      return req;
    };


    request.patch = function(url, data, fn){
      var req = request('PATCH', url);
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.post = function(url, data, fn){
      var req = request('POST', url);
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };


    request.put = function(url, data, fn){
      var req = request('PUT', url);
      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };

    return exports;
  }({})
  
})(Core);