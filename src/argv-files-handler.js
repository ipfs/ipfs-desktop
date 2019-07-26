import { app } from 'electron'
import fs from 'fs-extra'
import addToIpfs from './add-to-ipfs'

export default async function (ctx) {
  const handleArgv = async argv => {
    for (const arg of argv.slice(1)) {
      if (!arg.startsWith('--add')) {
        continue
      }

      const filename = arg.slice(6)

      if (await fs.pathExists(filename)) {
        await addToIpfs(ctx, filename)
      }
    }
  }

  // Works for Windows context menu
  app.on('second-instance', (_, argv) => {
    handleArgv(argv)
  })

  // Checks current proccess
  await handleArgv(process.argv)
}
