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
      // TODO: just focus our window
      return
    }

    const ifpsd = await getIpfsd()

    ifpsd.api.addFromFs(file, { recursive: true }, (err, result) => {
      if (err) {
        logger.error(err)
        return showErrorNotification("Your files couldn't be added")
      }

      const { path, hash } = result[0]

      ifpsd.api.files.cp(`/ipfs/${hash}`, `/${path}`, err => {
        if (err) {
          logger.error(err)
          return showErrorNotification("Your files couldn't be added")
        }

        const not = new Notification({
          title: '🧙‍ Added',
          body: 'Your magic file was added ' + result[0].hash
        })

        not.on('click', () => {
          launchWebUI(`/files/${path}`)
        })

        not.show()
      })
    })
  })
}
