var React = require('react')

module.exports = React.createClass({
  displayName: 'Settings',

  propTypes: {
    onClick: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onClick: function () {}
    }
  },

  render () {
    var self = this

    return (
      <div className='row'>
        <div className='panel panel-default version'>
          <a href='#'
            onClick={self.props.onClick}>
            Settings
          </a>
        </div>
      </div>
    )
  }
})
