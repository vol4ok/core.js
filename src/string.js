/*!
 * Copyright (c) 2011 Esa-Matti Suuronen <esa-matti@suuronen.org>
 * Copyright (c) 2012 Andrew Volkov <hello@vol4ok.net>
 */

(function($) {

    var StringProto     = String.prototype
      , nativeTrim      = StringProto.trim
      , nativeTrimRight = StringProto.trimRight
      , nativeTrimLeft  = StringProto.trimLeft;

    $.isBlank = function(str){
      return (/^\s*$/).test(str);
    };

    $.stripTags = function(str){
      return (''+str).replace(/<\/?[^>]+>/ig, '');
    };

    $.capitalize  = function(str) {
      str = ''+str;
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    };

    $.chop = function(str, step){
      str = str+'';
      step = ~~step || str.length;
      var arr = [];
      for (var i = 0; i < str.length;) {
        arr.push(str.slice(i,i + step));
        i = i + step;
      }
      return arr;
    };

    $.clean = function(str){
      return $.strip((''+str).replace(/\s+/g, ' '));
    };

    $.count = function(str, substr){
      str = ''+str; substr = ''+substr;
      var count = 0, index;
      for (var i=0; i < str.length;) {
        index = str.indexOf(substr, i);
        index >= 0 && count++;
        i = i + (index >= 0 ? index : 0) + substr.length;
      }
      return count;
    };

    $.chars = function(str) {
      return (''+str).split('');
    };

    $.escapeHTML = function(str) {
      return (''+str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, "&apos;");
    };

    $.unescapeHTML = function(str) {
      return (''+str)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
    };

    $.escapeRegExp = function(str){
      // From MooTools core 1.2.4
      return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
    };

    $.insert = function(str, i, substr){
      var arr = (''+str).split('');
      arr.splice(~~i, 0, ''+substr);
      return arr.join('');
    };

    $.include = function(str, needle){
      return (''+str).indexOf(needle) !== -1;
    };

    $.join = function(sep) {
      var args = slice(arguments);
      return args.join(args.shift());
    };

    $.lines = function(str) {
      return (''+str).split("\n");
    };

    $.reverse = function(str){
        return Array.prototype.reverse.apply(String(str).split('')).join('');
    };

    $.splice = function(str, i, howmany, substr){
      var arr = (''+str).split('');
      arr.splice(~~i, ~~howmany, substr);
      return arr.join('');
    };

    $.startsWith = function(str, starts){
      str = ''+str; starts = ''+starts;
      return str.length >= starts.length && str.substring(0, starts.length) === starts;
    };

    $.endsWith = function(str, ends){
      str = ''+str; ends = ''+ends;
      return str.length >= ends.length && str.substring(str.length - ends.length) === ends;
    };

    $.succ = function(str){
      str = ''+str;
      var arr = str.split('');
      arr.splice(str.length-1, 1, String.fromCharCode(str.charCodeAt(str.length-1) + 1));
      return arr.join('');
    };

    $.titleize = function(str){
      return (''+str).replace(/\b./g, function(ch){ return ch.toUpperCase(); });
    };

    $.camelize = function(str){
      return $.trim(str)
        .replace(/(\-|_|\s)+(.)?/g, function(match, separator, chr) {
          return chr ? chr.toUpperCase() : '';
        });
    };

    $.underscored = function(str){
      return $.trim(str)
        .replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
    };

    $.dasherize = function(str){
      return $.trim(str)
        .replace(/[_\s]+/g, '-')
        .replace(/([A-Z])/g, '-$1')
        .replace(/-+/g, '-')
        .toLowerCase();
    };

    $.humanize = function(str){
      return $.capitalize(this.underscored(str)
        .replace(/_id$/,'')
        .replace(/_/g, ' '));
    };

    $.trim = function(str, characters){
      str = ''+str;
      if (!characters && nativeTrim) {
        return nativeTrim.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return str.replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');
    };

    $.ltrim = function(str, characters){
      if (!characters && nativeTrimLeft) {
        return nativeTrimLeft.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return (''+str).replace(new RegExp('\^' + characters + '+', 'g'), '');
    };

    $.rtrim = function(str, characters){
      if (!characters && nativeTrimRight) {
        return nativeTrimRight.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return (''+str).replace(new RegExp(characters + '+$', 'g'), '');
    };

    $.truncate = function(str, length, truncateStr){
      str = ''+str; truncateStr = truncateStr || '...';
      length = ~~length;
      return str.length > length ? str.slice(0, length) + truncateStr : str;
    };

    $.prune = function(str, length, pruneStr){
      str = ''+str; length = ~~length;
      pruneStr = pruneStr != null ? ''+pruneStr : '...';
      
      var pruned, borderChar, template = str.replace(/\W/g, function(ch){
        return (ch.toUpperCase() !== ch.toLowerCase()) ? 'A' : ' ';
      });
      
      borderChar = template[length];
      
      pruned = template.slice(0, length);
      
      // Check if we're in the middle of a word
      if (borderChar && borderChar.match(/\S/))
        pruned = pruned.replace(/\s\S+$/, '');
        
      pruned = $.rtrim(pruned);
      
      return (pruned+pruneStr).length > str.length ? str : str.substring(0, pruned.length)+pruneStr;
    };

    $.words = function(str, delimiter) {
      return (''+str).split(delimiter || " ");
    };

    $.pad = function(str, length, padStr, type) {
      str = ''+str;
      
      var padding = '', padlen  = 0;

      length = ~~length;
      
      if (!padStr) {
        padStr = ' ';
      } else if (padStr.length > 1) {
        padStr = padStr.charAt(0);
      }
      
      switch(type) {
        case 'right':
          padlen = (length - str.length);
          padding = strRepeat(padStr, padlen);
          str = str+padding;
          break;
        case 'both':
          padlen = (length - str.length);
          padding = {
            'left' : strRepeat(padStr, Math.ceil(padlen/2)),
            'right': strRepeat(padStr, Math.floor(padlen/2))
          };
          str = padding.left+str+padding.right;
          break;
        default: // 'left'
          padlen = (length - str.length);
          padding = strRepeat(padStr, padlen);;
          str = padding+str;
        }
      return str;
    };

    $.lpad = function(str, length, padStr) {
      return $.pad(str, length, padStr);
    };

    $.rpad = function(str, length, padStr) {
      return $.pad(str, length, padStr, 'right');
    };

    $.lrpad = function(str, length, padStr) {
      return $.pad(str, length, padStr, 'both');
    };

    $.toNumber = function(str, decimals) {
      var num = parseNumber(parseNumber(str).toFixed(~~decimals));
      return num === 0 && ''+str !== '0' ? Number.NaN : num;
    };
    
})(Core);