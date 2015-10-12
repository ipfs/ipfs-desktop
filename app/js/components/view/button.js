import React, {Component, PropTypes} from 'react'
import Radium from 'radium'

@Radium
export default class Button extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    style: PropTypes.object
  }

  static defaultProps = {
    onClick () {},
    style: {}
  }

  render () {
    const styles = {
      color: 'rgba(0, 0, 0, .7)',
      border: 'none',
      backgroundColor: 'white',
      width: '100%',
      padding: '10px',
      transition: 'color 0.3s ease-in-out',
      fontWeight: '600',
      textAlign: 'center',
      borderRadius: '2px',
      ':hover': {
        color: 'rgba(0, 0, 0, 1)'
      },
      ':focus': {
        outline: 'none'
      },
      ...this.props.style
    }

    return (
      <button style={styles} onClick={this.props.onClick}>
        {this.props.children}
      </button>
    )
  }
}
