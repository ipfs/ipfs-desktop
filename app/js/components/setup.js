import React from 'react'
import Radium from 'radium'
import ipc from 'electron-safe-ipc/guest'
import {DropdownList} from 'react-widgets'

import DirectoryInput from './directory-input'
import Loader from './loader'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import 'react-widgets/dist/css/react-widgets.css'
import '../../styles/common.css'
import '../../styles/fonts.css'
import '../../styles/setup.less'

const KEY_SIZES = [2048, 4096]

@Radium
export default class Setup extends React.Component {

  state = {
    initializing: false,
    error: false,
    keySize: KEY_SIZES[1]
  }

  _onInitializing = () => {
    this.setState({initializing: true})
  }

  _onError = error => {
    this.setState({
      error,
      initializing: false
    })
  }

  componentDidMount () {
    ipc.on('initializing', this._onInitializing)
    ipc.on('initialization-error', this._onError)
  }

  componentWillUnmount () {
    ipc.removeEventListener('initializing', this._onInitializing)
    ipc.removeEventListener('initialization-error', this._onError)
  }

  _onContinue (event) {
    event.preventDefault()
    console.log('continue')
    ipc.send('initialize')
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
      copy: {
        fontSize: '18px',
        maxWidth: '600px'
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
      },
      advanced: {
        flex: '0 0 200px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: '#59c0fe'
      }
    }

    if (this.state.initializing) {
      return <Loader />
    }

    return (
      <div style={styles.base}>
        <span style={styles.headline}>
          Welcome to IPFS
        </span>
        <div style={styles.copy}>
          We are happy you found your way here. Before you can start there is just one thing you need to tell us, where should we store all the awesomeness that is IPFS?
        </div>
        <div style={styles.advanced}>
          <DirectoryInput />
          <DropdownList
              data={KEY_SIZES}
              value={this.state.keySize}
              onChange={keySize => this.setState({keySize})}
          />
        </div>
        <button style={styles.button} onClick={this._onContinue}>
          Continue
        </button>
      </div>
    )
  }
}
