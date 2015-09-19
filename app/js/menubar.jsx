var React = require('react')
var $ = require('jquery-bf')

var ipc = window.require('remote').require('ipc')

var Toggle = require('./menubar-toggle.jsx')
var Status = require('./components/status.jsx')
var OpenLinks = require('./components/open-links.jsx')
var Stats = require('./components/stats.jsx')
var Settings = require('./components/settings.jsx')
var Version = require('./components/version.jsx')
var Quit = require('./components/quit.jsx')
var Files = require('./components/files.jsx')

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

  openSettings: function () {
    ipc.emit('open-settings')
  },

  quit: function () {
    ipc.emit('shutdown')
  },

  // -- Render

  render: function () {
    var self = this

    var image = (this.state.status !== 'running'
      ? '../../node_modules/ipfs-logo/ipfs-logo-128-black.png'
      : '../../node_modules/ipfs-logo/ipfs-logo-128-ice.png')

    var toggles = null

    if (self.state.status !== 'uninitialized') {
      toggles = <Toggle label='IPFS Node' toggle={self.toggleDaemon}/>
    }

    // var uninitialized = (this.state.status === 'uninitialized')

    var open = (this.state.status === 'running') ? (
      <OpenLinks
        onConsoleClick={self.openConsole}
        onBrowserClick={self.openBrowser}
        />
    ) : null

    var stats = (this.state.status === 'running') ? (
      <Stats values={self.state.stats} />
    ) : null

    var version = this.state.version ? <Version value={this.state.version} /> : null

    var files = null
    if (this.state.files && this.state.files.length > 0) {
      files = <Files values={this.state.files} />
    }

    return (
      <div className='padding'>
        <div id='menu-height' className='col-xs-12'>
          <div className='row logo'>
            <div className='cell'>
              <img src={image}/>
            </div>
          </div>
          <Status status={this.state.status} />
          { toggles }
          { open }
          { stats }
          <Settings onClick={this.openSettings} />
          { version }
          <Quit onClick={this.quit} />
          { files }
        </div>
      </div>
    )
  }
})

$(document).ready(function () {
  React.render(<Menu />, document.getElementById('menu-app'))
})
