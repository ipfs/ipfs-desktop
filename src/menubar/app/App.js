import React from 'react'
import { connect } from 'redux-bundler-react'
import Heartbeat from './components/heartbeat/Heartbeat'
import GlyphPower from '../../icons/GlyphPower'
import StrokeMarketing from '../../icons/StrokeMarketing'
import StrokeWeb from '../../icons/StrokeWeb'
import StrokeCube from '../../icons/StrokeCube'
import StrokeSettings from '../../icons/StrokeSettings'
import StrokeIpld from '../../icons/StrokeIpld'

const NavLink = connect(
  'doOpenWebUI',
  ({ doOpenWebUI, to, info, icon: Svg, children }) => (
    <a onClick={() => doOpenWebUI(to)} className='pointer pv2 ph3 flex white items-center f5 hover-bg-white-10'>
      <Svg width='45' height='45' className='fill-current-color o-50' />
      <span className='flex justify-between pl3 flex-grow-1'>
        <span>{children}</span>
        <span className='w-25 tc f6 b'>{ info }</span>
      </span>
    </a>
  )
)

const Button = ({ children, on, ...props }) => (
  <button
    style={{ outline: 0 }}
    className={`pa0 ma0 dib bn bg-transparent pointer transition-all fill-${on ? 'aqua' : 'gray'} hover-fill-snow`}
    {...props} >
    {children}
  </button>
)

class Menubar extends React.Component {
  componentDidMount () {
    this.props.doIpfsStartListening()
  }

  render () {
    const { ipfsIsRunning, doQuitApp, currentConfig } = this.props

    return (
      <div className='bg-navy sans-serif h-100'>
        <div className='pa3 bw3 bb b--aqua'>
          <div className='flex items-center'>
            <Heartbeat
              size={40}
              type={ipfsIsRunning && currentConfig.id.agentVersion.includes('js') ? 'js' : 'go'}
              online={ipfsIsRunning} />
            <div className='montserrat f3 ml2 white' style={{ marginRight: 'auto' }}>IPFS</div>

            <Button onClick={doQuitApp} on={ipfsIsRunning} title='Toggle IPFS Daemon'>
              <GlyphPower className='w2 h2' />
            </Button>
          </div>
        </div>

        <div>
          <NavLink to='/' exact icon={StrokeMarketing}>Status</NavLink>
          <NavLink to='/files/' icon={StrokeWeb} info={currentConfig && '2.0GB'}>Files</NavLink>
          <NavLink to='/explore' icon={StrokeIpld}>Explore</NavLink>
          <NavLink to='/peers' icon={StrokeCube} info={currentConfig && currentConfig.peers}>Peers</NavLink>
          <NavLink to='/settings' icon={StrokeSettings}>Settings</NavLink>
        </div>
      </div>
    )
  }
}

export default connect(
  'doQuitApp',
  'doIpfsStartListening',
  'selectIpfsIsRunning',
  'selectCurrentConfig',
  Menubar
)
