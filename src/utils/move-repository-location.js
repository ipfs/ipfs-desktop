import { showDialog } from '../dialogs'
import i18n from 'i18next'
import selectDirectory from './select-directory'

export default async function () {
  const opt = showDialog({
    title: i18n.t('moveRepositoryLocation'),
    message: i18n.t('moveRepositoryLocation')
  })

  if (opt !== 0) {
    return
  }

  const dir = await selectDirectory()

  if (!dir) {
    return
  }

  console.log(dir)
}
