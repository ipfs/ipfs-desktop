import { createLogger, format, transports } from 'winston'
import { join } from 'path'
import { app } from 'electron'
import { performance } from 'perf_hooks'
import Countly from 'countly-sdk-nodejs'

const { combine, splat, timestamp, printf } = format
const logsPath = app.getPath('userData')

export { logsPath }

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

export default {
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
      fail: (err) => {
        Countly.log_error(err)
        logger.error(`${msg} ${err.toString()}`)
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
  }
}
