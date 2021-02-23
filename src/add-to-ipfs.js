const { extname, basename } = require('path')
const { clipboard } = require('electron')
const i18n = require('i18next')
const logger = require('./common/logger')
const { notify, notifyError } = require('./common/notify')
const { globSource } = require('ipfs-http-client')

async function copyFile (ipfs, cid, name) {
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

  return ipfs.files.cp(`/ipfs/${cid.toString()}`, `/${name}`)
}

async function makeShareableObject (ipfs, results) {
  if (results.length === 1) {
    // If it's just one object, we link it directly.
    return results[0]
  }

  let baseCID = await ipfs.object.new({ template: 'unixfs-dir' })

  for (const { cid, path, size } of results) {
    baseCID = (await ipfs.object.patch.addLink(baseCID, {
      name: path,
      size,
      cid
    }))
  }

  return { cid: baseCID, path: '' }
}

function sendNotification (failures, successes, launchWebUI, path) {
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
    launchWebUI(link, { forceRefresh: true })
  })
}

module.exports = async function ({ getIpfsd, launchWebUI }, files) {
  const ipfsd = await getIpfsd()

  if (!ipfsd) {
    return
  }

  const successes = []
  const failures = []

  const log = logger.start('[add to ipfs] started', { withAnalytics: 'ADD_VIA_DESKTOP' })

  await Promise.all(files.map(async file => {
    try {
      const result = await ipfsd.api.add(globSource(file, { recursive: true }))
      await copyFile(ipfsd.api, result.cid, result.path)
      successes.push(result)
    } catch (e) {
      failures.push(e)
    }
  }))

  if (failures.length > 0) {
    log.fail(new Error(failures.reduce((prev, curr) => `${prev} ${curr.toString()}`, '')))
  } else {
    log.end()
  }

  const { cid, path } = await makeShareableObject(ipfsd.api, successes)
  sendNotification(failures, successes, launchWebUI, path)
  const filename = path ? `?filename=${encodeURIComponent(path.split('/').pop())}` : ''
  const url = `https://dweb.link/ipfs/${cid.toString()}${filename}`
  clipboard.writeText(url)
}
