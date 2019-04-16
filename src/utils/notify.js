import { app, shell, Notification } from 'electron'
import i18n from 'i18next'

export function notify (options, onClick) {
  const not = new Notification(options)

  if (onClick) {
    not.on('click', onClick)
  }

  not.show()
}

export function notifyError ({ title, body = '' }) {
  notify({
    title,
    body: `${body} ${i18n.t('clickToOpenLogs')}`.trim()
  }, () => {
    shell.openItem(app.getPath('userData'))
  })
}
