import React, {PropTypes} from 'react'
import ipc from 'electron-safe-ipc/guest'
import Radium from 'radium'

import Icon from './icon'

@Radium
export default class DirectoryInput extends React.Component {

  static propTypes = {
    path: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func
  }

  static defaultProps = {
    placeholder: '',
    disabled: false,
    onChange () {}
  }

  _onClick = e => {
    e.preventDefault()

    ipc.send('setup-browse-path')
  }

  render () {
    const styles = {
      icon: {
        color: '#FFFFFF',
        fontSize: '20px',
        marginBottom: '-18px',
        marginLeft: '20px'
      },
      button: {
        background: 'rgba(255, 255, 255, 0.15)',
        marginRight: '10px',
        width: '300px',
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
      <div>
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
