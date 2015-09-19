var React = require('react')
var Toggle = require('./menubar-toggle.jsx')
var _ = require('lodash')
var $ = require('jquery-bf')

var ipc = window.require('remote').require('ipc')

var Menu = React.createClass({

  // -- Initialize Component

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
    self.state.files = []

    // -- Listen to control events

    ipc.on('version', function (arg) {
      self.setState({version: arg})
    })

    ipc.on('node-status', function (status) {
      self.setState({status: status})
    })

    ipc.on('stats', function (stats) {
      self.setState({stats: stats})
    })

    ipc.on('uploading', function (file) {
      console.log('file being uploaded: ' + file.Name)
      if (self.state.files.length >= 5) {
        self.state.files.shift()
      }
      file.uploaded = false
      self.state.files.push(file)
      self.setState({files: self.state.files})
    })

    ipc.on('uploaded', function (file) {
      for (var i = 0; i < self.state.files.length; i++) {
        if (self.state.files[i].Name === file.Name) {
          self.state.files[i].Hash = file.Hash
          self.state.files[i].uploaded = true
        }
      }
      self.setState({files: self.state.files})
    })

    ipc.emit('request-state')

    // set menu height as its height change
    var menuHeight
    setInterval(function () {
      if (menuHeight !== $('#menu-height').height() + 16) {
        menuHeight = $('#menu-height').height() + 16
        ipc.emit('menu-height', menuHeight)
      }
    }, 200)
  },

  // -- Actions

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

  // -- Render

  render: function () {
    var self = this

    var image = (this.state.status !== 'running'
      ? '../../node_modules/ipfs-logo/ipfs-logo-128-black.png'
      : '../../node_modules/ipfs-logo/ipfs-logo-128-ice.png')

    var status = <div className='row status'>{ self.state.status }</div>

    var toggles = [
      (self.state.status !== 'uninitialized') &&
      <Toggle label='IPFS Node' toggle={self.toggleDaemon}/>
    ]

    // var uninitialized = (this.state.status === 'uninitialized')

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
            Open in Browser
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
                )
              }))}
            </table>
          </div>
        </div>
      </div>
    ) : null

    var version = this.state.version ? (
      <div className='row'>
        <div className='panel panel-default version'>
          {this.state.version}
        </div>
      </div>) : null

    var files = this.state.files && this.state.files.length > 0 ? (
      <div className='row'>
        {(_.map(self.state.files, function (value, name) {
          if (value.uploaded) {
            var nameTrimmed = value.Name.slice(0, 10) + '...'
            var hashTrimmed = value.Hash.slice(0, 6) + '...'
            return (
              <h5>{nameTrimmed} + {hashTrimmed}</h5>
            )
          } else {
            return (
              <div className='progress'>
                <div className='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style={{width: '100%'}}>
                  <span className='sr-only'>Uploading {value.Name}</span>
                </div>
              </div>
            )
          }
        }))}
      </div>
    ) : null

    return (
      <div className='padding'>
        <div id='menu-height' className='col-xs-12'>
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
          { files }
        </div>
      </div>
    )
  }
})

$(document).ready(function () {
  React.render(<Menu />, document.getElementById('menu-app'))
})
