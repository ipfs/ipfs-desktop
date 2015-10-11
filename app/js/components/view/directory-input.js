import React, {Component, PropTypes} from 'react'
import ipc from 'electron-safe-ipc/guest'
import Radium from 'radium'

import Icon from './icon'

@Radium
export default class DirectoryInput extends Component {

  static propTypes = {
    path: PropTypes.string.isRequired,
    disabled: PropTypes.bool
  }

  static defaultProps = {
    placeholder: '',
    disabled: false
  }

  _onClick = e => {
    e.preventDefault()

    ipc.send('setup-browse-path')
  }

  render () {
    const styles = {
      base: {
        display: 'flex',
        width: '300px'
      },
      icon: {
        color: '#FFFFFF',
        fontSize: '20px',
        marginLeft: '20px',
        marginTop: '10px',
        position: 'absolute'
      },
      button: {
        flex: '1',
        background: 'rgba(255, 255, 255, 0.15)',
        fontSize: '12px',
        borderRadius: '25px',
        padding: '15px 40px 15px 65px',
        border: 'none',
        textAlign: 'left',
        transition: 'background 0.3s ease-in-out',
        ':hover': {
          background: 'rgba(255, 255, 255, 0.35)',
          cursor: 'pointer'
        }
      }
    }

    return (
      <div style={styles.base}>
        <Icon name='folder' style={styles.icon}/>
        <a
          style={styles.button}
          onClick={this._onClick}
          >
          {this.props.path}
        </a>
      </div>
    )
  }
}
