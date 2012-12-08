# require process.env["BUILD_ENV"]
nb = require "nbuild"
$ = require "core.js"

task "sbuild", ->


build4node ->


build4browser ->
  bjs = (path, name, cb) ->
    nb.fs_js path
    , {transform: [nb.TRANSFORM_NAMESPACE_WRAPPER], namespace: name}
    , (err, str) -> 
      console.log if err then err else "#{name} compiled!"
      cb.apply(this, arguments)
  $.chain [
    (done) -> 
      $.parallel [
          (cb) -> nb.read("src/core.js", cb)
          (cb) -> bjs("vendor/underscore/underscore.js", "underscore", cb)
          (cb) -> bjs("vendor/underscore.string/lib/underscore.string.js", "underscore.string", cb)
          (cb) -> nb.read("src/common.js", cb)
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
  , (err, results, done) -> 
      console.log "sf_merge", err, results
      nb.sf_merge(results, "dist/core.js", {}, done)
  ], (err, results) -> 
    console.log "done!", arguments
    console.log if err then err else "=========== Complete!"