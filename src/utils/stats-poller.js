import {EventEmitter} from 'events'
import {lookupPretty} from 'ipfs-geoip'

export default class StatsPoller extends EventEmitter {
  constructor (ipfs, logger) {
    super()
    this.ipfs = ipfs
    this.logger = logger
    this.shouldPoll = false
    this.statsCache = {}
    this.locationsCache = {}

    this._poller()
  }

  _poller () {
    const next = () => setTimeout(() => this._poller(), 1000)

    if (!this.shouldPoll) {
      return next()
    }

    this.ipfs.swarm.peers()
      .then((res) => {
        res = res.sort((a, b) => a.peer.toB58String() > b.peer.toB58String())

        let peers = []

        res.forEach((rawPeer) => {
          let peer = {
            id: rawPeer.peer.toB58String(),
            addr: rawPeer.addr.toString(),
            location: {
              formatted: 'Unknown'
            }
          }

          if (!this.locationsCache[peer.id]) {
            lookupPretty(this.ipfs, [peer.addr], (err, result) => {
              if (err) { return }
              this.locationsCache[peer.id] = result
            })
          } else {
            peer.location = this.locationsCache[peer.id]
          }

          peers.push(peer)
        })

        this.statsCache.peers = peers
        this.emit('change', this.statsCache)
      }, this.logger.error)
      .then(next)

    this.ipfs.id()
      .then((peer) => {
        this.statsCache.node = peer
        this.statsCache.node.location = 'Unknown'

        lookupPretty(this.ipfs, peer.addresses, (err, location) => {
          if (err) { return }

          this.statsCache.node.location = location && location.formatted
          this.emit('change', this.statsCache)
        })
      })
      .catch(this.logger.error)

    this.ipfs.stats.bw()
      .then(stats => {
        this.statsCache.bw = stats
        this.emit('change', this.statsCache)
      })
      .catch(this.logger.error)

    this.ipfs.repo.stat()
      .then(repo => {
        this.statsCache.repo = repo
        this.emit('change', this.statsCache)
      })
      .catch(this.logger.error)
  }

  stop () {
    this.shouldPoll = false
  }

  start () {
    this.shouldPoll = true
  }
}
