import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class Icon extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  }

  render () {
    return (
      <div className={`icon-${this.props.name}`} {...this.props} />
    )
  }
}
