import React from 'react'

const styles = {
  wrapper: {
    display: 'flex'
  },
  image: {
    marginRight: '5px'
  }
}

const logoPath = '../../node_modules/ipfs-logo/raster-generated/ipfs-logo-256-white-outline.png'

export default function IPFSLogo () {
  return (
    <div style={styles.wrapper}>
      <img
        src={logoPath}
        width={16}
        height={16}
        style={styles.image} />
      IPFS
    </div>
  )
}
