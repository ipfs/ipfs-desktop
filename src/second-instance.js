const { app } = require('electron')
const { argvHandler: protocolHandler } = require('./protocol-handlers.js')
const { argvHandler: filesHandler } = require('./argv-files-handler.js')
const getCtx = require('./context.js')

const defaultExport = async function () {
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

module.exports = defaultExport
