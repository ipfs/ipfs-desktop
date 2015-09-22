import React, {PropTypes} from 'react'

export default class Icon extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired
  }

  render () {
    return (
      <div className={`icon-${this.props.name}`} {...this.props}></div>
    )
  }
}
