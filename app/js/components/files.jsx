var React = require('react')
var _ = require('lodash')

module.exports = React.createClass({
  displayName: 'Files',

  propTypes: {
    values: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      values: []
    }
  },

  _renderFile (value, name) {
    if (value.uploaded) {
      var nameTrimmed = value.Name.slice(0, 10) + '...'
      var hashTrimmed = value.Hash.slice(0, 6) + '...'
      return (
        <h5>{nameTrimmed} + {hashTrimmed}</h5>
      )
    }

    return (
      <div className='progress'>
        <div className='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style={{width: '100%'}}>
          <span className='sr-only'>Uploading {value.Name}</span>
        </div>
      </div>
    )
  },

  render () {
    var self = this

    return (
      <div className='row'>
        {_.map(self.props.values, self._renderFile)}
      </div>
    )
  }
})
