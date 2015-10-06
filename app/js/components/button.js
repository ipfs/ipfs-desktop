import React, {PropTypes} from 'react'
import Radium from 'radium'

@Radium
export default class Button extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func
  }

  static defaultProps = {
    onClick () {}
  }

  render () {
    const styles = {
      color: 'rgba(0, 0, 0, .7)',
      border: 'none',
      backgroundColor: 'white',
      width: '100%',
      padding: '10px',
      transition: 'color 0.3s ease-in-out',
      ':hover': {
        color: 'rgba(0, 0, 0, 1)'
      },
      ':focus': {
        outline: 'none'
      }
    }

    return (
      <button style={styles} onClick={this.props.onClick}>
        {this.props.children}
      </button>
    )
  }
}
