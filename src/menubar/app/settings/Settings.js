import React from 'react'
import Button from '../components/button/Button'
import Checkbox from '../components/checkbox/Checkbox'
import { ipcRenderer } from 'electron'

const CheckSetting = ({ children, ...props }) => (
  <div className='flex mt2 align-center'>
    <Checkbox {...props} className='mr1' />
    <div>
      <span>{children}</span>
    </div>
  </div>
)

const Key = ({ children }) => <span className='monospace br2 bg-snow ph1'>{ children }</span>

const Settings = ({ autoLaunch, downloadHashShortcut, screenshotShortcut }) => (
  <div className='pa2 f6'>
    <CheckSetting checked={autoLaunch} onChange={() => ipcRenderer.send('config.toggleAutoLaunch')}>
      <p className='ma0 f6 b'>Launch on startup</p>
    </CheckSetting>
    <CheckSetting checked={screenshotShortcut} onChange={() => ipcRenderer.send('config.toggleScreenshot')}>
      <p className='ma0 f6 b'>Auto add screenshots</p>
      <p className='mb0 mt1 lh-copy'>
        Use <Key>CTRL/CMD</Key>+<Key>ALT</Key>+<Key>S</Key> to take screenshots and add them to the repository.
      </p>
    </CheckSetting>
    <CheckSetting checked={downloadHashShortcut} onChange={() => ipcRenderer.send('config.toggleDownloadHash')}>
      <p className='ma0 f6 b'>Download copied hash</p>
      <p className='mb0 mt1 lh-copy'>
        Use <Key>CTRL/CMD</Key>+<Key>ALT</Key>+<Key>D</Key> to download the last copied hash.
      </p>
    </CheckSetting>

    <div className='mt3'>
      <Button onClick={() => {}} className='f6 w-100 tl'>Edit connections</Button>
    </div>
  </div>
)

export default Settings
