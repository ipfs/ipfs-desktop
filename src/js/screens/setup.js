import React, {Component} from 'react'
import {CSSTransition} from 'react-transition-group'
import {ipcRenderer} from 'electron'

import Intro from './setup/intro'
import Advanced from './setup/advanced'
import Loader from '../components/view/loader'

const INTRO = 'intro'
const INTITIALZING = 'initializing'
const ERROR = 'error'
const ADVANCED = 'advanced'

const KEY_SIZES = [2048, 4096]

export default class Setup extends Component {
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

  _getScreen () {
    switch (this.state.status) {
      case INTRO:
        return (
          <Intro
            key='intro'
            onInstallClick={this._startInstallation}
            onAdvancedClick={this._selectAdvanced}
          />
        )
      case ADVANCED: {
        return (
          <Advanced
            key='advanced'
            onInstallClick={this._startInstallation}
            configPath={this.state.configPath}
            keySizes={KEY_SIZES}
            keySize={KEY_SIZES[1]}
            onKeySizeChange={this._onKeySizeChange}
          />
        )
      }
      case ERROR:
        return (
          <div key='error'>{this.state.error}</div>
        )
      default:
        return <Loader key='loader' />
    }
  }

  render () {
    return (
      <CSSTransition
        className='fade'
        timeout={{ enter: 300, exit: 200 }}
      >
        {this._getScreen()}
      </CSSTransition>
    )
  }
}
