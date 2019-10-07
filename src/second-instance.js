import { app } from 'electron'
import { argvHandler as protocolHandler } from './protocol-handlers'
import { argvHandler as filesHandler } from './argv-files-handler'

export default async function (ctx) {
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
