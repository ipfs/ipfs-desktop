const { app } = require('electron')
const { argvHandler: protocolHandler } = require('./protocol-handlers')
const { argvHandler: filesHandler } = require('./argv-files-handler')
const ctx = require('./context')

module.exports = async function () {
  app.on('second-instance', async (_, argv) => {
    if (await protocolHandler(argv, ctx)) {
      return
    }

    if (await filesHandler(argv, ctx)) {
      return
    }
    (await ctx).launchWebUI()
  })
}
