import { app, Notification } from 'electron'
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

const addToIpfs = ({ getIpfsd, launchWebUI }) => async (_, argv) => {
  const file = getFile(argv)
  if (file === '') {
    return launchWebUI('/')
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

    console.log(result)

    const { path, hash } = result[result.length - 1]

    // TODO: if it fails, append number
    ipfsd.api.files.cp(`/ipfs/${hash}`, `/${path}`, err => {
      if (err) {
        logger.error(err)
        return showErrorNotification("Your files couldn't be added")
      }

      const not = new Notification({
        title: result.length === 1 ? 'File added' : 'Folder added',
        body: (result.length === 1 ? `File ${path} added to IPFS.` : `Folder ${path} added to IPFS.`) + ' Click to open.'
      })

      not.on('click', () => {
        launchWebUI(`/files/${path}`)
      })

      not.show()
    })
  })
}

export default async function (ctx) {
  const addToIpfsHandler = addToIpfs(ctx)

  app.on('second-instance', addToIpfsHandler)
  await addToIpfsHandler(null, process.argv)
}
