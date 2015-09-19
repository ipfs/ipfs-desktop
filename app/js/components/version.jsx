var React = require('react')

module.exports = React.createClass({
  displayName: 'Version',

  propTypes: {
    value: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      value: ''
    }
  },

  render () {
    var self = this

    return (
      <div className='row'>
        <div className='panel panel-default version'>
          {self.props.value}
        </div>
      </div>
    )
  }
})
