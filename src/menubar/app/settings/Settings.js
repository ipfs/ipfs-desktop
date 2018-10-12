import React from 'react'
import { connect } from 'redux-bundler-react'
import GeneralSettings from './GeneralSettings'
import ConnectionSettings from './ConnectionSettings'
import NewConnection from './NewConnection'

const PAGES = {
  GENERAL: '/settings/general',
  CONNECTIONS: '/settings/connections',
  NEW_CONNECTION: '/settings/connections/new'
}

const PAGES_COMPONENTS = {
  [PAGES.GENERAL]: GeneralSettings,
  [PAGES.CONNECTIONS]: ConnectionSettings,
  [PAGES.NEW_CONNECTION]: NewConnection
}

class Settings extends React.Component {
  generateTab (hash, label) {
    return (
      <a className={`dib pointer tc w-50 ph2 pv3 b ${this.props.hash !== hash ? 'bg-snow' : ''}`}
        onClick={() => this.props.doUpdateHash(hash)}>{label}</a>
    )
  }

  render () {
    const { hash } = this.props
    const Comp = PAGES_COMPONENTS[hash]

    return (
      <div className='f6'>
        <div className='flex'>
          {this.generateTab(PAGES.GENERAL, 'General')}
          {this.generateTab(PAGES.CONNECTIONS, 'Connections')}
        </div>

        <Comp />
      </div>
    )
  }
}

export default connect(
  'selectHash',
  'doUpdateHash',
  Settings
)
