import fs from 'fs-extra'
import addToIpfs from './add-to-ipfs'

export async function argvHandler (argv, ctx) {
  let handled = false

  const files = []
  for (const arg of argv.slice(1)) {
    if (!arg.startsWith('--add')) {
      continue
    }

    const filename = arg.slice(6)

    if (await fs.pathExists(filename)) {
      files.push(filename)
    }
  }

  if (files.length > 0) {
    await addToIpfs(ctx, files)
    handled = true
  }

  return handled
}

export default async function (ctx) {
  // Checks current proccess
  await argvHandler(process.argv, ctx)
}
