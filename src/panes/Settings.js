import React from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/Pane'
import Header from '../components/Header'
import InfoBlock from '../components/InfoBlock'
import CheckboxBlock from '../components/CheckboxBlock'
import KeyCombo from '../components/KeyCombo'

function generateOnChange (key) {
  return (value) => {
    ipcRenderer.send('update-setting', key, value)
  }
}

function garbageCollector () {
  ipcRenderer.send('run-gc')
}

function cleanConnSettings () {
  ipcRenderer.send('clean-ipfs-settings')
}

function quit () {
  ipcRenderer.send('quit-application')
}

const options = [
  {
    title: 'Launch on startup',
    setting: 'autoLaunch'
  },
  {
    title: 'Auto add screenshots',
    setting: 'screenshotShortcut',
    description: (
      <span>
        Enable <KeyCombo keys={['CTRL/CMD', 'ALT', 'S']} /> to take screenshots and add them to the repository.
      </span>
    )
  },
  {
    title: 'Download copied hash',
    setting: 'downloadHashShortcut',
    description: (
      <span>
        Enable <KeyCombo keys={['CTRL/CMD', 'ALT', 'D']} /> to download the last copied hash.
      </span>
    )
  },
  {
    title: 'DHT client profile',
    setting: 'dhtClient',
    description: (
      <span>
        Make your IPFS node act as a DHT client and not a DHT server, consuming less network and battery.
        Restarting your node is required.
      </span>
    )
  },
  {
    title: 'Light theme',
    setting: 'lightTheme'
  }
]

export default function Settings (props) {
  const opts = []

  options.forEach((option) => {
    opts.push((
      <CheckboxBlock
        title={option.title}
        key={option.setting}
        info={option.description}
        onChange={generateOnChange(option.setting)}
        value={props.settings[option.setting]} />
    ))
  })

  return (
    <Pane>
      <Header title='Settings' />

      <div className='main'>
        {opts}

        <InfoBlock
          title='Run garbage collector'
          info='Delete all unpinned files to free up disk space.'
          button={false}
          onClick={garbageCollector} />

        <InfoBlock
          title='Clean connection settings'
          info='Clean connection settings and shutdown IPFS Desktop. Then you can select a different node to connect.'
          button={false}
          onClick={cleanConnSettings} />

        <InfoBlock
          title='Quit'
          button={false}
          onClick={quit}
          info='Click to quit the application.' />
      </div>
    </Pane>
  )
}

Settings.propTypes = {
  settings: PropTypes.object
}

Settings.defaultProps = {
  settings: {
    autoLaunch: false,
    screenshotShortcut: false,
    downloadHashShortcut: false
  }
}
