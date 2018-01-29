import StatsPoller from 'ipfs-stats'

let poller

const stopPolling = () => {
  if (poller) poller.stop()
}

const startPolling = () => {
  if (poller) poller.start()
}

const onPollerChange = (opts) => (stats) => {
  opts.send('stats', stats)
}

export default function (opts) {
  const {debug, events, menubar, ipfs} = opts

  events.on('node:started', () => {
    debug('Configuring Stats Poller')

    poller = new StatsPoller(ipfs(), 1000)

    if (menubar.window && menubar.window.isVisible()) {
      poller.start()
    }

    poller.on('change', onPollerChange(opts))
    menubar.on('show', startPolling)
    menubar.on('hide', stopPolling)
  })

  events.on('node:stopped', () => {
    debug('Removing Stats Poller')

    if (poller) {
      poller.stop()
      poller = null
    }

    if (menubar) {
      menubar.removeListener('show', startPolling)
      menubar.removeListener('hide', stopPolling)
    }
  })
}
