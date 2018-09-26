import React from 'react'
import { render } from 'react-dom'

import { ipcRenderer } from 'electron'

class Menubar extends React.Component {
  launchWebUI () {
    ipcRenderer.send('launch-webui')
  }

  render () {
    return (
      <div>
        <h1>IPFS Desktop</h1>

        <a onClick={this.launchWebUI}>Launch WebUI</a>
      </div>
    )
  }
}

// TODO: register screenshot hook

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
