import React from 'react'
import {logoWiderStrokes} from '../../../utils/logo'

const styles = {
  wrapper: {
    display: 'flex'
  },
  image: {
    marginRight: '5px'
  }
}

export default function IPFSLogo () {
  return (
    <div style={styles.wrapper}>
      <img
        src={logoWiderStrokes}
        width={16}
        height={16}
        style={styles.image} />
      IPFS
    </div>
  )
}
