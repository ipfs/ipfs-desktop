import React from 'react'
import { connect } from 'redux-bundler-react'
import CheckboxSetting from '../components/checkbox-setting/CheckboxSetting'
import Button from '../../common/components/button/Button'

const Key = ({ children }) => <span className='monospace br2 bg-snow ph1'>{ children }</span>

const GeneralSettings = ({ doQuitApp, doOpenLogsDir, doSettingsToggle, settings }) => (
  <div className='pa2'>
    <CheckboxSetting checked={settings['autoLaunch'] || false} onChange={() => doSettingsToggle('autoLaunch')}>
      <p className='ma0 f6 b'>Launch on startup</p>
    </CheckboxSetting>
    <CheckboxSetting checked={settings['screenshotShortcut'] || false} onChange={() => doSettingsToggle('screenshotShortcut')}>
      <p className='ma0 f6 b'>Auto add screenshots</p>
      <p className='mb0 mt1 lh-copy'>
        Use <Key>CTRL/CMD</Key>+<Key>ALT</Key>+<Key>S</Key> to take screenshots and add them to the repository.
      </p>
    </CheckboxSetting>
    <CheckboxSetting checked={settings['downloadHashShortcut'] || false} onChange={() => doSettingsToggle('downloadHashShortcut')}>
      <p className='ma0 f6 b'>Download copied hash</p>
      <p className='mb0 mt1 lh-copy'>
        Use <Key>CTRL/CMD</Key>+<Key>ALT</Key>+<Key>D</Key> to download the last copied hash.
      </p>
    </CheckboxSetting>

    <div className='flex mt2'>
      <Button
        onClick={doOpenLogsDir}
        minWidth={0}
        className='w-50 mr1'
        title='Open Logs'>Open Logs</Button>
      <Button
        onClick={doQuitApp}
        minWidth={0}
        bg='bg-red'
        className='w-50 ml1'
        title='Quit IPFS Desktop'>Quit</Button>
    </div>
  </div>
)

export default connect(
  'selectSettings',
  'doOpenLogsDir',
  'doQuitApp',
  'doSettingsToggle',
  GeneralSettings
)
