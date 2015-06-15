'use strict'

var React = require('react')
var $ = require('jquery-bf')
var bt = require('bootstrap-toggle-bf')

try {
  var ipc = window.require('remote').require('ipc')

    console.log(ipc)

} catch (e) {
    console.log('ohnoes')
}

var Menu =  React.createClass({
  displayName: 'Menu',

  getInitialState: function () {
    return {
      daemonStatus: 'off',
      connected: false,
      version: null
    }
  },

  componentDidMount: function () {
    var t = this
    var toggleDaemon = $('#toggleDaemon')

    console.log('helo from web')

    toggleDaemon.bootstrapToggle()
    toggleDaemon.change(function () {
      if ($(this).prop('checked')) {
        ipc.emit('start-daemon')
      } else {
        ipc.emit('stop-daemon')
      }
    })

    ipc.on('version', function (arg) {

      console.log('version here')

      t.setState({version: arg})
    })

    ipc.on('daemon-status', function (status) {
      t.setState({daemonStatus: status})
    })

    ipc.emit('request-state')
  },

  render: function () {
    var version = this.state.version ? (
      <div className='row'>
        <div className='panel panel-default col-xs-offset-1 col-xs-10 version'>
          {this.state.version}
        </div>
      </div>) : null

    var image = (this.state.daemonStatus !== 'running'
      ? '../node_modules/ipfs-logo/ipfs-logo-128-black.png'
      : '../node_modules/ipfs-logo/ipfs-logo-128-ice.png')

    return (
      <div className='bound'>
        <div className='row logo'>
          <div className='cell'>
            <img src={image}/>
          </div>
        </div>
        <div className='row'>
          <div className='panel panel-default col-xs-offset-1 col-xs-10'>
            <div className='col-xs-7'>
              <span className='control'>IPFS&nbsp;Node</span>
            </div>
            <div className='col-xs-2'>
              <input
                id='toggleDaemon'
                type='checkbox'/>
            </div>
          </div>
        </div>
        {version}
      </div>
  )}
})

$(document).ready(function () {
  React.render(<Menu />, document.getElementById('menu-app'))
})
