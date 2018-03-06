import React, {Component} from 'react'
import {ipcRenderer} from 'electron'

import Intro from '../panes/intro'

import Pane from '../components/Pane'
import Heartbeat from '../components/Heartbeat'
import Loader from '../panes/Loader'

const INTRO = 'intro'
const INTITIALZING = 'initializing'
const ERROR = 'error'
const ADVANCED = 'advanced'

const KEY_SIZES = [2048, 4096]

export default class Welcome extends Component {
  state = {
    status: INTRO,
    error: void 0,
    configPath: '',
    keySize: KEY_SIZES[1]
  }

  _onInitializing = () => {
    this.setState({status: INTITIALZING})
  }

  _onError = (event, error) => {
    this.setState({
      status: ERROR,
      error
    })
  }

  _onConfigPath = (event, path) => {
    this.setState({configPath: path})
  }

  _selectAdvanced = () => {
    this.setState({status: ADVANCED})
  }

  _startInstallation = () => {
    ipcRenderer.send('initialize', {keySize: this.state.keySize})
  }

  _onKeySizeChange = (keySize) => {
    this.setState({keySize})
  }

  componentDidMount () {
    ipcRenderer.on('initializing', this._onInitializing)
    ipcRenderer.on('initialization-error', this._onError)
    ipcRenderer.on('setup-config-path', this._onConfigPath)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('initializing', this._onInitializing)
    ipcRenderer.removeListener('initialization-error', this._onError)
    ipcRenderer.removeListener('setup-config-path', this._onConfigPath)
  }

  render () {
    switch (this.state.status) {
      case INTRO:
      case ADVANCED:
        return (
          <div className='sans-serif flex overflow-hidden'>
            <Pane className='heartbeat-pane'>
              <Heartbeat />
            </Pane>
            <Intro
              key='intro'
              onInstallClick={this._startInstallation}
              configPath={this.state.configPath}
              keySizes={KEY_SIZES}
              keySize={KEY_SIZES[1]}
              onKeySizeChange={this._onKeySizeChange} />
          </div>
        )
      case ERROR:
        return (
          <div key='error'>{this.state.error}</div>
        )
      default:
        return <Loader />
    }
  }
}
