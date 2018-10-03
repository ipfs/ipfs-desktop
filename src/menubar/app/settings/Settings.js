import React from 'react'
import Button from '../components/button/Button'
import Checkbox from '../components/checkbox/Checkbox'
import { ipcRenderer } from 'electron'

import { TextInput, Dropdown } from './input/Input'

const CheckSetting = ({ children, ...props }) => (
  <div className='flex mt2 align-center'>
    <Checkbox {...props} className='mr1' />
    <div>
      <span>{children}</span>
    </div>
  </div>
)

const Key = ({ children }) => <span className='monospace br2 bg-snow ph1'>{ children }</span>

const TYPES = {
  JS: 'js',
  GO: 'go',
  API: 'api'
}

const KEYSIZES = {
  2048: '2048',
  4096: '4096'
}

class Config extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      id: props.id,
      apiAddress: props.apiAddress || '',
      path: props.path || '',
      type: props.type || TYPES.GO,
      flags: props.flags ? props.flags.join(' ') : '',
      keysize: 4096
    }

    this.save = this.save.bind(this)
  }

  save () {
    const { id, apiAddress, path, type, flags, keysize } = this.state
    let opts = { type }

    if (type === TYPES.API) {
      opts = { ...opts, apiAddress }
    } else {
      opts = {
        ...opts,
        path: path,
        flags: flags.split(' ').filter(a => a !== '')
      }

      if (!id) opts.keysize = keysize
    }

    console.log(opts)
  }

  render () {
    const { running } = this.props
    const { id, type, apiAddress, path, flags } = this.state

    return (
      <details className='bg-snow-muted mv2'>
        <summary className={`pa2 outline-0 pointer ${id ? '' : 'b'}`}>
          { id || 'New' }
          { running && <span className='b yellow'> (active)</span>}
        </summary>

        <div className='pa2 bt b--top b--snow'>
          <Dropdown label='Type'
            onChange={e => this.setState({ type: e.target.value })}
            options={TYPES}
            defaultValue={type}
            disabled={!!id} />

          { type === TYPES.API ? (
            <div>
              <TextInput
                onChange={e => this.setState({ apiAddress: e.target.value })}
                label='Api Address'
                value={apiAddress}
                placeholder='/ip4/127.0.0.1/tcp/5001'
                required />
            </div>
          ) : (
            <div>
              <TextInput
                disabled={!!id}
                label='Repo Path'
                value={path}
                onChange={e => this.setState({ path: e.target.value })}
                required
                placeholder='~/.ipfs-repo' />
              <TextInput
                label='Flags'
                value={flags}
                onChange={e => this.setState({ flags: e.target.value })}
                placeholder='E.g.: --routing=dhtclient'
                required />

              { !id &&
                <Dropdown label='Key size'
                  onChange={e => this.setState({ keysize: e.target.value })}
                  options={KEYSIZES}
                  defaultValue={KEYSIZES[4096]} />
              }
            </div>
          )}

          <div className='flex'>
            { !!id &&
              <Button onClick={() => {}} minWidth={0} className='w-50 bg-red hover-bg-red-muted mr1'>Delete</Button>
            }
            <Button onClick={this.save} minWidth={0} className={id ? 'w-50 ml1' : 'w-100'}>Save</Button>
          </div>
        </div>
      </details>
    )
  }
}

const TABS = {
  GENERAL: 'general',
  CONNECTIONS: 'connections'
}

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = { tab: TABS.GENERAL }
    this.changeTab = this.changeTab.bind(this)
    this.generateTab = this.generateTab.bind(this)
  }

  changeTab (tab) {
    this.setState({ tab })
  }

  generateTab (tab, label) {
    return (
      <a className={`dib pointer tc w-50 ph2 pv3 b ${this.state.tab !== tab ? 'bg-snow' : ''}`}
        onClick={() => this.changeTab(tab)}>{label}</a>
    )
  }

  render () {
    const { tab } = this.state
    const { runningId, autoLaunch, downloadHashShortcut, screenshotShortcut, configs } = this.props

    return (
      <div className='f6'>
        <div className='flex'>
          {this.generateTab(TABS.GENERAL, 'General')}
          {this.generateTab(TABS.CONNECTIONS, 'Connections')}
        </div>

        { tab === TABS.GENERAL ? (
          <div className='pa2'>
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
          </div>
        ) : (
          <div className='pa2'>
            <Config />
            { Object.keys(configs).map(k => <Config running={runningId === k} key={k} id={k} {...configs[k]} />)}
          </div>
        )}
      </div>
    )
  }
}
