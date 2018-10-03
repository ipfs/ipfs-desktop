import React from 'react'
import GlyphSettings from '../../../icons/GlyphSettings'
import GlyphPower from '../../../icons/GlyphPower'
import GlyphHome from '../../../icons/GlyphHome'
import Heartbeat from '../heartbeat/Heartbeat'

const Button = ({ children, on, ...props }) => (
  <button
    style={{ outline: 0 }}
    className={`pa0 ma0 dib bn bg-transparent pointer transition-all fill-${on ? 'aqua' : 'gray'} hover-fill-snow`}
    {...props} >
    {children}
  </button>
)

export const Header = ({ toggleIpfs, openSettings, openHome, showHome, ipfsType = 'go', ipfsOnline = false, heartbeat = true }) => {
  return (
    <div className='bg-navy pa2' style={{
      backgroundImage: 'url(./imgs/stars.png), linear-gradient(to bottom, #041727 0%,#043b55 100%)',
      backgroundSize: '100%',
      backgroundRepeat: 'repeat'
    }}>
      <div className='flex items-center justify-between'>
        <div className='montserrat f5 tc white normal'>IPFS Desktop</div>

        <div>
          <Button onClick={toggleIpfs} on={ipfsOnline} title='Toggle IPFS Daemon'>
            <GlyphPower className='w2 h2' />
          </Button>
          { showHome ? (
            <Button onClick={openHome} on={ipfsOnline} title='Go to Home Screen'>
              <GlyphHome className='w2 h2' />
            </Button>
          ) : (
            <Button onClick={openSettings} on={ipfsOnline} title='Go to Settings'>
              <GlyphSettings className='w2 h2' />
            </Button>
          )}
        </div>
      </div>
      { heartbeat &&
        <div className='tc pv2'>
          <Heartbeat type={ipfsType} online={ipfsOnline} />
        </div>
      }
    </div>
  )
}

export default Header
