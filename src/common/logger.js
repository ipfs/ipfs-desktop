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

const { combine, splat, timestamp, printf, errors } = format
const logsPath = ['test', 'development'].includes(process.env.NODE_ENV ?? 'none') ? process.cwd() : app.getPath('userData')

const errorFile = new transports.File({
  level: 'error',
  filename: join(logsPath, 'error.log')
})

errorFile.on('finish', () => {
  process.exit(1)
})

const logger = createLogger({
  format: combine(
    errors({ stack: true }),
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
 * @param {AnalyticsTimeOptions & Omit<import('countly-sdk-nodejs').CountlyAddEventOptions, 'key'>} opts
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
   * @param {AnalyticsTimeOptions & Omit<import('countly-sdk-nodejs').CountlyAddEventOptions, 'key'>} opts
   *
   * @returns {AnalyticsTimeReturnValue} AnalyticsTimeReturnValue
   */
  start: (msg, opts) => {
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
   * @param {AnalyticsTimeOptions & Omit<import('countly-sdk-nodejs').CountlyAddEventOptions, 'key'>} [opts]
   *
   * @returns {void} void
   */
  info: (msg, opts) => {
    if (opts) {
      addAnalyticsEvent({ count: 1, ...opts })
    }

    logger.info(msg)
  },

  /**
   *
   * @param {Error|string} errMsg
   * @param {Error|unknown} [error]
   */
  error: (errMsg, error) => {
    if (errMsg instanceof Error) {
      Countly.log_error(errMsg)
      logger.error(errMsg)
    } else if (error != null && error instanceof Error) {
      // errorMessage is not an instance of an error, but error is
      Countly.log_error(error)
      logger.error(errMsg, error)
    } else {
      Countly.log_error(new Error(errMsg))
      logger.error(errMsg, error)
    }
  },

  warn: (msg, meta) => {
    logger.warn(msg, meta)
  },

  debug: (msg) => {
    logger.debug(msg)
  },

  logsPath,
  addAnalyticsEvent,
  /**
   * For when you want to log something without potentially emitting it to countly
   */
  fileLogger: logger
})
