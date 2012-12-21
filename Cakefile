$ = require "./node_modules/core.js/lib/core.js"
nb = require "nbuild"

build = (done) ->
  $.series [
    (cb) -> build4browser(cb)
    (cb) -> build4node(cb)
  ], (err) -> 
    console.log if err then "fail!" else "done!"
    done()

build4node = (callback) ->
  console.log "Build core.js for node"
  $.chain [
    (done) -> 
      $.parallel [
          (cb) -> nb.read("src/core.common.js", cb)
          (cb) -> nb.read("src/utils.js", cb)
          (cb) -> nb.read("src/string.js", cb)
          (cb) -> nb.read("src/async.js", cb)
          (cb) -> nb.read("src/misc.js", cb)
          (cb) -> cb(null, "module.exports = $;")
        ], done
    (err, results, done) -> 
      nb.sf_merge(results, "lib/core.js", {}, done)
    (err) -> 
      console.log "=========== Complete!"
      callback(null)
  ], (err) ->
    console.log err
    callback(err)

build4browser = (callback) ->
  bjs = (path, name, cb) ->
    nb.fs_js path
    , {transform: [nb.TRANSFORM_NAMESPACE_WRAPPER], namespace: name}
    , (err, str) -> 
      console.log if err then err else "#{name} compiled!"
      cb.apply(this, arguments)

  console.log "Build core.js for browser"
  $.chain [
    (done) -> 
      $.parallel [
          (cb) -> nb.read("src/core.browser.js", cb)
          (cb) -> bjs("vendor/underscore/underscore.js", "underscore", cb)
          (cb) -> nb.read("src/utils.js", cb)
          (cb) -> bjs("vendor/underscore.string/lib/underscore.string.js", "underscore.string", cb)
          (cb) -> nb.read("src/string.js", cb)
          (cb) -> nb.read("src/async.js", cb)
          (cb) -> nb.read("src/browser.js", cb)
          (cb) -> nb.read("src/misc.js", cb)
          (cb) -> bjs("vendor/bonzo/bonzo.js", "bonzo", cb)
          (cb) -> bjs("vendor/bean/bean.js", "bean",cb)
          (cb) -> bjs("vendor/qwery/qwery.js", "qwery", cb)
          (cb) -> bjs("vendor/domready/ready.js", "ready", cb)
          (cb) -> nb.read("src/dom.js", cb)
        ], done
    (err, results, done) -> 
      console.log "Merging..."
      nb.ss_merge(results, {}, done)
    (err, str, done) ->
      $.parallel [
        (cb) -> nb.write("dist/core.js", str, cb)
        (cb) -> nb.sf_js(str, "dist/core.min.js", compress: yes, cb)
      ], done
    (err) -> 
      console.log "=========== Complete!"
      callback(err)
  ], (err) ->
    console.log err
    callback(err)

if task?
  task "sbuild", -> build(->)
  task "build",  -> build(->)