import React, {Component, PropTypes} from 'react'
import Radium from 'radium'

@Radium
export default class IconButton extends Component {

  static propTypes = {
    name: PropTypes.string,
    icon: PropTypes.string,
    onClick: PropTypes.func,
    style: PropTypes.object,
    iconStyle: PropTypes.object
  }

  static defaultProps = {
    name: null,
    icon: '',
    onClick () {},
    style: {},
    iconStyle: {}
  }

  render () {
    const styles = {
      button: {
        color: 'rgba(255, 255, 255, 0.8)',
        background: 'none',
        border: 'none',
        flex: '1',
        padding: '0 10px',
        textAlign: 'center',
        fontSize: '12px',
        textTransform: 'uppercase',
        transition: 'color 0.3s ease-in-out',
        ':focus': {
          outline: 'none'
        },
        ':hover': {
          color: 'rgba(255, 255, 255, 1)',
          cursor: 'pointer'
        },
        ...this.props.style
      }
    }

    return (
      <button onClick={this.props.onClick} style={styles.button}>
        <div
          className={`icon-${this.props.icon}`}
          style={{fontSize: '28px', paddingBottom: '5px', ...this.props.iconStyle}}
          >
        </div>
        {this.props.name}
      </button>
    )
  }
}
