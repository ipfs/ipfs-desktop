import React from 'react'
import Button from '../../components/button/Button'
import CheckboxSetting from '../CheckboxSetting'
import TYPES from './types'
import ApiAddress from './ApiAddress'
import RepoPath from './RepoPath'
import Flags from './Flags'
import Type from './Type'
import { connect } from 'redux-bundler-react'

class Connection extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      apiAddress: props.apiAddress || '',
      flags: props.flags ? props.flags : ['--routing=dhtclient'],
      makeDefault: false
    }

    this.save = this.save.bind(this)
    this.delete = this.delete.bind(this)
  }

  save () {
    const { id, type, path } = this.props
    const { apiAddress, makeDefault, flags } = this.state
    let opts = { type }

    if (type === TYPES.API) {
      opts = { ...opts, apiAddress }
    } else {
      opts = {
        ...opts,
        path: path,
        flags: flags.filter(a => a !== '')
      }
    }

    this.props.doSettingsSaveConfig(id, opts, makeDefault)
  }

  delete () {
    this.props.doSettingsRemoveConfig(this.props.id)
  }

  render () {
    const { type, path, isDefault, id, running } = this.props
    const { apiAddress, flags } = this.state

    return (
      <details className='bg-snow-muted mv2'>
        <summary className={`pa2 outline-0 pointer`}>
          { id }
          { (running || isDefault) &&
            <span className='b gray'> (
              { running && <span className='green'>active</span>}
              { running && isDefault && <span className='dib' style={{ width: '0.25rem' }} />}
              { isDefault && <span className='yellow'>default</span>}
            )</span>
          }
        </summary>

        <div className='pa2 bt b--top b--snow'>
          <Type defaultValue={type} disabled />

          { type === TYPES.API ? (
            <div>
              <ApiAddress onChange={e => this.setState({ apiAddress: e.target.value })} value={apiAddress} />
            </div>
          ) : (
            <div>
              <RepoPath value={path} disabled />
              <Flags value={flags} onChange={flags => this.setState({ flags })} />
            </div>
          )}

          <CheckboxSetting onChange={v => this.setState({ makeDefault: v })}>
            <p className='ma0 f6 b'>Make default</p>
          </CheckboxSetting>

          <div className='flex mt2'>
            <Button onClick={this.delete}
              minWidth={0}
              className='w-50 bg-red hover-bg-red-muted mr1'>
              Delete
            </Button>
            <Button onClick={this.save} minWidth={0} className='w-50 ml1'>Save</Button>
          </div>
        </div>
      </details>
    )
  }
}

export default connect(
  'doSettingsSaveConfig',
  'doSettingsRemoveConfig',
  Connection
)
