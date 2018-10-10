import React from 'react'
import { connect } from 'redux-bundler-react'
import GlyphSettings from '../../../icons/GlyphSettings'
import GlyphPower from '../../../icons/GlyphPower'
import GlyphHome from '../../../icons/GlyphHome'
import Heartbeat from './heartbeat/Heartbeat'

const Button = ({ children, on, ...props }) => (
  <button
    style={{ outline: 0 }}
    className={`pa0 ma0 dib bn bg-transparent pointer transition-all fill-${on ? 'aqua' : 'gray'} hover-fill-snow`}
    {...props} >
    {children}
  </button>
)

export const Header = ({ doIpfsToggle, currentConfig, hash, doUpdateHash, ipfsIsRunning }) => {
  return (
    <div className='bg-navy pa2' style={{
      backgroundImage: 'url(./imgs/stars.png), linear-gradient(to bottom, #041727 0%,#043b55 100%)',
      backgroundSize: '100%',
      backgroundRepeat: 'repeat'
    }}>
      <div className='flex items-center justify-between'>
        <div className='montserrat f5 tc white normal'>IPFS Desktop</div>

        <div>
          <Button onClick={doIpfsToggle} on={ipfsIsRunning} title='Toggle IPFS Daemon'>
            <GlyphPower className='w2 h2' />
          </Button>
          { hash !== '/' ? (
            <Button onClick={() => { doUpdateHash('/') }} on={ipfsIsRunning} title='Go to Home Screen'>
              <GlyphHome className='w2 h2' />
            </Button>
          ) : (
            <Button onClick={() => { doUpdateHash('/settings/general') }} on={ipfsIsRunning} title='Go to Settings'>
              <GlyphSettings className='w2 h2' />
            </Button>
          )}
        </div>
      </div>
      { hash === '/' &&
        <div className='tc pv2'>
          <Heartbeat
            type={ipfsIsRunning && currentConfig.id.agentVersion.includes('js') ? 'js' : 'go'}
            online={ipfsIsRunning} />
        </div>
      }
    </div>
  )
}

export default connect(
  'doIpfsToggle',
  'doUpdateHash',
  'selectIpfsIsRunning',
  'selectCurrentConfig',
  'selectHash',
  Header
)
