import React from 'react'
import { ipcRenderer } from 'electron'
import Button from '../components/button/Button'
import Summary from './summary/Summary'

export default class Home extends React.Component {
  render () {
    const { running, summary, configs } = this.props

    return (
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
            { Object.keys(configs).length ? (
              <p>IPFS not running</p>
            ) : (
              <div className='tc f6 mt5'>
                You haven't set up any configuration yet. Head down to <span className='b'>Settings</span> → <span className='b'>Connections</span>.
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}
