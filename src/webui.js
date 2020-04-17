const logger = require('./common/logger')
const { shell } = require('electron')

module.exports = async function (ctx) {
  ctx.launchWebUI = (url) => {
    if (!url) {
      logger.info('[web ui] launching web ui')
    } else {
      logger.info(`[web ui] navigate to ${url}`)
    }

    // TODO: correct api port
    // TODO: use hash directly so we can make sure we open the correct url
    shell.openExternal(`http://localhost:5001/webui/${url}`)
  }
}
