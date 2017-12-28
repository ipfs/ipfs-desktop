import React from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/view/pane'
import Header from '../components/view/header'
import CheckboxItem from '../components/view/checkbox-item'

function generateOnChange (key) {
  return (value) => {
    ipcRenderer.send('update-setting', key, value)
  }
}

export default function Settings (props) {
  return (
    <Pane>
      <Header title='Settings' />

      <div className='main'>
        <CheckboxItem
          title='Launch on startup'
          id='autoLaunch'
          onChange={generateOnChange('autoLaunch')}
          value={props.settings.autoLaunch} />

        <CheckboxItem
          title='Auto upload screenshots'
          id='screenshotShortcut'
          onChange={generateOnChange('screenshotShortcut')}
          value={props.settings.screenshotShortcut}
          info={(<span>
            Upload screenshots taken with <span className='key'>CTRL/CMD</span> + <span />
            <span className='key'>ALT</span> + <span className='key'>S</span> <span />
            shortcut</span>
          )} />

        <CheckboxItem
          title='Download copied hash'
          id='downloadHashShortcut'
          onChange={generateOnChange('downloadHashShortcut')}
          value={props.settings.downloadHashShortcut}
          info={(<span>
            Download copied hash with <span className='key'>CTRL/CMD</span> + <span />
            <span className='key'>ALT</span> + <span className='key'>D</span> <span />
            shortcut</span>
          )} />
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
