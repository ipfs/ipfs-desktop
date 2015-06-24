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
    var t = this

    ipc.on('version', function (arg) {
      t.setState({version: arg})
    })

    ipc.on('node-status', function (status) {
      t.setState({status: status})
    })

    ipc.on('stats', function (stats) {
      t.setState({stats: stats})
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
    var t = this
    var version = this.state.version ? (
      <div className='row'>
        <div className='panel panel-default version'>
          {this.state.version}
        </div>
      </div>) : null

    var toggles = [
      (t.state.status !== 'uninitialized') &&
      <Toggle label='IPFS Node' toggle={t.toggleDaemon}/>
    ]

    var image = (this.state.status !== 'running'
      ? '../node_modules/ipfs-logo/ipfs-logo-128-black.png'
      : '../node_modules/ipfs-logo/ipfs-logo-128-ice.png')

    var uninitialized = (this.state.status === 'uninitialized')

    var open = (this.state.status === 'running') ? (
      <div className='row panel panel-default'>
        <div className='list-group'>
          <a href='#'
            className='list-group-item'
            onClick={t.openConsole}>
            Open Console
          </a>
          <a href='#'
            className='list-group-item'
            onClick={t.openBrowser}>
            Open in browser
          </a>
        </div>
      </div>
    ) : null

    var stats = (this.state.status === 'running') ? (
      <div className='row stats'>
        <div className='panel panel-default'>
          <table className='table panel-body'>
            {(_.map(t.state.stats, function (value, name) {
              return (
                <tr key={name}>
                  <td>{name}</td>
                  <td className='value'>{value}</td>
                </tr>
              )}))}
          </table>
        </div>
      </div>
    ) : null

    var status = <div className='row status'>{ t.state.status }</div>

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
