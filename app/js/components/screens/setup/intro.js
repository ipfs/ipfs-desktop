import React, {PropTypes} from 'react'
import Radium from 'radium'

@Radium
export default class Intro extends React.Component {

  static propTypes = {
    onInstallClick: PropTypes.func,
    onAdvancedClick: PropTypes.func
  }

  static defaultProps = {
    onInstallClick () {},
    onAdvancedClick () {}
  }

  render () {
    const styles = {
      base: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#19b5fe',
        color: '#FFFFFF',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20',
        justifyContent: 'space-between'
      },
      headline: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '38px'
      },
      button: {
        color: 'rgba(0, 0, 0, .7)',
        border: 'none',
        backgroundColor: '#FFFFFF',
        width: '300px',
        padding: '10px',
        transition: 'color 0.3s ease-in-out',
        ':hover': {
          color: 'rgba(0, 0, 0, 1)'
        },
        ':focus': {
          outline: 'none'
        }
      }
    }

    return (
      <div style={styles.base}>
        <span style={styles.headline}>
          Welcome to IPFS
        </span>
        <button style={styles.button} onClick={this.props.onInstallClick}>
          Install IPFS
        </button>
        <a onClick={this.props.onAdvancedClick}>
          Advanced Options
        </a>
      </div>
    )
  }
}
