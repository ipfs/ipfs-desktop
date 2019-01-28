import { app, shell, Notification } from 'electron'
import logo from './logo'
import i18n from './i18n'

export function notify (options, onClick) {
  if (!options.icon) {
    options.icon = logo('ice')
  }

  const not = new Notification(options)

  if (onClick) {
    not.on('click', onClick)
  }

  not.show()
}

export function notifyError ({ title, body = '' }) {
  notify({
    title,
    body: `${body} ${i18n.t('clickToOpenLogs')}`.trim(),
    icon: logo('black')
  }, () => {
    shell.openItem(app.getPath('userData'))
  })
}
