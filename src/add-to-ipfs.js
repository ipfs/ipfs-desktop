import { extname, basename } from 'path'
import { clipboard } from 'electron'
import i18n from 'i18next'
import logger from './common/logger'
import { notify, notifyError } from './common/notify'

async function copyFile (ipfs, hash, name) {
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

  return ipfs.files.cp(`/ipfs/${hash}`, `/${name}`)
}

async function makeShareableObject (ipfs, results) {
  if (results.length === 1) {
    // If it's just one object, we link it directly.
    return results[0]
  }

  let baseCID = await ipfs.object.new('unixfs-dir')

  for (const { hash, path, size } of results) {
    baseCID = (await ipfs.object.patch.addLink(baseCID, {
      name: path,
      size,
      cid: hash
    })).toString()
  }

  return { hash: baseCID, path: '' }
}

function sendNotification (failures, successes, launch, path) {
  let link, title, body, fn

  if (failures.length === 0) {
    // All worked well!
    fn = notify

    if (successes.length === 1) {
      link = `/files/${path}`
      title = i18n.t('itemAddedNotification.title')
      body = i18n.t('itemAddedNotification.message')
    } else {
      link = '/files'
      title = i18n.t('itemsAddedNotification.title')
      body = i18n.t('itemsAddedNotification.message', { count: successes.length })
    }
  } else {
    // Some/all failed!
    fn = notifyError
    title = i18n.t('itemsFailedNotification.title')
    body = i18n.t('itemsFailedNotification.message')
  }

  fn({ title, body }, () => {
    launch(link)
  })
}

export default async function ({ getIpfsd, launchWebUI }, files) {
  const ipfsd = await getIpfsd()

  if (!ipfsd) {
    return
  }

  const successes = []
  const failures = []

  const log = logger.start('[add to ipfs] started', { withAnalytics: 'ADD_VIA_DESKTOP' })

  await Promise.all(files.map(async file => {
    try {
      const results = await ipfsd.api.addFromFs(file, { recursive: true })
      const { path, hash, size } = results[results.length - 1]
      await copyFile(ipfsd.api, hash, path)
      successes.push({ path, hash, size })
    } catch (e) {
      failures.push(e)
    }
  }))

  if (failures.length > 0) {
    log.fail(new Error(failures.reduce((prev, curr) => `${prev} ${curr.toString()}`, '')))
  } else {
    log.end()
  }

  const { hash, path } = await makeShareableObject(ipfsd.api, successes)
  sendNotification(failures, successes, launchWebUI, path)

  const url = `https://ipfs.io/ipfs/${hash}`
  clipboard.writeText(url)
}
