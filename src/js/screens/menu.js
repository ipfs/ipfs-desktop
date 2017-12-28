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

const panesOrder = [
  'nodeInfo',
  'files',
  'peers',
  'settings'
]

const panes = {
  nodeInfo: {
    option: {
      name: 'Node',
      icon: 'info'
    },
    render: function () {
      return (
        <NodeInfo
          {...this.state.stats.node}
          running={this.state.status === RUNNING}
          bandwidth={this.state.stats.bw}
          repo={this.state.stats.repo} />
      )
    }
  },
  files: {
    option: {
      name: 'Files',
      icon: 'files'
    },
    render: function () {
      return <Files files={this.state.files} />
    }
  },
  settings: {
    option: {
      name: 'Settings',
      icon: 'settings'
    },
    render: function () {
      return <Settings settings={this.state.settings} />
    }
  },
  peers: {
    option: {
      name: 'Peers',
      icon: 'pulse'
    },
    render: function () {
      let location = 'Unknown'
      if (this.state.stats.node) {
        location = this.state.stats.node.location
      }

      return (
        <Peers
          peers={this.state.stats.peers}
          location={location} />
      )
    }
  }
}

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
      return panes[this.state.route].render.call(this)
    }

    return (
      <Pane class='left-pane'>
        <p className='notice'>
          Hmmm... Something strange happened and you shouldn't be here.
        </p>
      </Pane>
    )
  }

  render () {
    const options = []

    panesOrder.forEach((paneName) => {
      const pane = panes[paneName]

      options.push((
        <MenuOption
          name={pane.option.name}
          icon={pane.option.icon}
          active={this.state.route === paneName}
          onClick={() => this._changeRoute(paneName)} />
      ))
    })

    return [
      (
        <div className='menu'>
          {options}
        </div>
      ),
      this._getRouteScreen()
    ]
  }
}

export default DragDropContext(HTML5Backend)(Menu)
