import React from 'react'
import { connect } from 'redux-bundler-react'
import Button from '../components/button/Button'
import CheckboxSetting from './CheckboxSetting'

import TYPES from './connection/types'
import ApiAddress from './connection/ApiAddress'
import RepoPath from './connection/RepoPath'
import Flags from './connection/Flags'
import KeySize from './connection/KeySize'
import Type from './connection/Type'

export class NewConnnection extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      apiAddress: '',
      path: '',
      type: TYPES.GO,
      flags: ['--routing=dhtclient'],
      keysize: 4096,
      makeDefault: false
    }

    this.save = this.save.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  save () {
    const { apiAddress, makeDefault, path, type, flags, keysize } = this.state
    let opts = { type }

    if (type === TYPES.API) {
      opts = { ...opts, apiAddress }
    } else {
      opts = {
        ...opts,
        path: path,
        keysize: keysize,
        flags: flags.filter(a => a !== '')
      }
    }

    this.props.doSettingsSaveConfig(null, opts, makeDefault)
  }

  cancel () {
    this.props.doUpdateHash('/settings/connections')
  }

  render () {
    const { type, apiAddress, path, flags } = this.state

    return (
      <div className='pa2'>
        <h2 className='b mt0 mb1'>New Connection</h2>
        <div className='pa2 bg-snow-muted'>
          <Type onChange={e => this.setState({ type: e.target.value })} defaultValue={type} />

          { type === TYPES.API ? (
            <ApiAddress onChange={e => this.setState({ apiAddress: e.target.value })} value={apiAddress} />
          ) : (
            <div>
              <RepoPath value={path} onChange={e => this.setState({ path: e.target.value })} />
              <Flags value={flags} onChange={flags => this.setState({ flags })} />
              <KeySize onChange={e => this.setState({ keysize: e.target.value })} />
            </div>
          )}

          <CheckboxSetting onChange={v => this.setState({ makeDefault: v })}>
            <p className='ma0 f6 b'>Make default</p>
          </CheckboxSetting>

          <div className='flex mt2'>
            <Button onClick={this.cancel}
              minWidth={0}
              className='w-50 bg-red hover-bg-red-muted mr1'>
              Cancel
            </Button>
            <Button onClick={this.save} minWidth={0} className='w-50 ml1'>Save</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  'doUpdateHash',
  'doSettingsSaveConfig',
  NewConnnection
)
