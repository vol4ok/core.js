require 'colors'

$ = {}
$ extends require('path-ex')
$ extends require('fs-ex')
{inspect} = require('util')

SRC_DIR          = __dirname + '/src'
DST_BROWSER_DIR  = __dirname + '/browser'
DST_NODE_DIR     = __dirname + '/lib'

BROWSER_TARGETS = [
  '_header.js'
  'core.js'
  'collection.js'
  'array.js'
  'object.js'
  'func.js'
  'string.js'
  'misc.js'
  'browser.js'
  'async.js'
  'dom.js'
  'events.js'
  'ajax.js'
  'promise.js'
  '_footer.js' ]

NODE_TARGETS = [
  'core.js'
  'collection.js'
  'array.js'
  'object.js'
  'func.js'
  'string.js'
  'misc.js'
  'async.js'
  'promise.js'
]

build_browser = (callback) ->
  console.log 'builds a browser package:'.cyan
  $.mkdirpSync(DST_BROWSER_DIR)
  ws = $.createWriteStream "#{DST_BROWSER_DIR}/core.js", encoding: 'utf-8'
  count = BROWSER_TARGETS.length
  BROWSER_TARGETS.forEach (file) ->
    console.log 'compile '.green, file
    data = $.readFileSync $.join(SRC_DIR, file), 'utf-8'
    data = "/*** #{file.toUpperCase()} ***/\n\n#{data}\n" unless file[0] is '_'
    ws.write(data)
  ws.end()


build_node = () ->
  console.log 'builds a node.js package:'.cyan
  $.mkdirpSync(DST_NODE_DIR)
  indexFile = $.createWriteStream("#{DST_NODE_DIR}/index.js", encoding: 'utf-8')
  indexFile.write("var $ = require('./core');\n")
  merge = "" #merge part of a index.js file
  NODE_TARGETS.forEach (file) ->
    moduleName = $.removeExt(file)
    merge += "$.ext(require('./#{moduleName}'));\n" unless moduleName is 'core'
    console.log 'compile '.green, file
    data = $.readFileSync($.join(SRC_DIR, file), 'utf-8')
    data = data.replace '})(Core);', '})(exports);'
    $.writeFileSync($.join(DST_NODE_DIR, file), data, 'utf-8')
  indexFile.write(merge)
  indexFile.write("module.exports = $;")
  indexFile.end()

task 'build', 'Builds browser and node.js packages from src', ->
  build_browser()
  build_node()
  
task 'build:browser', 'Builds a browser package from src', ->
  build_browser()

task 'build:node', 'Builds a node.js package from src', ->
  build_node()