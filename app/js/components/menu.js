import React from 'react/addons'
import ipc from 'electron-safe-ipc/guest'

import StartScreen from './screens/start'
import ProfileScreen from './screens/profile'
import Loader from './loader'

import '../../styles/animations.css'

const {CSSTransitionGroup} = React.addons

const UNINITIALIZED = 'uninitialized'
const RUNNING = 'running'
const STARTING = 'starting'
const STOPPING = 'stopping'

export default class Menu extends React.Component {

  state = {
    status: UNINITIALIZED,
    connected: false,
    version: null,
    stats: {}
  }

  // -- Event Listeners

  _onVersion = arg => {
    this.setState({version: arg})
  }

  _onNodeStatus = status => {
    this.setState({status: status})
  }

  _onStats = stats => {
    this.setState({stats: stats})
  }

  _startDaemon () {
    ipc.send('start-daemon')
  }

  _stopDaemon () {
    ipc.send('stop-daemon')
  }

  _closeWindow () {
    ipc.send('close-tray-window')
  }

  _openConsole () {
    ipc.send('open-console')
  }

  _openBrowser () {
    ipc.send('open-browser')
  }

  _openSettings () {
    ipc.send('open-settings')
  }

  componentDidMount () {
    // -- Listen to control events

    ipc.on('version', this._onVersion)
    ipc.on('node-status', this._onNodeStatus)
    ipc.on('stats', this._onStats)

    ipc.send('request-state')
  }

  componentWillUnmount () {
    // -- Remove control events

    ipc.removeListener('version', this._onVersion)
    ipc.removeListener('node-status', this._onNodeStatus)
    ipc.removeListener('stats', this._onStats)
    ipc.removeListener('uploading', this._onUploading)
    ipc.removeListener('uploaded', this._onUploaded)
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
        return <StartScreen key='start-screen' onStartClick={this._startDaemon}/>
    }
  }

  render () {
    return (
      <CSSTransitionGroup transitionName='fade'>
        {this._getScreen()}
      </CSSTransitionGroup>
    )
  }
}
