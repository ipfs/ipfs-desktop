import React, {Component} from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import Radium from 'radium'
import ipc from 'electron-safe-ipc/guest'

import Intro from './setup/intro'
import Advanced from './setup/advanced'
import Loader from '../components/view/loader'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import '../../styles/common.less'
import '../../styles/fonts.less'
import '../../styles/animations.less'

const INTRO = 'intro'
const INTITIALZING = 'initializing'
const ERROR = 'error'
const ADVANCED = 'advanced'

const KEY_SIZES = [2048, 4096]

@Radium
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

  _onError = error => {
    this.setState({
      status: ERROR,
      error
    })
  }

  _onConfigPath = path => {
    console.log('got path', path)
    this.setState({configPath: path})
  }

  _selectAdvanced = () => {
    this.setState({status: ADVANCED})
  }

  _startInstallation = () => {
    ipc.send('initialize', {keySize: this.state.keySize})
  }

  _onKeySizeChange = keySize => {
    this.setState({keySize})
  }

  componentDidMount () {
    ipc.on('initializing', this._onInitializing)
    ipc.on('initialization-error', this._onError)
    ipc.on('setup-config-path', this._onConfigPath)
  }

  componentWillUnmount () {
    ipc.removeListener('initializing', this._onInitializing)
    ipc.removeListener('initialization-error', this._onError)
    ipc.removeListener('setup-config-path', this._onConfigPath)
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
        return <Loader key='loader'/>
    }
  }

  render () {
    return (
      <CSSTransitionGroup
        transitionName='fade'
        transitionEnterTimeout={300}
        transitionLeaveTimeout={200}
        >
        {this._getScreen()}
      </CSSTransitionGroup>
    )
  }
}
