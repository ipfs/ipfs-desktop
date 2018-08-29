import React, {Component} from 'react'
import {ipcRenderer} from 'electron'

import Intro from '../panes/Intro'

import Pane from '../components/Pane'
import PaneContainer from '../components/PaneContainer'
import Heartbeat from '../components/Heartbeat'
import Loader from '../panes/Loader'

const INTRO = 'intro'
const INTITIALZING = 'initializing'
const ERROR = 'error'

export default class Welcome extends Component {
  state = {
    status: INTRO,
    error: void 0,
    configPath: ''
  }

  _onInitializing = () => {
    this.setState({status: INTITIALZING})
  }

  _onIntro = () => {
    this.setState({status: INTRO})
  }

  _onError = (_, error) => {
    this.setState({
      status: ERROR,
      error
    })
  }

  _onConfigPath = (_, path) => {
    this.setState({configPath: path})
  }

  _startInstallation = (options) => {
    ipcRenderer.send('install', options)
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
        return (
          <PaneContainer>
            <Pane className='heartbeat-pane'>
              <Heartbeat />
            </Pane>
            <Intro
              key='intro'
              onInstallClick={this._startInstallation}
              configPath={this.state.configPath} />
          </PaneContainer>
        )
      case ERROR:
        return (
          <PaneContainer>
            <Pane>
              <h1>An error has happened</h1>
              <pre>{ this.state.error }</pre>
              <a onClick={this._onIntro}>Try a different configuration. Click here!</a>
            </Pane>
          </PaneContainer>
        )
      default:
        return <PaneContainer><Loader /></PaneContainer>
    }
  }
}
