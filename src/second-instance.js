const { app } = require('electron')
const { argvHandler: filesHandler } = require('./argv-files-handler')
const getCtx = require('./context')
const { argvHandler: protocolHandler } = require('./protocol-handlers')

module.exports = async function () {
  const ctx = getCtx()
  app.on('second-instance', async (_, argv) => {
    if (await protocolHandler(argv)) {
      return
    }

    if (await filesHandler(argv)) {
      return
    }

    await ctx.getFn('launchWebUI')()
  })
}
