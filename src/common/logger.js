const { createLogger, format, transports } = require('winston')
const { join } = require('path')
const { app } = require('electron')
const { performance } = require('perf_hooks')
const Countly = require('countly-sdk-nodejs')

const { combine, splat, timestamp, printf } = format
const logsPath = app.getPath('userData')

const errorFile = new transports.File({
  level: 'error',
  filename: join(logsPath, 'error.log')
})

errorFile.on('finish', () => {
  process.exit(1)
})

const logger = createLogger({
  format: combine(
    timestamp(),
    splat(),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'debug',
      silent: process.env.NODE_ENV === 'production'
    }),
    errorFile,
    new transports.File({
      level: 'debug',
      filename: join(logsPath, 'combined.log')
    })
  ]
})

logger.info(`[meta] logs can be found on ${logsPath}`)

module.exports = Object.freeze({
  start: (msg, opts = {}) => {
    const start = performance.now()
    logger.info(`${msg} STARTED`)

    return {
      end: () => {
        const seconds = (performance.now() - start) / 1000

        if (opts.withAnalytics) {
          Countly.add_event({
            key: opts.withAnalytics,
            count: 1,
            dur: seconds
          })
        }

        logger.info(`${msg} FINISHED ${seconds}s`)
      },
      info: (str) => {
        logger.info(`${msg} ${str}`)
      },
      fail: (err) => {
        Countly.log_error(err)
        logger.error(`${msg} ${err.stack}`)
      }
    }
  },

  info: (msg, opts = {}) => {
    if (opts.withAnalytics) {
      Countly.add_event({
        key: opts.withAnalytics,
        count: 1
      })
    }

    logger.info(msg)
  },

  error: (err) => {
    Countly.log_error(err)
    logger.error(err)
  },

  logsPath
})
