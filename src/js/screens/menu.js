import React, {Component} from 'react'
import {ipcRenderer} from 'electron'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import Pane from '../components/view/pane'
import Loader from '../components/view/loader'
import MenuOption from '../components/view/menu-option'

import Files from '../panes/files'
import Peers from '../panes/peers'
import NodeInfo from '../panes/node-info'
import Settings from '../panes/settings'

const UNINITIALIZED = 'uninitialized'
const RUNNING = 'running'
const STARTING = 'starting'
const STOPPING = 'stopping'

const panes = {
  nodeInfo: {
    option: {
      name: 'Node',
      icon: 'info'
    },
    render (state) {
      return (
        <NodeInfo
          {...state.stats.node}
          running={state.status === RUNNING}
          bandwidth={state.stats.bw}
          repo={state.stats.repo} />
      )
    }
  },
  files: {
    option: {
      name: 'Files',
      icon: 'files'
    },
    render (state) {
      return <Files files={state.files} />
    }
  },
  settings: {
    option: {
      name: 'Settings',
      icon: 'settings'
    },
    render (state) {
      return <Settings settings={state.settings} />
    }
  },
  peers: {
    option: {
      name: 'Peers',
      icon: 'pulse'
    },
    render (state) {
      let location = 'Unknown'
      if (state.stats.node) {
        location = state.stats.node.location
      }

      return (
        <Peers
          peers={state.stats.peers}
          location={location} />
      )
    }
  }
}

const panesOrder = [
  'nodeInfo',
  'files',
  'peers',
  'settings'
]

class Menu extends Component {
  state = {
    status: UNINITIALIZED,
    route: 'files',
    stats: {},
    settings: {}
  }

  listeners = {}

  _onSomething = (key) => {
    if (this.listeners[key]) {
      return this.listeners[key]
    }

    this.listeners[key] = (event, value) => {
      const obj = {}
      obj[key] = value
      this.setState(obj)
    }

    return this.listeners[key]
  }

  _changeRoute = (route) => {
    this.setState({route: route})
  }

  componentDidMount () {
    // -- Listen to control events
    ipcRenderer.on('node-status', this._onSomething('status'))
    ipcRenderer.on('stats', this._onSomething('stats'))
    ipcRenderer.on('files', this._onSomething('files'))
    ipcRenderer.on('settings', this._onSomething('settings'))

    ipcRenderer.send('request-state')
    ipcRenderer.send('request-files')
    ipcRenderer.send('request-settings')
  }

  componentWillUnmount () {
    // -- Remove control events
    ipcRenderer.removeListener('node-status', this._onSomething('status'))
    ipcRenderer.removeListener('stats', this._onSomething('stats'))
    ipcRenderer.removeListeneron('files', this._onSomething('files'))
    ipcRenderer.removeListener('settings', this._onSomething('settings'))
  }

  _getRouteScreen () {
    if (this.state.status === STARTING || this.state.status === STOPPING) {
      return (
        <Pane>
          <Loader key='loader-screen' />
        </Pane>
      )
    }

    if (panes.hasOwnProperty(this.state.route)) {
      return panes[this.state.route].render(this.state)
    }

    return (
      <Pane class='left-pane'>
        <p className='notice'>
          Hmmm... Something strange happened and you should not be here.
        </p>
      </Pane>
    )
  }

  _getMenu () {
    const menu = []

    panesOrder.forEach((paneName) => {
      const pane = panes[paneName]

      menu.push((
        <MenuOption
          name={pane.option.name}
          icon={pane.option.icon}
          active={this.state.route === paneName}
          onClick={() => this._changeRoute(paneName)} />
      ))
    })

    return (
      <div className='menu'>{menu}</div>
    )
  }

  render () {
    return [
      this._getMenu(),
      this._getRouteScreen()
    ]
  }
}

export default DragDropContext(HTML5Backend)(Menu)
