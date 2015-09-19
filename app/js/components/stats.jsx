var React = require('react')
var _ = require('lodash')

module.exports = React.createClass({
  displayName: 'Stats',

  propTypes: {
    values: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      values: []
    }
  },

  _renderStat (value, name) {
    return (
      <tr key={name}>
        <td>{name}</td>
        <td className='value'>{value}</td>
      </tr>
    )
  },

  render () {
    var self = this

    return (
      <div className='row stats'>
        <div className='panel panel-default'>
          <div className='panel-body'>
            <table className='table nomarginbottom'>
              {_.map(self.props.values, self._renderStat)}
            </table>
          </div>
        </div>
      </div>
    )
  }
})
