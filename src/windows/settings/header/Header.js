import React from 'react'
import { connect } from 'redux-bundler-react'

export const Header = ({ hash }) => {
  return (
    <div className='bg-navy pa2' style={{
      backgroundImage: 'url(./imgs/stars.png), linear-gradient(to bottom, #041727 0%,#043b55 100%)',
      backgroundSize: '100%',
      backgroundRepeat: 'repeat'
    }}>
      <div className='flex items-center justify-between'>
        <div className='montserrat f5 tc white normal'>{ hash !== '/' ? 'Settings' : 'IPFS Desktop' }</div>
      </div>
    </div>
  )
}

export default connect(
  'selectHash',
  Header
)
