require 'colors'
{join} = require 'path'
fs = require 'fs'

SRC_DIR = __dirname+'/src'
DST_DIR = __dirname+'/lib'
TARGETS = [
  'core.js'
  'collection.js'
  'array.js'
  'object.js'
  'function.js'
  'string.js'
  'misc.js' ]

build = (callback) ->
  ws = fs.createWriteStream "#{DST_DIR}/core.js", encoding: 'utf-8'
  count = TARGETS.length
  TARGETS.forEach (file) ->
    console.log 'compile '.magenta, file
    fs.readFile join(SRC_DIR, file), 'utf-8', (err, data) ->
      data = "/*** #{file.toUpperCase()} ***/\n\n#{data}\n"
      ws.write(data) unless err
      ws.end() if --count is 0

task 'build', 'Build lib/ from src/', ->
  build()