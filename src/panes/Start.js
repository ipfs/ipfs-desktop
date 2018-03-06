import React from 'react'
import {ipcRenderer} from 'electron'

import Pane from '../components/Pane'
import Button from '../components/Button'

function startDaemon () {
  ipcRenderer.send('start-daemon')
}

function quit () {
  ipcRenderer.send('quit-application')
}

export default function Info (props) {
  return (
    <Pane className='start fixed top-0 left-0 w-100'>
      <div className='main'>
        <p>It seems your daemon is not running yet. You can either start the daemon or quit the application.</p>

        <div>
          <Button onClick={startDaemon}>Start Daemon</Button>
          <Button onClick={quit}>Quit</Button>
        </div>
      </div>
    </Pane>
  )
}
