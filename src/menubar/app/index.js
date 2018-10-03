import React from 'react'
import { render } from 'react-dom'
import registerScreenshot from './utils/screenshot'
import { ipcRenderer } from 'electron'

import Header from './header/Header'
import Home from './home/Home'
import Settings from './settings/Settings'

const PAGE_HOME = 'home'
const PAGE_SETTINGS = 'settings'

// TODO: get peers
// TODO: show errors
// TODO: home icon is ugh
// TODO: config page

class Menubar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      page: PAGE_HOME,
      running: false,
      runningId: null
    }

    this.toggleIpfs = this.toggleIpfs.bind(this)
  }

  get summary () {
    return {
      ...this.state.addresses,
      version: this.state.version,
      peers: 0
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
        version: info.agentVersion.split('/').join(' ')
      })
    })
    ipcRenderer.on('ipfs.stopped', (_) => {
      this.setState({ running: false })
    })

    ipcRenderer.send('ipfs.running')
  }

  toggleIpfs () {
    if (this.state.running) {
      ipcRenderer.send('ipfs.stop')
    } else {
      ipcRenderer.send('ipfs.start')
    }
  }

  render () {
    const { running, page, version } = this.state

    return (
      <div className='flex flex-column h-100 sans-serif'>
        <Header
          openSettings={() => { this.setState({ page: PAGE_SETTINGS }) }}
          openHome={() => { this.setState({ page: PAGE_HOME }) }}
          toggleIpfs={this.toggleIpfs}
          ipfsType={version && version.includes('js') ? 'js' : 'go'}
          showHome={page === PAGE_SETTINGS}
          heartbeat={page === PAGE_HOME}
          ipfsOnline={running} />

        { page === PAGE_HOME && <Home running={running} summary={this.summary} /> }
        { page === PAGE_SETTINGS && <Settings /> }
      </div>
    )
  }
}

registerScreenshot()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
