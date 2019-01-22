import { app, Notification } from 'electron'
import { extname, basename } from 'path'
import { logger } from '../utils'
import { showErrorNotification } from '../utils/errors'

function getFile (argv) {
  for (const arg of argv) {
    if (arg.startsWith('--add')) {
      return arg.slice(6)
    }
  }

  return ''
}

async function copyFile (launch, ipfs, hash, name, folder = false) {
  let i = 0
  const ext = extname(name)
  const base = basename(name, ext)

  while (true) {
    let newName = (i === 0 ? base : `${base} (${i})`) + ext

    try {
      await ipfs.files.stat(`/${newName}`)
    } catch (e) {
      name = newName
      break
    }

    i++
  }

  ipfs.files.cp(`/ipfs/${hash}`, `/${name}`, err => {
    if (err) {
      logger.error(err)
      return showErrorNotification("Your files couldn't be added")
    }

    const not = new Notification({
      title: folder ? 'Folder added' : 'File added',
      body: (folder ? `Folder ${name} added to IPFS.` : `File ${name} added to IPFS.`) + ' Click to open.'
    })

    not.on('click', () => {
      launch(`/files/${name}`)
    })

    not.show()
  })
}

const addToIpfs = ({ getIpfsd, launchWebUI }) => async (_, argv) => {
  const file = getFile(argv)
  if (file === '') {
    return
  }

  const ipfsd = await getIpfsd()

  if (!ipfsd) {
    logger.info('Daemon is not running')

    const not = new Notification({
      title: 'IPFS is not running',
      body: 'IPFS Desktop is started but the daemon is offline.'
    })

    not.show()
    return
  }

  ipfsd.api.addFromFs(file, { recursive: true }, (err, result) => {
    if (err) {
      logger.error(err)
      return showErrorNotification("Your files couldn't be added")
    }

    const { path, hash } = result[result.length - 1]
    copyFile(launchWebUI, ipfsd.api, hash, path, result.length > 1)
  })
}

export default async function (ctx) {
  const addToIpfsHandler = addToIpfs(ctx)

  app.on('second-instance', addToIpfsHandler)
  await addToIpfsHandler(null, process.argv)
}
