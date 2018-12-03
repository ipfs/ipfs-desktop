import IPFSFactory from 'ipfsd-ctl'
import logger from './logger'
import { join } from 'path'
import { spawnSync } from 'child_process'
import { dialog } from 'electron'

import findExecutable from 'ipfsd-ctl/src/utils/find-ipfs-executable'

async function createDaemon (opts) {
  opts.type = opts.type || 'go'
  opts.path = opts.path || ''
  opts.flags = opts.flags || ['--migrate=true', '--routing=dhtclient']
  opts.keysize = opts.keysize || 4096

  if (opts.type !== 'go') {
    throw new Error(`${opts.type} connection is not supported yet`)
  }

  const factory = IPFSFactory.create({ type: opts.type })

  const ipfsd = await new Promise((resolve, reject) => {
    factory.spawn({
      disposable: false,
      defaultAddrs: true,
      repoPath: opts.path
    }, (e, ipfsd) => {
      if (e) return reject(e)
      if (ipfsd.initialized) {
        return resolve(ipfsd)
      }

      ipfsd.init({
        directory: opts.path,
        keysize: opts.keysize
      }, e => {
        if (e) return reject(e)
        resolve(ipfsd)
      })
    })
  })

  if (!ipfsd.started) {
    await new Promise((resolve, reject) => {
      ipfsd.start(opts.flags, err => {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
  }

  let origins = []
  try {
    origins = await ipfsd.api.config.get('API.HTTPHeaders.Access-Control-Allow-Origin')
  } catch (e) {
    logger.warn(e)
  }

  if (!origins.includes('webui://-')) origins.push('webui://-')
  if (!origins.includes('https://webui.ipfs.io')) origins.push('https://webui.ipfs.io')

  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Origin', origins)
  await ipfsd.api.config.set('API.HTTPHeaders.Access-Control-Allow-Methods', ['PUT', 'GET', 'POST'])

  return ipfsd
}

async function cleanup (opts) {
  const option = dialog.showMessageBox({
    type: 'warning',
    title: 'IPFS Desktop',
    message: `We coudln't start because IPFS didn't shutdown correctly last time. We can try to
solve the issue by running 'ipfs repo fsck'. Would you like to?`,
    buttons: [
      'No',
      'Yes, run "ipfs repo fsck"'
    ],
    cancelId: 0
  })

  if (option === 0) {
    return false
  }

  const exec = findExecutable('go', join(__dirname, '..'))
  spawnSync(exec, ['repo', 'fsck'], {
    env: {
      ...process.env,
      IPFS_PATH: opts.path
    }
  })

  return true
}

export default async function (opts) {
  try {
    const ipfsd = await createDaemon(opts)
    return ipfsd
  } catch (e) {
    if (!e.message.includes('ECONNREFUSED')) {
      throw e
    }

    if (await cleanup(opts)) {
      throw new Error('restart')
    } else {
      throw e
    }
  }
}
