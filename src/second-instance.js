const { app } = require('electron')
const { argvHandler: protocolHandler } = require('./protocol-handlers')
const { argvHandler: filesHandler } = require('./argv-files-handler')

module.exports = async function (ctx) {
  app.on('second-instance', async (_, argv) => {
    if (await protocolHandler(argv, ctx)) {
      return
    }

    if (await filesHandler(argv, ctx)) {
      return
    }

    ctx.launchWebUI()
  })
}
