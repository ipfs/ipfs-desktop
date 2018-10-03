import React from 'react'
import { render } from 'react-dom'
import registerScreenshot from './utils/screenshot'
import { ipcRenderer } from 'electron'

import Header from './header/Header'
import Home from './home/Home'
import Config from './config/Config'

const PAGE_HOME = 'home'
const PAGE_SETTINGS = 'prefs'

// TODO: get real info
// TODO: show errors
// TODO: home icon is ugh
// TODO: config page

class Menubar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      page: PAGE_HOME,
      running: false,
      runningId: null,
      summary: {
        gateway: 'http://127.0.0.1:8080',
        api: 'http://127.0.0.1:5001',
        version: 'go-ipfs v0.4.17',
        peers: 452
      }
    }

    this.toggleIpfs = this.toggleIpfs.bind(this)
  }

  componentDidMount () {
    ipcRenderer.on('ipfs.started', (_, id) => {
      this.setState({ running: true, runningId: id })
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
    const { running, page, summary } = this.state

    return (
      <div className='flex flex-column h-100 sans-serif'>
        <Header
          openSettings={() => { this.setState({ page: PAGE_SETTINGS }) }}
          openHome={() => { this.setState({ page: PAGE_HOME }) }}
          toggleIpfs={this.toggleIpfs}
          ipfsType={'js'}
          showHome={page === PAGE_SETTINGS}
          heartbeat={page === PAGE_HOME}
          ipfsOnline={running} />

        { page === PAGE_HOME && <Home running={running} summary={summary} /> }
        { page === PAGE_SETTINGS && <Config /> }
      </div>
    )
  }
}

registerScreenshot()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
