import React, {PropTypes} from 'react'
import Radium from 'radium'

import IconButton from './icon-button'

@Radium
export default class Header extends React.Component {
  static propTypes = {
    onCloseClick: PropTypes.func
  }

  static defaultProps = {
    onCloseClick () {}
  }

  render () {
    const styles = {
      wrapper: {
        display: 'flex',
        height: '40px'
      },
      text: {
        alignSelf: 'center',
        flex: '1',
        paddingTop: '4px'
      },
      stopButton: {
        background: 'none',
        border: 'none',
        position: 'absolute',
        top: '11px',
        right: '0'
      }
    }

    return (
      <div style={styles.wrapper}>
        <div style={styles.text}>
          IPFS
        </div>
        <IconButton
          icon='cross'
          onClick={this.props.onCloseClick}
          style={styles.stopButton}
          iconStyle={{fontSize: '18px'}}
          />
      </div>
    )
  }
}
