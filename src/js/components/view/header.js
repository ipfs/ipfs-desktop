import React from 'react'
import PropTypes from 'prop-types'

import IconButton from './icon-button'
import IPFSLogo from './ipfs-logo'

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

export default function Header (props) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.text}>
        <IPFSLogo />
      </div>
      <IconButton
        icon='cross'
        onClick={props.onCloseClick}
        style={styles.stopButton}
        iconStyle={{fontSize: '18px'}} />
    </div>
  )
}

Header.propTypes = {
  onCloseClick: PropTypes.func.isRequired
}

Header.defaultProps = {
  onCloseClick: () => {}
}
