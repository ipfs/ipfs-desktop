import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

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

    switch (this.state.route) {
      case 'files':
        return (
          <Files
            files={this.state.files} />
        )
      case 'peers':
        var location = 'Unknown'
        if (this.state.stats.node) {
          location = this.state.stats.node.location
        }

        return (
          <Peers
            peers={this.state.stats.peers}
            location={location} />
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
    return [
      (
        <div className='menu'>
          <MenuOption
            name='Node'
            icon='info'
            active={this.state.route === 'info'}
            onClick={() => this._changeRoute('info')} />

          <MenuOption
            name='Files'
            icon='files'
            active={this.state.route === 'files'}
            onClick={() => this._changeRoute('files')} />

          <MenuOption
            name='Peers'
            icon='pulse'
            active={this.state.route === 'peers'}
            onClick={() => this._changeRoute('peers')} />

          <MenuOption
            name='Settings'
            icon='settings'
            onClick={() => ipcRenderer.send('open-settings')} />
        </div>
      ),
      this._getRouteScreen()
    ]
  }
}

function MenuOption (props) {
  let className = 'menu-option'
  if (props.active) className += ' active'

  return (
    <button onClick={props.onClick} className={className}>
      <Icon name={props.icon} />
      <p>{props.name}</p>
    </button>
  )
}

MenuOption.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.string,
  name: PropTypes.string
}

export default DragDropContext(HTML5Backend)(Menu)
