'use strict'

var React = require('react')
var Toggle = require('./toggle.jsx')
var _ = require('lodash')
var $ = require('jquery-bf')

var ipc = window.require('remote').require('ipc')

var Menu = React.createClass({
  displayName: 'Menu',

  getInitialState: function () {
    return {
      status: 'uninitialized',
      connected: false,
      version: null,
      stats: {}
    }
  },

  componentDidMount: function () {
    var self = this

    ipc.on('version', function (arg) {
      self.setState({version: arg})
    })

    ipc.on('node-status', function (status) {
      self.setState({status: status})
    })

    ipc.on('stats', function (stats) {
      self.setState({stats: stats})
    })

    ipc.emit('request-state')

    setInterval(function () {
      ipc.emit('menu-height', $('#menu-height').height() + 16)
    }, 100)
  },

  toggleDaemon: function (on) {
    if (on) {
      ipc.emit('start-daemon')
    } else {
      ipc.emit('stop-daemon')
    }
  },

  openConsole: function () {
    ipc.emit('open-console')
  },

  openBrowser: function () {
    ipc.emit('open-browser')
  },

  render: function () {
    var self = this
    var version = this.state.version ? (
      <div className='row'>
        <div className='panel panel-default version'>
          {this.state.version}
        </div>
      </div>) : null

    var toggles = [
      (self.state.status !== 'uninitialized') &&
      <Toggle label='IPFS Node' toggle={self.toggleDaemon}/>
    ]

    var image = (this.state.status !== 'running'
      ? '../../node_modules/ipfs-logo/ipfs-logo-128-black.png'
      : '../../node_modules/ipfs-logo/ipfs-logo-128-ice.png')

    var uninitialized = (this.state.status === 'uninitialized')

    var open = (this.state.status === 'running') ? (
      <div className='row panel panel-default'>
        <div className='list-group'>
          <a href='#'
            className='list-group-item'
            onClick={self.openConsole}>
            Open Console
          </a>
          <a href='#'
            className='list-group-item'
            onClick={self.openBrowser}>
            Open in browser
          </a>
        </div>
      </div>
    ) : null

    var stats = (this.state.status === 'running') ? (
      <div className='row stats'>
        <div className='panel panel-default'>
          <div className='panel-body'>
            <table className='table nomarginbottom'>
              {(_.map(self.state.stats, function (value, name) {
                return (
                  <tr key={name}>
                  <td>{name}</td>
                  <td className='value'>{value}</td>
                  </tr>
                )}))}
            </table>
          </div>
        </div>
      </div>
    ) : null

    var status = <div className='row status'>{ self.state.status }</div>

    return (
      <div className='padding'>
        <div id='menu-height'
             className='col-xs-12'>
          <div className='row logo'>
            <div className='cell'>
              <img src={image}/>
            </div>
          </div>
          { status }
          { toggles }
          { open }
          { stats }
          { version }
        </div>
      </div>
    )
  }
})

$(document).ready(function () {
  React.render(<Menu />, document.getElementById('menu-app'))
})
