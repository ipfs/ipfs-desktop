const { app } = require('electron')
const { argvHandler: protocolHandler } = require('./protocol-handlers')
const { argvHandler: filesHandler } = require('./argv-files-handler')
const getCtx = require('./context')

module.exports = async function () {
  app.on('second-instance', async (_, argv) => {
    if (await protocolHandler(argv)) {
      return
    }

    if (await filesHandler(argv)) {
      return
    }

    const launchWebUI = await getCtx().getProp('launchWebUI')

    await launchWebUI()
  })
}
