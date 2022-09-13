// @ts-check

/**
 * This should be an enum once we migrate to typescript
 * @readonly
 * @type {import('countly-sdk-nodejs').AnalyticsKeys}
 */
const analyticsKeys = {
  ADD_VIA_DESKTOP: 'ADD_VIA_DESKTOP',
  MOVE_REPOSITORY: 'MOVE_REPOSITORY',
  SCREENSHOT_TAKEN: 'SCREENSHOT_TAKEN',
  DAEMON_START: 'DAEMON_START',
  DAEMON_STOP: 'DAEMON_STOP',
  WEB_UI_READY: 'WEB_UI_READY',
  APP_READY: 'APP_READY',
  APP_START_TO_DOM_READY: 'APP_START_TO_DOM_READY',
  FN_LAUNCH_WEB_UI: 'FN_LAUNCH_WEB_UI',
  FN_LAUNCH_WEB_UI_WITH_PATH: 'FN_LAUNCH_WEB_UI_WITH_PATH'
}

module.exports = { analyticsKeys }
