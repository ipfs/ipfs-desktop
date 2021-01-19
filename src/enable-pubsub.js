const createToggler = require('./utils/create-toggler')
const logger = require('./common/logger')
const store = require('./common/store')

const CONFIG_KEY = 'pubsub'

function enable () {
  var flags = store.get('ipfsConfig.flags', [])
  flags.push('--enable-pubsub-experiment')
  store.set('ipfsConfig.flags', flags)
}

function disable () {
  var flags = store.get('ipfsConfig.flags', [])
  store.set('ipfsConfig.flags', flags.filter(item => item !== '--enable-pubsub-experiment'))
}

module.exports = async function () {
  const activate = ({ newValue, oldValue }) => {
    if (newValue === oldValue) return

    try {
      if (newValue === true) {
        enable()
        logger.info('[pubsub] enabled')
      } else {
        disable()
        logger.info('[pubsub] disabled')
      }

      return true
    } catch (err) {
      logger.error(`[pubsub] ${err.toString()}`)

      return false
    }
  }

  activate({ newValue: store.get(CONFIG_KEY, false) })
  createToggler(CONFIG_KEY, activate)
}

module.exports.CONFIG_KEY = CONFIG_KEY
