import { showDialog } from '../dialogs'
import i18n from 'i18next'
import { app } from 'electron'

import store from './store'
import path from 'path'
import fs from 'fs-extra'
import selectDirectory from './select-directory'

export default async function ({ stopIpfs, startIpfs }) {
  /* const opt = showDialog({
    title: i18n.t('moveRepositoryLocation'),
    message: i18n.t('moveRepositoryLocation')
  })

  if (opt !== 0) {
    return
  } */

  const dir = await selectDirectory()

  if (!dir) {
    return
  }

  await stopIpfs()

  const config = store.get('ipfsConfig')

  const currDir = config.path
  const currName = path.basename(currDir)
  const newDir = path.join(dir, currName)

  await fs.move(currDir, newDir)

  config.path = newDir
  store.set('ipfsConfig', config)

  await startIpfs()
  console.log(dir)
}
