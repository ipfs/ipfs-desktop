import React, {Component} from 'react'
import {ipcRenderer} from 'electron'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import PaneContainer from '../components/view/pane-container'
import Pane from '../components/view/pane'
import Loader from '../components/view/loader'
import Icon from '../components/view/icon'

import Files from '../panes/files'
import Peers from '../panes/peers'
import NodeInfo from '../panes/node-info'

const UNINITIALIZED = 'uninitialized'
const RUNNING = 'running'
const STARTING = 'starting'
const STOPPING = 'stopping'

class Menu extends Component {
  state = {
    status: UNINITIALIZED,
    route: 'files',
    connected: false,
    version: null,
    stats: {}
  }

  _onNodeStatus = (event, status) => {
    this.setState({status: status})
  }

  _onStats = (event, stats) => {
    this.setState({stats: stats})
  }

  _onFiles = (event, files) => {
    this.setState({files: files})
  }

  _changeRoute = (route) => {
    this.setState({route: route})
  }

  componentDidMount () {
    // -- Listen to control events
    ipcRenderer.on('node-status', this._onNodeStatus)
    ipcRenderer.on('stats', this._onStats)
    ipcRenderer.on('files', this._onFiles)

    ipcRenderer.send('request-state')
    ipcRenderer.send('request-files')
  }

  componentWillUnmount () {
    // -- Remove control events
    ipcRenderer.removeListener('node-status', this._onNodeStatus)
    ipcRenderer.removeListener('stats', this._onStats)
    ipcRenderer.removeListener('files', this._onFiles)
  }

  _getRouteScreen () {
    if (this.state.status === STARTING || this.state.status === STOPPING) {
      return (
        <Pane class='left-pane'>
          <Loader key='loader-screen' />
        </Pane>
      )
    }

    if (this.state.status !== RUNNING) {
      return (
        <Pane class='left-pane'>
          <p className='notice'>
            Oh snap, it looks like your node is not running yet.
            Change that by clicking the button on the top right corner.
          </p>
        </Pane>
      )
    }

    switch (this.state.route) {
      case 'files':
        return (
          <Files
            files={this.state.files}
            changeRoute={this._changeRoute} />
        )
      case 'peers':
        return (
          <Peers
            peers={this.state.stats.peers}
            location={this.state.stats.node.location}
            changeRoute={this._changeRoute} />
        )
      case 'info':
        return (
          <NodeInfo
            {...this.state.stats.node}
            running={this.state.status === RUNNING}
            bandwidth={this.state.stats.bw}
            repo={this.state.stats.repo} />
        )
      default:
        return null
    }
  }

  render () {
    return (
      <div className='menubar'>
        <div className='menu'>
          <button onClick={() => this._changeRoute('info')} className='menu-option'>
            <Icon name='info' />
            <p>Node</p>
          </button>

          <button onClick={() => this._changeRoute('files')} className='menu-option'>
            <Icon name='files' />
            <p>Files</p>
          </button>

          <button onClick={() => this._changeRoute('peers')} className='menu-option'>
            <Icon name='pulse' />
            <p>Peers</p>
          </button>

          <button onClick={() => ipcRenderer.send('open-settings')} className='menu-option'>
            <Icon name='settings' />
            <p>Settings</p>
          </button>
        </div>
        <PaneContainer>
          {this._getRouteScreen()}
        </PaneContainer>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(Menu)
