const i18n = require('i18next')
const dialog = require('./dialog.js')
const { STATUS } = require('../daemon/consts.js')
const logger = require('../common/logger.js')
const getCtx = require('../context.js')

const defaultExport = async function () {
  logger.info('[ipfs-not-running] an action needs ipfs to be running')

  const option = dialog({
    title: i18n.t('ipfsNotRunningDialog.title'),
    message: i18n.t('ipfsNotRunningDialog.message'),
    buttons: [
      i18n.t('start'),
      i18n.t('cancel')
    ]
  })

  if (option !== 0) {
    return false
  }
  const startIpfs = await getCtx().getProp('startIpfs')

  return (await startIpfs()) === STATUS.STARTING_FINISHED
}

module.exports = defaultExport
