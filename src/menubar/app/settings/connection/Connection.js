import React from 'react'
import Button from '../../components/button/Button'
import { TextInput, Dropdown } from '../input/Input'
import { ipcRenderer } from 'electron'

const TYPES = {
  JS: 'js',
  GO: 'go',
  API: 'api'
}

const KEYSIZES = {
  2048: '2048',
  4096: '4096'
}

export default class Connection extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      apiAddress: props.apiAddress || '',
      path: props.path || '',
      type: props.type || TYPES.GO,
      flags: props.flags ? props.flags.join(' ') : '',
      keysize: 4096
    }

    this.save = this.save.bind(this)
    this.delete = this.delete.bind(this)
  }

  save () {
    const { id } = this.props
    const { apiAddress, path, type, flags, keysize } = this.state
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

    ipcRenderer.send('config.ipfs.changed', id, opts)
  }

  delete () {
    ipcRenderer.send('config.ipfs.remove', this.props.id)
  }

  render () {
    const { id, running } = this.props
    const { type, apiAddress, path, flags } = this.state

    return (
      <details className='bg-snow-muted mv2'>
        <summary className={`pa2 outline-0 pointer ${id ? '' : 'b'}`}>
          { id || 'New' }
          { running && <span className='b green'> (active)</span>}
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
              <Button onClick={this.delete} minWidth={0} className='w-50 bg-red hover-bg-red-muted mr1'>Delete</Button>
            }
            <Button onClick={this.save} minWidth={0} className={id ? 'w-50 ml1' : 'w-100'}>Save</Button>
          </div>
        </div>
      </details>
    )
  }
}
