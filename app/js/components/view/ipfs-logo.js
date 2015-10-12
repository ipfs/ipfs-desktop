import React from 'react'

const styles = {
  wrapper: {
    display: 'flex'
  },
  image: {
    marginRight: '5px'
  }
}

const logoPath = require('../../../../node_modules/ipfs-logo/ipfs-logo-wider-strokes-white.png')

export default function IPFSLogo () {
  return (
    <div style={styles.wrapper}>
      <image
        src={logoPath}
        width={16}
        height={16}
        style={styles.image}
        />
      IPFS
    </div>
  )
}
