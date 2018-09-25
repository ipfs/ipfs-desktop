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
    <Pane className='start'>
      <div className='main'>
        <p>It seems your daemon is not running yet. You can either start the daemon or quit the application.</p>

        <div>
          <Button text='Start Daemon' onClick={startDaemon} />
          <Button text='Quit' onClick={quit} />
        </div>
      </div>
    </Pane>
  )
}
