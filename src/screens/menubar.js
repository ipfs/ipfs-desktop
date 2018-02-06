import React, {Component} from 'react'
import {ipcRenderer} from 'electron'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import Pane from '../components/Pane'
import PaneContainer from '../components/PaneContainer'
import MenuOption from '../components/MenuOption'
import Menu from '../components/Menu'

import Peers from '../panes/Peers'
import Loader from '../panes/Loader'
import Start from '../panes/Start'
import Files from '../panes/Files'
import Pinned from '../panes/Pinned'
import Info from '../panes/Info'
import Settings from '../panes/Settings'

const UNINITIALIZED = 'uninitialized'
const STOPPED = 'stopped'
const STARTING = 'starting'
const STOPPING = 'stopping'
const RUNNING = 'running'

const panes = [
  {
    id: 'info',
    title: 'Info',
    icon: 'ipfs'
  },
  {
    id: 'files',
    title: 'Files',
    icon: 'files'
  },
  {
    id: 'pinned',
    title: 'Pin',
    icon: 'pin'
  },
  {
    id: 'peers',
    title: 'Peers',
    icon: 'pulse'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings'
  }
]

class Menubar extends Component {
  state = {
    status: UNINITIALIZED,
    route: panes[0].id,
    stats: {},
    settings: {},
    files: {
      root: '/',
      contents: []
    },
    adding: false,
    pinning: false
  }

  listeners = {}

  _onSomething = (key) => {
    if (this.listeners[key]) {
      return this.listeners[key]
    }

    this.listeners[key] = (event, value) => {
      if (key === 'status') {
        if (value === RUNNING) {
          this.onRunning()
        }
      }

      const obj = {}
      obj[key] = value
      this.setState(obj)
    }

    return this.listeners[key]
  }

  onPinned = (event, pinset) => {
    this.setState({pinned: pinset})

    setTimeout(() => {
      if (this.state.route === 'pinned') {
        ipcRenderer.send('request-pinned')
      }
    }, 5000)
  }

  _changeRoute = (route) => {
    if (route === this.state.route) return

    switch (route) {
      case 'info':
        ipcRenderer.send('request-stats', ['id', 'bw', 'repo'])
        break
      case 'peers':
        ipcRenderer.send('request-stats', ['peers'])
        break
      case 'pinned':
        ipcRenderer.send('request-pinned')
        break
      default:
        ipcRenderer.send('request-stats', [])
        break
    }

    this.setState({route: route})
  }

  onRunning = () => {
    ipcRenderer.send('request-pinned')
    ipcRenderer.send('request-files', this.state.files.root)
  }

  filesUpdated = () => {
    ipcRenderer.send('request-files', this.state.files.root)
  }

  componentDidMount () {
    // Listen to control events
    ipcRenderer.on('node-status', this._onSomething('status'))
    ipcRenderer.on('stats', this._onSomething('stats'))
    ipcRenderer.on('settings', this._onSomething('settings'))
    ipcRenderer.on('adding', this._onSomething('adding'))
    ipcRenderer.on('files', this._onSomething('files'))
    ipcRenderer.on('pinning', this._onSomething('pinning'))
    ipcRenderer.on('pinned', this.onPinned)
    ipcRenderer.on('files-updated', this.filesUpdated)

    ipcRenderer.send('request-state')
    ipcRenderer.send('request-settings')
    ipcRenderer.send('request-stats', ['id', 'bw', 'repo'])
  }

  componentWillUnmount () {
    // Remove control events
    ipcRenderer.removeListener('node-status', this._onSomething('status'))
    ipcRenderer.removeListener('stats', this._onSomething('stats'))
    ipcRenderer.removeListener('settings', this._onSomething('settings'))
    ipcRenderer.removeListener('adding', this._onSomething('adding'))
    ipcRenderer.removeListener('files', this._onSomething('files'))
    ipcRenderer.removeListener('pinning', this._onSomething('pinning'))
    ipcRenderer.removeListener('pinned', this.onPinned)
    ipcRenderer.removeListener('files-updated', this.filesUpdated)
  }

  _getRouteScreen () {
    if (this.state.status === STARTING || this.state.status === STOPPING) {
      return <Loader key='loader-screen' />
    }

    if (this.state.status === STOPPED || this.state.status === UNINITIALIZED) {
      return <Start />
    }

    switch (this.state.route) {
      case 'files':
        return <Files
          adding={this.state.adding}
          files={this.state.files.contents}
          root={this.state.files.root} />
      case 'settings':
        return <Settings settings={this.state.settings} />
      case 'peers':
        var location = 'Unknown'
        if (this.state.stats.node) {
          location = this.state.stats.node.location
        }

        return <Peers peers={this.state.stats.peers} location={location} />
      case 'info':
        return (
          <Info
            node={this.state.stats.id}
            bw={this.state.stats.bw}
            repo={this.state.stats.repo} />
        )
      case 'pinned':
        return (
          <Pinned
            files={this.state.pinned}
            pinning={this.state.pinning} />
        )
      default:
        return (
          <Pane className='left-pane'>
            <p className='notice'>
              Hmmm... Something strange happened and you should not be here.
            </p>
          </Pane>
        )
    }
  }

  _getMenu () {
    const menu = []

    panes.forEach((pane) => {
      menu.push((
        <MenuOption
          key={pane.id}
          title={pane.title}
          icon={pane.icon}
          active={this.state.route === pane.id}
          onClick={() => this._changeRoute(pane.id)} />
      ))
    })

    return (
      <Menu>{menu}</Menu>
    )
  }

  render () {
    let className = ''
    if (this.state.settings.lightTheme) {
      className = 'light'
    }

    return (
      <PaneContainer className={className}>
        {this._getMenu()}
        {this._getRouteScreen()}
      </PaneContainer>
    )
  }
}

export default DragDropContext(HTML5Backend)(Menubar)
