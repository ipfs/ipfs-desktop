import {dialog} from 'electron'

import { logger } from './utils'
import { logsPath } from './utils/logger'

const errors = [
  {
    find: [
      'ipfs daemon is running',
      'already locked'
    ],
    title: 'IPFS is already running',
    message: 'Please stop your IPFS daemon before running this application.'
  }
]

export function handleKnownErrors (e) {
  const msg = e.toString()

  const error = errors.find((error) => {
    return error.find.find((term) => {
      return msg.includes(term)
    })
  })

  if (error === undefined) {
    throw e
  } else {
    dialog.showErrorBox(
      error.title,
      error.message
    )

    process.exit(0)
  }
}

function fatal (error) {
  logger.error(error)
  logger.end()

  dialog.showErrorBox(
    'Something wrong happened',
    `Some unexpected error occurred and we couldn't handle it. Check ${logsPath}` +
    ` for the latest logs and open an issue on https://github.com/ipfs-shipyard/ipfs-desktop/issues.`
  )
}

export default function setupErrorHandling () {
  // Set up what to do on Uncaught Exceptions and Unhandled Rejections
  process.on('uncaughtException', fatal)
  process.on('unhandledRejection', fatal)
}
