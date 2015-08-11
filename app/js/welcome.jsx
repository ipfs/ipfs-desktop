var React = require('react/addons')
var $ = require('jquery-bf')
var ipc = window.require('remote').require('ipc')

var Initform = React.createClass({

  // -- Initialize Component

  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      error: null,
      directory: '',
      initState: 'uninitialized',
      keysize: 2048
    }
  },

  componentDidMount: function () {
    var self = this
    ipc.on('default-directory', function (dir) {
      self.setState({directory: dir})
    })

    ipc.on('initializing', function () {
      self.setState({initState: 'initializing'})
    })

    ipc.on('initialization-error', function (err) {
      self.setState({
        error: err,
        initState: 'uninitialized'
      })
    })

    ipc.on('initialization-complete', function () {
      self.setState({initState: 'initialized'})
    })
  },

  // -- Actions

  setKeySize: function (size) {
    var self = this
    return function () {
      self.setState({keysize: size})
    }
  },

  initialize: function () {
    ipc.emit('initialize', {
      directory: this.state.directory,
      keysize: this.state.keysize
    })
  },

  // -- Render

  render: function () {
    var self = this
    var initializing = (self.state.initState === 'initializing')
    var initialized = (self.state.initState === 'initialized')
    var uninitialized = (self.state.initState === 'uninitialized')

    var description = 'Before starting, IPFS Node needs to generate a keypair, and create a directory for data to live in.'

    var success = 'Your ipfs node was setup successfully, you can now close this window and start using the ipfs tray toolbar.'

    var error = (uninitialized && self.state.error)
      ? (<pre className='alert alert-danger nomargin top-buffer'>
          {self.state.error}
         </pre>) : null

    var loader = initializing ? (
      <img className='loaderanimation pull-right' src='../img/loading.gif'/>
      ) : null

    var initform = (
      <div>
        <div className='row'>
          <label className='col-xs-4'
            htmlFor='directory'>
            IPFS directory
          </label>
          <div className='col-xs-8'>
            <input className='form-control'
              id='directory'
              valueLink={self.linkState('directory')}
              disabled={initializing}
              onChange={self.dirChange}
              type='text'/>
          </div>
        </div>
        <div className='row top-buffer'>
          <label className='col-xs-4'
            htmlFor='keysize'>Key size</label>
          <div className='col-xs-8'>
            <button
              className='btn btn-default dropdown-toggle'
              type='button'
              id='keysize'
              disabled={initializing}
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='true'>
              {self.state.keysize}&nbsp;
              <span className='caret'></span>
            </button>
            <ul className='dropdown-menu'>
              <li><a href='#' onClick={self.setKeySize(2048)}>2048</a></li>
              <li><a href='#' onClick={self.setKeySize(4096)}>4096</a></li>
            </ul>
          </div>
        </div>
        <div className='row top-buffer'>
          <div className='col-xs-12'>
            <button
              onClick={self.initialize}
              disabled={initializing}
              className='btn btn-primary pull-right'>
              { initializing ? 'Initializing...' : 'Initialize'}
            </button>
            { loader }
          </div>
        </div>
      </div>
    )

    return (
      <div className='col-xs-9 col-xs-offset-2'>
        <div className='panel panel-default '>
          <div className='panel-heading'>
            Initialize node
          </div>
          <div className='panel-body'>
            { initialized ? success : description}
            { !initialized && initform }
            { error }
          </div>
        </div>
      </div>
    )
  }
})

$(document).ready(function () {
  React.render(<Initform />, document.getElementById('initform'))
})
