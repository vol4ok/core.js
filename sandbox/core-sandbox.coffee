require('zappa').run 3001, ->
  @use 'bodyParser', @app.router, static: __dirname
  @configure
    development: => @use errorHandler: {dumpExceptions: on}
    production: => @use 'errorHandler'