'use strict'

var React = require('react/addons')
var ipc = window.require('remote').require('ipc')

var $ = require('jquery-bf')
var bs = require('bootstrap')

var Initform = React.createClass({
  displayName: 'Initform',
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
    var t = this
    ipc.on('default-directory', function (dir) {
      t.setState({directory: dir})
    })

    ipc.on('initializing', function () {
      t.setState({initState: 'initializing'})
    })

    ipc.on('initialization-error', function (err) {
      t.setState({
        error: err,
        initState: 'uninitialized'
      })
    })

    ipc.on('initialization-complete', function () {
      t.setState({initState: 'initialized'})
    })
  },

  setKeySize: function (size) {
    var t = this;
    return function () {
      t.setState({keysize: size})
    }
  },

  initialize: function () {
    ipc.emit('initialize', {
      directory: this.state.directory,
      keysize: this.state.keysize
    })
  },

  render: function () {
    var t = this
    var initializing = (t.state.initState === 'initializing')
    var initialized = (t.state.initState === 'initialized')
    var uninitialized = (t.state.initState === 'uninitialized')

    var description = 'Before starting, ipfs needs to generate a keypair, and create a directory to live in.'

    var success = 'Your ipfs node was setup successfully, you can now close this window and start using the ipfs tray toolbar.'

    var error = (uninitialized && t.state.error)
      ? (<pre className='alert alert-danger nomargin top-buffer'>
          {t.state.error}
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
              valueLink={t.linkState('directory')}
              disabled={initializing}
              onChange={t.dirChange}
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
              {t.state.keysize}&nbsp;
              <span className='caret'></span>
            </button>
            <ul className='dropdown-menu'>
              <li><a href='#' onClick={t.setKeySize(2048)}>2048</a></li>
              <li><a href='#' onClick={t.setKeySize(4096)}>4096</a></li>
            </ul>
          </div>
        </div>
        <div className='row top-buffer'>
          <div className='col-xs-12'>
            <button
              onClick={t.initialize}
              disabled={initializing}
              className='btn btn-primary pull-right'>
              { initializing? 'Initializing...' : 'Initialize'}
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
