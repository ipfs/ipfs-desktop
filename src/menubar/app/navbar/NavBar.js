import React from 'react'
import { ipcRenderer } from 'electron'

import StrokeMarketing from '../../../icons/StrokeMarketing'
import StrokeWeb from '../../../icons/StrokeWeb'
import StrokeCube from '../../../icons/StrokeCube'
import StrokeIpld from '../../../icons/StrokeIpld'

const makeLauncher = (url) => () => {
  ipcRenderer.send('launchWebUI', url)
}

const NavLink = ({ icon, to, children }) => {
  const Svg = icon
  return (
    <a className='w-25 db tc pointer pv3 white link focus-outline f7 hover-bg-white-10 transition-all' onClick={makeLauncher(to)}>
      <div className={`fill-navy`} style={{ width: '100%' }}>
        <Svg width='50' />
      </div>
      <div className='mt1'>
        { children }
      </div>
    </a>
  )
}

export const NavBar = () => {
  return (
    <nav className='sans-serif bg-aqua flex' role='menubar'>
      <NavLink to='/' exact icon={StrokeMarketing}>Status</NavLink>
      <NavLink to='/files/' icon={StrokeWeb}>Files</NavLink>
      <NavLink to='/explore' icon={StrokeIpld}>Explore</NavLink>
      <NavLink to='/peers' icon={StrokeCube}>Peers</NavLink>
    </nav>
  )
}

export default NavBar
