import { extname, basename } from 'path'
import i18n from 'i18next'
import logger from './common/logger'
import { notify, notifyError } from './common/notify'

async function copyFile (launch, ipfs, hash, name, folder = false) {
  let i = 0
  const ext = extname(name)
  const base = basename(name, ext)

  while (true) {
    const newName = (i === 0 ? base : `${base} (${i})`) + ext

    try {
      await ipfs.files.stat(`/${newName}`)
    } catch (err) {
      name = newName
      break
    }

    i++
  }

  await ipfs.files.cp(`/ipfs/${hash}`, `/${name}`)

  notify({
    title: folder ? i18n.t('folderAdded') : i18n.t('fileAdded'),
    body: i18n.t(`${folder ? 'folder' : 'file'}AddedToIpfsClickToView`, { name })
  }, () => {
    launch(`/files/${name}`)
  })
}

export default async function ({ getIpfsd, launchWebUI }, file) {
  const ipfsd = await getIpfsd()

  if (!ipfsd) {
    return
  }

  logger.info(`[add to ipfs] started ${file}`, { withAnalytics: 'ADD_VIA_DESKTOP' })
  ipfsd.api.addFromFs(file, { recursive: true }, async (err, result) => {
    if (err) {
      logger.error(`[add to ipfs] ${err.toString()}`)
      return notifyError({
        title: i18n.t('yourFilesCouldntBeAdded')
      })
    }

    const { path, hash } = result[result.length - 1]
    try {
      await copyFile(launchWebUI, ipfsd.api, hash, path, result.length > 1)
      logger.info(`[add to ipfs] completed ${file}`)
    } catch (err) {
      logger.error(`[add to ipfs] ${err.toString()}`)
      notifyError({
        title: i18n.t('yourFilesCouldntBeAdded')
      })
    }
  })
}
