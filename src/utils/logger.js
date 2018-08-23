import { createLogger, format, transports } from 'winston'
import { join } from 'path'

const { combine, splat, timestamp, printf } = format

const errorFile = new transports.File({
  level: 'error',
  filename: join(__dirname, 'error.log')
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
      filename: join(__dirname, 'combined.log')
    })
  ]
})

export default logger
