import React, {Component, PropTypes} from 'react'
import Radium from 'radium'

class Icon extends Component {

  static propTypes = {
    name: PropTypes.string.isRequired
  }

  render () {
    return (
      <div className={`icon-${this.props.name}`} {...this.props}></div>
    )
  }
}

export default Radium(Icon)
