import React, {Component} from 'react'
import {ipcRenderer, remote} from 'electron'

import Pane from '../components/view/pane'
import Header from '../components/view/header'
import Footer from '../components/view/footer'
import Button from '../components/view/button'
import CheckboxItem from '../components/view/checkbox-item'

export default class Settings extends Component {
  constructor (props) {
    super(props)
    this.state = {
      autoLaunch: false,
      screenshotShortcut: false
    }
  }

  _onSettings = (event, settings) => {
    this.setState(settings)
  }

  _onSave = () => {
    ipcRenderer.send('update-settings', this.state)
    Settings.closeWindow()
  }

  _generateOnChange (key) {
    return (value) => {
      const obj = {}
      obj[key] = value
      this.setState(obj)
    }
  }

  componentDidMount () {
    ipcRenderer.on('settings', this._onSettings)
  }

  static closeWindow () {
    remote.getCurrentWindow().close()
  }

  render () {
    return (
      <Pane>
        <Header title='Settings' />

        <div className='main'>

          <CheckboxItem
            title='Launch on startup'
            id='autoLaunch'
            onChange={this._generateOnChange('autoLaunch')}
            value={this.state.autoLaunch} />

          <CheckboxItem
            title='Auto upload screenshots'
            id='screenshotShortcut'
            onChange={this._generateOnChange('screenshotShortcut')}
            value={this.state.screenshotShortcut}
            info={(<span>
              Upload screenshots taken with <span className='key'>CTRL/CMD</span> + <span />
              <span className='key'>ALT</span> + <span className='key'>S</span> <span />
              shortcut</span>
            )} />
        </div>

        <Footer>
          <div className='right'>
            <Button onClick={Settings.closeWindow} text='Cancel' />
            <Button onClick={this._onSave} text='Save' />
          </div>
        </Footer>
      </Pane>
    )
  }
}
