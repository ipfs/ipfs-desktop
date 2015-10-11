import React, {Component, PropTypes} from 'react'
import Radium from 'radium'

@Radium
export default class Icon extends Component {

  static propTypes = {
    name: PropTypes.string.isRequired
  }

  render () {
    return (
      <div className={`icon-${this.props.name}`} {...this.props}></div>
    )
  }
}
