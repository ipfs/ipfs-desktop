import React from 'react'
import { ipcRenderer } from 'electron'
import Button from '../components/button/Button'
import Summary from './summary/Summary'

const Running = ({ summary }) => (
  <div className='pa2'>
    <Summary {...summary} />

    <div className='mt3'>
      <Button onClick={() => ipcRenderer.send('launchWebUI')} className='f6 w-100'>Open Web UI</Button>
    </div>
  </div>
)

const NotRunningNoConfig = () => (
  <div className='tc f6 mt5'>
    You haven't set up any configuration yet. Head down to <span className='b'>Settings</span> → <span className='b'>Connections</span>.
  </div>
)

const NotRunningSingle = () => (
  <div>
    Only one config, just run.
  </div>
)

const NotRunningMultiple = () => (
  <div>
    Multiple configs, pick the one you want.
  </div>
)

const Home = (props) => {
  const { running, configs } = props
  const configsLength = Object.keys(configs).length
  let Element

  if (running) {
    Element = Running
  } else if (configsLength === 0) {
    Element = NotRunningNoConfig
  } else if (configsLength === 1) {
    Element = NotRunningSingle
  } else {
    Element = NotRunningMultiple
  }

  return <Element {...props} />
}

export default Home
