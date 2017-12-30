import {EventEmitter} from 'events'
import {lookupPretty} from 'ipfs-geoip'

/**
 * It's a Stats Poller.
 * @extends EventEmitter
 */
export default class StatsPoller extends EventEmitter {
  /**
   * Stats Poller constructor.
   * @param {IpfsApi} ipfs
   * @param {winston.Logger} logger
   */
  constructor (ipfs, logger) {
    super()
    this.ipfs = ipfs
    this.logger = logger
    this.shouldPoll = false
    this.statsCache = {}
    this.locationsCache = {}
  }

  _poller () {
    if (!this.shouldPoll) {
      return
    }

    Promise.all([
      this.ipfs.id(),
      this.ipfs.swarm.peers(),
      this.ipfs.stats.bw(),
      this.ipfs.repo.stat()
    ]).then(([id, peers, bw, repo]) => {
      this.statsCache.bw = bw
      this.statsCache.repo = repo
      this._handleId(id)
      this._handlePeers(peers)

      this.emit('change', this.statsCache)

      setTimeout(() => {
        this._poller()
      }, 1000)
    }).catch(e => { this.logger.error(e.stack) })
  }

  _handlePeers (raw) {
    const peers = []
    raw = raw.sort((a, b) => a.peer.toB58String() > b.peer.toB58String())

    raw.forEach((rawPeer) => {
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
  }

  _handleId (raw) {
    this.statsCache.node = raw
    this.statsCache.node.location = 'Unknown'

    lookupPretty(this.ipfs, raw.addresses, (err, location) => {
      if (err) { return }

      this.statsCache.node.location = location && location.formatted
      this.emit('change', this.statsCache)
    })
  }

  /**
   * Stops the poller.
   * @return {Void}
   */
  stop () {
    this.shouldPoll = false
  }

  /**
   * Starts the poller.
   * @return {Void}
   */
  start () {
    this.shouldPoll = true
    this._poller()
  }
}
