var React = require('react')

module.exports = React.createClass({
  displayName: 'OpenLinks',

  propTypes: {
    onConsoleClick: React.PropTypes.func,
    onBrowserClick: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onConsoleClick: function () {},
      onBrowserClick: function () {}
    }
  },

  render () {
    var self = this

    return (
      <div className='row panel panel-default'>
        <div className='list-group'>
          <a href='#'
            className='list-group-item'
            onClick={self.props.onConsoleClick}>
            Open Console
          </a>
          <a href='#'
            className='list-group-item'
            onClick={self.props.onBrowserClick}>
            Open in Browser
          </a>
        </div>
      </div>
    )
  }
})
