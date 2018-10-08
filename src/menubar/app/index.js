import React from 'react'
import { render } from 'react-dom'
import registerScreenshot from './utils/screenshot'
import { ipcRenderer } from 'electron'

import Header from './header/Header'
import Home from './home/Home'
import Settings from './settings/Settings'

const PAGE_HOME = 'home'
const PAGE_SETTINGS = 'settings'

// TODO: show errors
// TODO: home icon is ugh https://github.com/ipfs-shipyard/ipfs-css/pull/28
// TODO: choose conn when disconnected
// TODO: add loading/thinkking state

class Menubar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      page: PAGE_HOME,
      current: null,
      prev: null,
      peers: 0,
      settings: null
    }

    this.toggleIpfs = this.toggleIpfs.bind(this)
  }

  get summary () {
    return {
      ...this.state.addresses,
      agentVersion: this.state.agentVersion,
      peers: this.state.peers
    }
  }

  componentDidMount () {
    ipcRenderer.on('ipfs.started', (_, id, info) => {
      this.setState({
        current: id,
        addresses: {
          gateway: info.gatewayAddress,
          api: info.apiAddress
        },
        agentVersion: info.agentVersion
      })
    })

    ipcRenderer.on('ipfs.stopped', () => {
      this.setState(s => ({
        prev: s.current,
        current: null
      }))
    })

    ipcRenderer.on('config.changed', (_, config) => this.setState({ settings: config }))
    ipcRenderer.on('peersCount', (_, count) => this.setState({ peers: count }))

    ipcRenderer.send('ipfs.running')
    ipcRenderer.send('config.get')
  }

  toggleIpfs () {
    if (this.state.current) {
      ipcRenderer.send('ipfs.stop')
    } else {
      ipcRenderer.send('ipfs.start')
    }
  }

  render () {
    const { current, page, settings, agentVersion } = this.state

    return (
      <div className='flex flex-column h-100 overflow-hidden sans-serif'>
        <Header
          openSettings={() => { this.setState({ page: PAGE_SETTINGS }) }}
          openHome={() => { this.setState({ page: PAGE_HOME }) }}
          toggleIpfs={this.toggleIpfs}
          ipfsType={agentVersion && agentVersion.includes('js') ? 'js' : 'go'}
          showHome={page === PAGE_SETTINGS}
          heartbeat={page === PAGE_HOME}
          ipfsOnline={!!current} />

        <div className='overflow-auto'>
          { page === PAGE_HOME && <Home running={!!current} summary={this.summary} configs={settings ? settings.configs : {}} /> }
          { page === PAGE_SETTINGS && <Settings runningId={current} {...settings} /> }
        </div>
      </div>
    )
  }
}

registerScreenshot()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
