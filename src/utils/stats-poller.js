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
   * @param {Debugger} debug
   */
  constructor (ipfs, debug) {
    super()
    this.ipfs = ipfs
    this.debug = debug
    this.shouldPoll = false
    this.statsCache = {}
    this.locationsCache = {}
  }

  _error (error) {
    this.debug(error.stack)
  }

  /**
   * Poll stats which do not require an Internet
   * connection to work.
   * @return {Void}
   */
  _pollOfflineStats () {
    if (!this.shouldPoll) {
      return
    }

    Promise.all([
      this.ipfs.id(),
      this.ipfs.stats.bw(),
      this.ipfs.repo.stat()
    ]).then(([id, bw, repo]) => {
      this._handleId(id)
      this.statsCache.bw = bw
      this.statsCache.repo = repo
      this.emit('change', this.statsCache)

      setTimeout(() => {
        this._pollOfflineStats()
      }, 1000)
    }).catch(this._error.bind(this))
  }

  /**
   * Poll stats which require an Internet connection
   * to work.
   * @return {Void}
   */
  _pollOnlineStats () {
    if (!this.shouldPoll) {
      return
    }

    this.ipfs.swarm.peers()
      .then((peers) => {
        this._handlePeers(peers)
        setTimeout(() => {
          this._pollOnlineStats()
        }, 1000)
      })
      .catch(this._error.bind(this))
  }

  _poller () {
    this._pollOfflineStats()
    this._pollOnlineStats()
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
