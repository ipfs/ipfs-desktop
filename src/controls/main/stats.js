import StatsPoller from 'ipfs-stats'
import {ipcMain} from 'electron'
import cloneDeep from 'lodash.clonedeep'

let poller
let polling = []

function requestStats (event, stats) {
  if (!poller) {
    // Save what to poll next.
    polling = stats
    return
  }

  if (stats === polling) {
    // Already polling this stats.
    return
  }

  if (stats.length === 0) {
    // No stats to poll. Let's stop.
    polling = []
    poller.stop()
    return
  }

  // If currently polling something, let's stop it.
  if (polling.length !== 0) {
    poller.stop(polling)
  }

  // Poll the needed stats.
  polling = stats
  poller.start(polling)
}

function menubarShow () {
  if (!poller) return

  if (polling.length !== 0) {
    poller.start(polling)
  }
}

function menubarHide () {
  if (!poller) return
  poller.stop()
}

function onChange (opts) {
  return (raw) => {
    let stats = cloneDeep(raw)

    // Electron passes information from the main <--> renderer process
    // through JSON so the Big.js object would lose all of its functions.
    // We convert those 'big' numbers to the Number object. Let's pray they
    // are not that big.
    if (stats.repo) {
      stats.repo.numObjects = Number(stats.repo.numObjects.toFixed(2))
      stats.repo.repoSize = Number(stats.repo.repoSize.toFixed(2))
      stats.repo.storageMax = Number(stats.repo.storageMax.toFixed(2))
    }

    if (stats.bw) {
      stats.bw.rateIn = Number(stats.bw.rateIn.toFixed(2))
      stats.bw.rateOut = Number(stats.bw.rateOut.toFixed(2))
      stats.bw.totalIn = Number(stats.bw.totalIn.toFixed(2))
      stats.bw.totalOut = Number(stats.bw.totalOut.toFixed(2))
    }

    opts.send('stats', stats)
  }
}

export default function (opts) {
  const {debug, events, menubar, ipfs} = opts

  ipcMain.on('request-stats', requestStats)

  events.on('node:started', () => {
    debug('Configuring Stats Poller')

    poller = new StatsPoller(ipfs(), {
      all: 3 * 1000,
      peers: 5 * 1000,
      repo: 30 * 60 * 1000
    })

    if (menubar.window && menubar.window.isVisible() && polling.length !== 0) {
      poller.start(polling)
    }

    poller.on('change', onChange(opts))
    menubar.on('show', menubarShow)
    menubar.on('hide', menubarHide)
  })

  events.on('node:stopped', () => {
    debug('Removing Stats Poller')

    if (poller) {
      poller.stop()
      poller = null
    }

    if (menubar) {
      menubar.removeListener('show', menubarShow)
      menubar.removeListener('hide', menubarHide)
    }
  })
}
