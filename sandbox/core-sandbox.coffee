$ = require './core.js'
fs = require 'fs'


$.syncMap {f1:'1.file', f2:'2.file', f3:'3.file'}, (file, callback) -> 
    console.log file
    fs.readFile(__dirname + '/' + file, 'utf-8', callback)
  , (err, results) ->
    console.log 'complete asyncMap', err, results
console.log 'end asyncMap'

$.syncEach ['1.file', '2.file', '3.file'], (file, callback) -> 
    console.log file
    fs.readFile __dirname + '/' + file, 'utf-8', (err, data) -> 
      console.log file, err, data
      callback(err)
  , (err) ->
    console.log 'complete asyncEach', err
console.log 'end asyncEach'

$.series [
    (callback) -> fs.readFile __dirname + '/' + '1.file', 'utf-8', (err, data) ->
      console.log 'parallel 1.file'
      callback(err, data)
  ,
    (callback) -> fs.readFile __dirname + '/' + '2.file', 'utf-8', (err, data) ->
      console.log 'parallel 2.file'
      callback(err, data)
  ]
  , (err, results) ->
    console.log 'complete parallel', err, results

console.log 'end parallel'