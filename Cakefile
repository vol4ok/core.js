{join} = require('path')
fs = require('fs')
util = require('util')

SRC_DIR = __dirname+'/src'
DST_LIB_DIR = __dirname+'/build/lib'
DST_NODE_DIR = __dirname+'/build/node'

TARGETS = [ # note: zhugrov a - a think it is more clear just to list a directory content
  'core.js'
  'collection.js'
  'array.js'
  'object.js'
  'func.js'
  'string.js'
  'misc.js'
  'async.js'
  'dom.js'
  'events.js'
  'ajax.js' ]

build = (callback) ->
  ws = fs.createWriteStream "#{DST_LIB_DIR}/core.js", encoding: 'utf-8'
  fs.readFile SRC_DIR+'/_header.js', 'utf-8', (err, data) ->
    if not err?
      ws.write(data)
      count = TARGETS.length
      TARGETS.forEach (file) ->
        console.log 'compile ', file
        fs.readFile join(SRC_DIR, file), 'utf-8', (err, data) ->
          data = "/*** #{file.toUpperCase()} ***/\n\n#{data}\n"
          ws.write(data) unless err?
          ws.end() if --count is 0
    else
      console.log util.inspect(err)
      throw new Error('Could not read file')

buildNode = () ->
  copyFileToNode('README.md', 'README.md')
  copyFileToNode('package.json', 'package.json')
  copyFileToNode('MIT-LICENSE.txt', 'MIT-LICENSE.txt')
  copyFileToNode('.npmignore', '.npmignore')
  indexFile = fs.createWriteStream("#{DST_NODE_DIR}/index.js", encoding: 'utf-8')
  indexFile.once 'open', (fd) ->
    console.log('start to compile a node-js package')
    fs.mkdirSync("#{DST_NODE_DIR}/lib")
    TARGETS.forEach (file) ->
      indexFile.write("var "+toModuleName(file)+' = '+"require('./lib/#{toModuleName(file)}');\n")
      indexFile.write("exports.#{toModuleName(file)} = #{toModuleName(file)};\n")
      copyFileToNode("src/#{file}", "lib/#{file}")
    indexFile.end()

toModuleName = (fileName) ->
  filePattern = /(.+).js/
  match = filePattern.exec(fileName)
  return match[1]

### copies source file to destination ###
copyFileToNode = (src, dest) ->
  dest = src if arguments.length == 1
  console.log "copy file #{__dirname+'/'+src}"
  fs.readFile(__dirname+'/'+src, 'utf-8', (err, data) ->
    data = "var Core = {};\nexports = Core;\n#{data}"
    fs.writeFile(DST_NODE_DIR+'/'+dest, data, 'utf-8')) unless err?

task 'build', 'Builds lib/ from src/', ->
  build()

task 'build:node', 'Builds a node.js packages from src', ->
  buildNode()