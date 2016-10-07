import React, {Component} from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import {ipcRenderer} from 'electron'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import StartScreen from './menu/start'
import ProfileScreen from './menu/profile'
import Loader from '../components/view/loader'

const UNINITIALIZED = 'uninitialized'
const RUNNING = 'running'
const STARTING = 'starting'
const STOPPING = 'stopping'

class Menu extends Component {
  state = {
    status: UNINITIALIZED,
    connected: false,
    version: null,
    stats: {}
  }

  // -- Event Listeners

  _onVersion = (event, arg) => {
    this.setState({version: arg})
  }

  _onNodeStatus = (event, status) => {
    console.log(status)
    this.setState({status: status})
  }

  _onStats = (event, stats) => {
    this.setState({stats: stats})
  }

  _startDaemon () {
    console.log('starting daemon')
    ipcRenderer.send('start-daemon')
  }

  _stopDaemon () {
    ipcRenderer.send('stop-daemon')
  }

  _closeWindow () {
    ipcRenderer.send('close-tray-window')
  }

  _openConsole () {
    ipcRenderer.send('open-console')
  }

  _openBrowser () {
    ipcRenderer.send('open-browser')
  }

  _openSettings () {
    ipcRenderer.send('open-settings')
  }

  componentDidMount () {
    // -- Listen to control events
    ipcRenderer.on('version', this._onVersion)
    ipcRenderer.on('node-status', this._onNodeStatus)
    ipcRenderer.on('stats', this._onStats)

    ipcRenderer.send('request-state')
  }

  componentWillUnmount () {
    // -- Remove control events
    ipcRenderer.removeListener('version', this._onVersion)
    ipcRenderer.removeListener('node-status', this._onNodeStatus)
    ipcRenderer.removeListener('stats', this._onStats)
    ipcRenderer.removeListener('uploading', this._onUploading)
    ipcRenderer.removeListener('uploaded', this._onUploaded)
  }

  _getScreen () {
    switch (this.state.status) {
      case RUNNING:
        return (
          <ProfileScreen
            key='profile-screen'
            peers={this.state.stats.peers}
            location={this.state.stats.location}
            onStopClick={this._stopDaemon}
            onConsoleClick={this._openConsole}
            onBrowserClick={this._openBrowser}
            onSettingsClick={this._openSettings}
            onCloseClick={this._closeWindow}
            />
        )
      case STARTING:
      case STOPPING:
        return <Loader key='loader-screen' />
      default:
        return (
          <StartScreen
            key='start-screen'
            onStartClick={this._startDaemon}
            onCloseClick={this._closeWindow} />
        )
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

export default DragDropContext(HTML5Backend)(Menu)
