import React from 'react'

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
      <image
        src={require('../../../node_modules/ipfs-logo/ipfs-logo-wider-strokes-white.png')}
        width={16}
        height={16}
        style={styles.image}
        />
      IPFS
    </div>
  )
}
