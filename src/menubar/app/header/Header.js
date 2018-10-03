import React from 'react'
import GlyphSettings from '../../../icons/GlyphSettings'
import GlyphPower from '../../../icons/GlyphPower'

const Button = ({ children, on, ...props }) => (
  <button
    style={{ outline: 0 }}
    className={`pa0 ma0 dib bn bg-transparent pointer transition-all fill-${on ? 'aqua' : 'gray'} hover-fill-snow`}
    {...props} >
    {children}
  </button>
)

export const Header = ({ toggleIpfs, openPreferences, on = false }) => {
  return (
    <div className='bg-navy flex pa2 items-center justify-between'>
      <div className='montserrat f5 tc white normal'>IPFS Desktop</div>

      <div>
        <Button onClick={toggleIpfs} on={on} title='Toggle IPFS Daemon'>
          <GlyphPower className='w2 h2' />
        </Button>
        <Button onClick={openPreferences} on={on} title='Open Preferences of IPFS Desktop'>
          <GlyphSettings className='w2 h2' />
        </Button>
      </div>
    </div>
  )
}

export default Header
