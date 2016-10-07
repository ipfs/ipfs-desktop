'use strict'

const winston = require('winston')
const path = require('path')
const init = require('./init')

// Setup Logging
const logger = new (winston.Logger)({
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

process.on('uncaughtException', (error) => {
  const msg = error.message || error
  logger.error(`Uncaught Exception: ${msg}`, error)
  process.exit(1)
})

init.boot(logger)
