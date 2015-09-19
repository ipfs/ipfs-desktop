var React = require('react/addons')
var $ = require('jquery-bf')

var Settings = React.createClass({

  // -- Initialize Component

  getInitialState: function () {
    return {}
  },

  componentDidMount: function () {
    // var self = this
  },

  // -- Actions

  // -- Render

  render: function () {
    // var self = this

    return (
      <div className='col-xs-9 col-xs-offset-2'>
        <div className='panel panel-default '>
          <div className='panel-heading'>
            Settings
          </div>
          <div className='panel-body'>
            Yellow
          </div>
        </div>
      </div>
    )
  }
})

$(document).ready(function () {
  React.render(<Settings />, document.getElementById('settings'))
})
