import React from 'react'
import CheckboxSetting from '../checkbox-setting/CheckboxSetting'
import { ipcRenderer } from 'electron'
import Button from '../../components/button/Button'

const Key = ({ children }) => <span className='monospace br2 bg-snow ph1'>{ children }</span>

const GeneralSettings = ({ autoLaunch, screenshotShortcut, downloadHashShortcut }) => (
  <div className='pa2'>
    <CheckboxSetting checked={autoLaunch} onChange={() => ipcRenderer.send('config.toggleAutoLaunch')}>
      <p className='ma0 f6 b'>Launch on startup</p>
    </CheckboxSetting>
    <CheckboxSetting checked={screenshotShortcut} onChange={() => ipcRenderer.send('config.toggleScreenshot')}>
      <p className='ma0 f6 b'>Auto add screenshots</p>
      <p className='mb0 mt1 lh-copy'>
        Use <Key>CTRL/CMD</Key>+<Key>ALT</Key>+<Key>S</Key> to take screenshots and add them to the repository.
      </p>
    </CheckboxSetting>
    <CheckboxSetting checked={downloadHashShortcut} onChange={() => ipcRenderer.send('config.toggleDownloadHash')}>
      <p className='ma0 f6 b'>Download copied hash</p>
      <p className='mb0 mt1 lh-copy'>
        Use <Key>CTRL/CMD</Key>+<Key>ALT</Key>+<Key>D</Key> to download the last copied hash.
      </p>
    </CheckboxSetting>

    <div className='flex mt2'>
      <Button
        onClick={() => ipcRenderer.send('open.logs.folder')}
        minWidth={0}
        className='w-50 mr1'
        title='Quit IPFS Desktop'>Logs Folder</Button>
      <Button
        onClick={() => ipcRenderer.send('app.quit')}
        minWidth={0}
        bg='bg-red'
        className='w-50 ml1'
        title='Quit IPFS Desktop'>Quit</Button>
    </div>
  </div>
)

export default GeneralSettings
