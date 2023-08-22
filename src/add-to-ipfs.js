const { extname, basename } = require('path')
const { clipboard } = require('electron')
const { globSource } = require('ipfs-http-client')
const i18n = require('i18next')
const last = require('it-last')
const fs = require('fs-extra')
const logger = require('./common/logger')
const { notify, notifyError } = require('./common/notify')
const { analyticsKeys } = require('./analytics/keys')
const getCtx = require('./context')

async function copyFileToMfs (ipfs, cid, filename) {
  let i = 0
  const ext = extname(filename)
  const base = basename(filename, ext)

  while (true) {
    const newName = (i === 0 ? base : `${base} (${i})`) + ext

    try {
      await ipfs.files.stat(`/${newName}`)
    } catch (err) {
      filename = newName
      break
    }

    i++
  }

  return ipfs.files.cp(`/ipfs/${cid.toString()}`, `/${filename}`)
}

async function getShareableCid (ipfs, files) {
  if (files.length === 1) {
    // If it's just one object, we link it directly.
    return files[0]
  }

  // Note: we don't use 'object patch' here, it was deprecated.
  // We are using MFS for creating CID of an ephemeral directory
  // because it handles HAMT-sharding of big directories automatically
  // See: https://github.com/ipfs/kubo/issues/8106
  const dirpath = `/zzzz_${Date.now()}`
  await ipfs.files.mkdir(dirpath, { cidVersion: 1 })

  for (const { cid, filename } of files) {
    await ipfs.files.cp(`/ipfs/${cid}`, `${dirpath}/${filename}`)
  }

  const stat = await ipfs.files.stat(dirpath)

  await ipfs.files.rm(dirpath, { recursive: true })

  return { cid: stat.cid, filename: '' }
}

function sendNotification (launchWebUI, hasFailures, successCount, filename) {
  let link, title, body, fn

  if (!hasFailures) {
    // All worked well!
    fn = notify

    if (successCount === 1) {
      link = `/files/${filename}`
      title = i18n.t('itemAddedNotification.title')
      body = i18n.t('itemAddedNotification.message')
    } else {
      link = '/files'
      title = i18n.t('itemsAddedNotification.title')
      body = i18n.t('itemsAddedNotification.message', { count: successCount })
    }
  } else {
    // Some/all failed!
    fn = notifyError
    title = i18n.t('itemsFailedNotification.title')
    body = i18n.t('itemsFailedNotification.message')
  }

  // @ts-expect-error
  fn({ title, body }, () => {
    // force refresh for Files screen to pick up newly added items
    // https://github.com/ipfs/ipfs-desktop/issues/1763
    launchWebUI(link, { forceRefresh: true })
  })
}

async function addFileOrDirectory (ipfs, filepath) {
  const stat = fs.statSync(filepath)
  let cid = null

  if (stat.isDirectory()) {
    const files = globSource(filepath, '**/*', { recursive: true, cidVersion: 1 })
    const res = await last(ipfs.addAll(files, {
      pin: false,
      wrapWithDirectory: true,
      cidVersion: 1
    }))
    cid = res.cid
  } else {
    const readStream = fs.createReadStream(filepath)
    const res = await ipfs.add(readStream, {
      pin: false,
      cidVersion: 1
    })
    cid = res.cid
  }

  const filename = basename(filepath)
  await copyFileToMfs(ipfs, cid, filename)
  return { cid, filename }
}

module.exports = async function (files) {
  const ctx = getCtx()
  const getIpfsd = await ctx.getProp('getIpfsd')
  const ipfsd = await getIpfsd()
  if (!ipfsd) {
    return
  }

  const successes = []
  const failures = []

  const log = logger.start('[add to ipfs] started', { withAnalytics: analyticsKeys.ADD_VIA_DESKTOP })

  await Promise.all(files.map(async file => {
    try {
      const res = await addFileOrDirectory(ipfsd.api, file)
      successes.push(res)
    } catch (e) {
      failures.push(e.toString())
    }
  }))

  if (failures.length > 0) {
    log.fail(new Error(failures.join('\n')))
  } else {
    log.end()
  }

  const { cid, filename } = await getShareableCid(ipfsd.api, successes)
  const launchWebUI = ctx.getFn('launchWebUI')
  sendNotification(launchWebUI, failures.length !== 0, successes.length, filename)

  const query = filename ? `?filename=${encodeURIComponent(filename)}` : ''
  const url = `https://dweb.link/ipfs/${cid.toString()}${query}`

  clipboard.writeText(url)

  return cid
}
