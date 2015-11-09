var mono = require('monogamous')
var winston = require('winston')
var path = require('path')
var init = require('./build/init')

// Setup Logging
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      handleExceptions: false
    }),
    new (winston.transports.File)({
      filename: path.join(__dirname, '..', 'app.log'),
      handleExceptions: false
    })
  ]
})

process.on('uncaughtException', function (error) {
  const msg = error.message || error
  logger.error(`Uncaught Exception: ${msg}`, error, error.stack, arguments)
  process.exit(1)
})

// This ensures that there is only one instance of our application.
var booter = mono({sock: 'station'}, {})

booter.on('boot', init.boot.bind(init, logger))
booter.on('reboot', init.reboot.bind(init))
booter.on('error', function (err) {
  logger.error(err)
})

logger.info('Booting')
booter.boot()
