import React from 'react'
import { ipcRenderer } from 'electron'
import Button from '../components/button/Button'
import Summary from './summary/Summary'

const Home = ({ running, summary }) => (
  <div>
    { running ? (
      <div className='pa2'>
        <Summary {...summary} />

        <div className='mt3'>
          <Button onClick={() => ipcRenderer.send('launchWebUI')} className='f6 w-100'>Open Web UI</Button>
        </div>
      </div>
    ) : (
      <div className='pa2'>
        <p>IPFS not running</p>
      </div>
    )}
  </div>
)

export default Home
