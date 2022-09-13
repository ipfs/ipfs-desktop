// @ts-check
const { createLogger, format, transports } = require('winston')
const { join } = require('path')
const { app } = require('electron')
const { performance } = require('perf_hooks')
const Countly = require('countly-sdk-nodejs')
const { analyticsKeys } = require('../analytics/keys')

/**
 * @typedef {import('countly-sdk-nodejs').AnalyticsKeys} AnalyticsKeys
 */

/**
 * @typedef {object} AnalyticsTimeOptions
 * @property {keyof AnalyticsKeys} withAnalytics
 */

/**
 * @typedef {object} AnalyticsTimeReturnValue
 * @property {() => void} end
 * @property {(str: string) => void} info
 * @property {(err: Error) => void} fail
 */

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

/**
 *
 * @param {AnalyticsTimeOptions & import('countly-sdk-nodejs').CountlyAddEventOptions}
 *
 * @returns {void} void
 */
const addAnalyticsEvent = ({ withAnalytics, ...countlyOptions }) => {
  if (withAnalytics) {
    const key = analyticsKeys[withAnalytics]
    if (key != null) {
      const addEventOptions = { count: 1, ...countlyOptions, key }

      Countly.add_event(addEventOptions)
    } else {
      logger.error(`Key '${withAnalytics}' is not a valid analyticsKey`)
    }
  }
}

module.exports = Object.freeze({
  /**
   *
   * @param {string} msg
   * @param {AnalyticsTimeOptions} opts
   *
   * @returns {AnalyticsTimeReturnValue} AnalyticsTimeReturnValue
   */
  start: (msg, opts = {}) => {
    const start = performance.now()
    logger.info(`${msg} STARTED`)

    return {
      end: () => {
        const seconds = (performance.now() - start) / 1000

        addAnalyticsEvent({ ...opts, count: 1, dur: seconds })

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
  /**
   *
   * @param {string} msg
   * @param {AnalyticsTimeOptions & import('countly-sdk-nodejs').CountlyAddEventOptions} opts
   *
   * @returns {void} void
   */
  info: (msg, opts = {}) => {
    addAnalyticsEvent({ count: 1, ...opts })

    logger.info(msg)
  },

  error: (err) => {
    Countly.log_error(err)
    logger.error(err)
  },

  logsPath,
  addAnalyticsEvent
})
