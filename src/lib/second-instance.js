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

export default function ({ getIpfsd, launchWebUI }) {
  app.on('second-instance', async (_, argv) => {
    const file = getFile(argv)
    if (file === '') {
      return launchWebUI('/')
    }

    const ifpsd = await getIpfsd()

    ifpsd.api.addFromFs(file, { recursive: true }, (err, result) => {
      if (err) {
        logger.error(err)
        return showErrorNotification("Your files couldn't be added")
      }

      console.log(result)

      const { path, hash } = result[result.length - 1]

      ifpsd.api.files.cp(`/ipfs/${hash}`, `/${path}`, err => {
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
  })
}
