'use strict'

var React = require('react')
var $ = require('jquery-bf')
var bf = require('bootstrap-toggle-bf')

var Toggle = React.createClass({
  displayName: 'Toggle',

  propTypes: {
    label: React.PropTypes.string,
    toggle: React.PropTypes.func
  },

  componentDidMount: function () {
    var t = this
    var input = $(React.findDOMNode(this)).find('input')

    input.bootstrapToggle()
    input.change(function () {
      t.props.toggle($(this).prop('checked'))
    })
  },

  render: function () {
    return (
      <div className='row panel panel-default'>
        <div className='col-xs-7'>
          <span className='control'>{this.props.label}</span>
        </div>
        <div className='col-xs-2'>
          <input type='checkbox'/>
        </div>
      </div>
    )
  }
})

module.exports = Toggle
