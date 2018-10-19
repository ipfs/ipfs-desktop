import React from 'react'
import { connect } from 'redux-bundler-react'
import Button from '../components/button/Button'
import Summary from './Summary'

const Running = connect(
  'selectCurrentConfig',
  'doOpenWebUI',
  ({ currentConfig: { addresses, id, peers }, doOpenWebUI }) => (
    <div className='pa2'>
      <Summary {...addresses} {...id} peers={peers} />

      <div className='mt3'>
        <Button onClick={doOpenWebUI} className='f6 w-100'>Open Web UI</Button>
      </div>
    </div>
  )
)

const NotRunningNoConfig = connect(
  'doUpdateHash',
  ({ doUpdateHash }) => (
    <div className='pa3 tc f6'>
      You haven't set up any configuration yet. <span onClick={() => doUpdateHash('/settings/backends/new')} className='link blue pointer'>Set up one now!</span>
    </div>
  )
)

const NotRunningSingle = connect(
  'doUpdateHash',
  ({ doUpdateHash }) => (
    <div className='pa3 tc f6'>
      Want to add more configurations? <span onClick={() => doUpdateHash('/settings/backends/new')} className='link blue pointer'>Go ahead!</span>
    </div>
  )
)

const NotRunningMultiple = () => (
  <div>
    Multiple configs, pick the one you want.
  </div>
)

const Home = ({ ipfsIsRunning, settings }) => {
  const configsLength = Object.keys(settings.configs || {}).length
  let Element

  if (ipfsIsRunning) {
    Element = Running
  } else if (configsLength === 0) {
    Element = NotRunningNoConfig
  } else if (configsLength === 1) {
    Element = NotRunningSingle
  } else {
    Element = NotRunningMultiple
  }

  return <Element />
}

export default connect(
  'selectIpfsIsRunning',
  'selectSettings',
  Home
)
