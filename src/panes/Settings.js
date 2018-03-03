import React from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/Pane'
import Header from '../components/Header'
import {KeyCombo} from '../components/Key'

function generateOnChange (key) {
  return (value) => {
    ipcRenderer.send('update-setting', key, value)
  }
}

function quit () {
  ipcRenderer.send('quit-application')
}

function openNodeSettings () {
  ipcRenderer.send('open-node-settings')
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
  }
]

// TODO: show the checkbox
function Checkbox (props) {
  const _onClick = () => {
    props.onChange(!props.value)
  }

  return (
    <div className={`pointer ph3 pv2 charcoal ${props.coloured ? 'bg-snow-muted' : ''}`} onClick={_onClick}>
      <p className='f6 b mt0 mb1'>{props.title}</p>
      <p className='f6 ma0'>{props.description}</p>
    </div>
  )
}

Checkbox.propTypes = {
  onChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  coloured: PropTypes.bool,
  description: PropTypes.string
}

export default function Settings (props) {
  const opts = []

  options.forEach((option, index) => {
    opts.push((
      <Checkbox
        coloured={index % 2 !== 0}
        title={option.title}
        key={option.setting}
        description={option.description}
        onChange={generateOnChange(option.setting)}
        value={props.settings[option.setting]} />
    ))
  })

  return (
    <Pane className='h-100 flex flex-column'>
      <Header />

      <div className='bg-white w-100 flex-grow-1 overflow-y-scroll mb3 scrollable'>
        {opts}

        <div className='bg-snow-muted pointer ph3 pv2 charcoal' onClick={openNodeSettings}>
          <p className='f6 b mt0 mb1'>Node Settings</p>
          <p className='f6 ma0'>Click to edit</p>
        </div>

        <div className='pointer ph3 pv2 charcoal' onClick={quit}>
          <p className='f6 b mt0 mb1'>Quit</p>
          <p className='f6 ma0'>Click to quit the application</p>
        </div>
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
