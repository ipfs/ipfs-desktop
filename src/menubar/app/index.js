import React from 'react'
import { render } from 'react-dom'
import registerScreenshot from './utils/screenshot'
import NavBar from './navbar/NavBar'
import { ipcRenderer } from 'electron'

class Menubar extends React.Component {
  componentWillMount () {
    ipcRenderer.on('ipfs.started', (_, id) => console.log(id))
    ipcRenderer.on('ipfs.stopped', () => console.log('IPFS stopped'))
  }

  render () {
    return (
      <div className='flex flex-column h-100'>
        <a onClick={() => ipcRenderer.send('ipfs.stop')}>Stop IPFS</a>
        <a onClick={() => ipcRenderer.send('ipfs.start')}>Start IPFS</a>
        <NavBar />
      </div>
    )
  }
}

registerScreenshot()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
