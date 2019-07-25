import { createLogger, format, transports } from 'winston'
import { join } from 'path'
import { app } from 'electron'

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

logger.info('[meta] logs can be found on %s', logsPath)

export default logger
