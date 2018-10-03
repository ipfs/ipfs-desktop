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
// TODO: home icon is ugh
// TODO: config page
// TODO: button to exit IPFS Desktop

class Menubar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      page: PAGE_HOME,
      running: false,
      runningId: null,
      peers: 0
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
        running: true,
        runningId: id,
        addresses: {
          gateway: info.gatewayAddress,
          api: info.apiAddress
        },
        agentVersion: info.agentVersion
      })
    })

    ipcRenderer.on('ipfs.stopped', () => this.setState({ running: false }))
    ipcRenderer.on('config.changed', (_, config) => this.setState({ settings: config }))
    ipcRenderer.on('peersCount', (_, count) => this.setState({ peers: count }))

    ipcRenderer.send('ipfs.running')
    ipcRenderer.send('config.get')
  }

  toggleIpfs () {
    if (this.state.running) {
      ipcRenderer.send('ipfs.stop')
    } else {
      ipcRenderer.send('ipfs.start')
    }
  }

  render () {
    const { running, page, settings, agentVersion } = this.state

    return (
      <div className='flex flex-column h-100 sans-serif'>
        <Header
          openSettings={() => { this.setState({ page: PAGE_SETTINGS }) }}
          openHome={() => { this.setState({ page: PAGE_HOME }) }}
          toggleIpfs={this.toggleIpfs}
          ipfsType={agentVersion && agentVersion.includes('js') ? 'js' : 'go'}
          showHome={page === PAGE_SETTINGS}
          heartbeat={page === PAGE_HOME}
          ipfsOnline={running} />

        { page === PAGE_HOME && <Home running={running} summary={this.summary} /> }
        { page === PAGE_SETTINGS && <Settings {...settings} /> }
      </div>
    )
  }
}

registerScreenshot()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
