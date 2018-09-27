import React from 'react'
import { ipcRenderer } from 'electron'

const makeLauncher = (url) => () => {
  ipcRenderer.send('launch-webui', url)
}

const NavLink = ({ to, children }) => {
  return (
    <a className='w-20 tc pointer pv3 white link focus-outline f5 hover-bg-white-10 transition-all' onClick={makeLauncher(to)}>
      { children }
    </a>
  )
}

export const NavBar = () => {
  return (
    <nav className='sans-serif bg-navy flex' role='menubar'>
      <NavLink to='/' exact icon={''}>Status</NavLink>
      <NavLink to='/files/' icon={''}>Files</NavLink>
      <NavLink to='/explore' icon={''}>Explore</NavLink>
      <NavLink to='/peers' icon={''}>Peers</NavLink>
      <NavLink to='/settings' icon={''}>Settings</NavLink>
    </nav>
  )
}

export default NavBar
