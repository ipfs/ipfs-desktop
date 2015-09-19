var React = require('react')

module.exports = React.createClass({
  displayName: 'Status',

  propTypes: {
    status: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      state: ''
    }
  },

  render () {
    var self = this

    return (
      <div className='row status'>
        { self.props.status }
      </div>
    )
  }
})
