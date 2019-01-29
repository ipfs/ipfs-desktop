import { app } from 'electron'
import { extname, basename } from 'path'
import { logger, i18n, notify, notifyError } from '../utils'

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

  await ipfs.files.cp(`/ipfs/${hash}`, `/${name}`)

  notify({
    title: folder ? i18n.t('folderAdded') : i18n.t('fileAdded'),
    body: i18n.t(`${folder ? 'folder' : 'file'}AddedToIpfsTapToView`, { name })
  }, () => {
    launch(`/files/${name}`)
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

    notify({
      title: i18n.t('ipfsNotRunning'),
      body: i18n.t('desktopIsStartedButDaemonOffline')
    })

    return
  }

  logger.info(`Adding ${file}: started`)
  ipfsd.api.addFromFs(file, { recursive: true }, async (err, result) => {
    if (err) {
      logger.error(err)
      return notifyError({
        title: i18n.t('yourFilesCouldntBeAdded')
      })
    }

    const { path, hash } = result[result.length - 1]
    try {
      await copyFile(launchWebUI, ipfsd.api, hash, path, result.length > 1)
      logger.info(`Adding ${file}: completed`)
    } catch (err) {
      logger.error(err)
      notifyError({
        title: i18n.t('yourFilesCouldntBeAdded')
      })
    }
  })
}

export default async function (ctx) {
  const addToIpfsHandler = addToIpfs(ctx)

  app.on('second-instance', addToIpfsHandler)
  await addToIpfsHandler(null, process.argv)
}
