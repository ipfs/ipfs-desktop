import React, {Component} from 'react'
import {ipcRenderer} from 'electron'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import Pane from '../components/Pane'
import {Menu, MenuOption} from '../components/Menu'
import Icon from '../components/Icon'

import Loader from '../panes/Loader'
import Start from '../panes/Start'
import Files from '../panes/Files'
import Info from '../panes/Info'
import Settings from '../panes/Settings'
import Pins from '../panes/Pins'

const UNINITIALIZED = 'uninitialized'
const STOPPED = 'stopped'
const STARTING = 'starting'
const STOPPING = 'stopping'
const RUNNING = 'running'

class Menubar extends Component {
  state = {
    status: UNINITIALIZED,
    route: 'files',
    stats: {},
    settings: {},
    files: {
      root: '/',
      contents: []
    },
    pinned: {},
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
          changeRoute={this._changeRoute}
          root={this.state.files.root} />
      case 'pins':
        return <Pins
          changeRoute={this._changeRoute}
          pins={this.state.pinned} />
      case 'settings':
        return <Settings settings={this.state.settings} />
      case 'info':
        return (
          <Info
            node={this.state.stats.id}
            bw={this.state.stats.bw}
            repo={this.state.stats.repo} />
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

  render () {
    return (
      <div className='sans-serif flex overflow-hidden'>
        <Menu>
          <MenuOption
            title='My Files'
            icon='document'
            active={this.state.route === 'files'}
            onClick={() => this._changeRoute('files')} />

          <MenuOption
            title='Node Info'
            icon='decentralization'
            active={this.state.route === 'info'}
            onClick={() => this._changeRoute('info')} />

          <div className='mt-auto flex justify-center pv3 ph2'>
            <Icon
              onClick={() => this._changeRoute('settings')}
              className='w2-75 h2-75 mr1 pointer dim'
              name='settings'
              color='navy' />

            <Icon
              onClick={() => ipcRenderer.send('stop-daemon')}
              className='w2-75 h2-75 ml1 pointer dim'
              name='power'
              color='navy' />
          </div>
        </Menu>
        {this._getRouteScreen()}
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(Menubar)
