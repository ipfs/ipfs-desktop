import React from 'react'
import { render } from 'react-dom'
import registerScreenshot from './utils/screenshot'
import { ipcRenderer } from 'electron'

import NavBar from './navbar/NavBar'
import Header from './header/Header'
import Summary from './summary/Summary'

class Menubar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
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
    const { running, summary } = this.state

    return (
      <div className='flex flex-column h-100 sans-serif'>
        <Header toggleIpfs={this.toggleIpfs} on={running} />

        { running ? (
          <div>
            <Summary {...summary} />
            <NavBar />
          </div>
        ) : (
          <div className='pa2'>
            <p>IPFS not running</p>
          </div>
        )}
      </div>
    )
  }
}

registerScreenshot()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
