/**
 * Configuration key constants for the features in IPFS Desktop.
 * @constant
 * @type {Record<import('../types').CONFIG_KEYS, string>}
 */
const CONFIG_KEYS = {
  AUTO_LAUNCH: 'autoLaunch',
  AUTO_GARBAGE_COLLECTOR: 'automaticGC',
  DISABLE_AUTO_UPDATE: 'disableAutoUpdate',
  SCREENSHOT_SHORTCUT: 'screenshotShortcut',
  OPEN_WEBUI_LAUNCH: 'openWebUIAtLaunch',
  MONOCHROME_TRAY_ICON: 'monochromeTrayIcon',
  EXPERIMENT_PUBSUB: 'experiments.pubsub',
  EXPERIMENT_PUBSUB_NAMESYS: 'experiments.pubsubNamesys'
}

module.exports = CONFIG_KEYS
