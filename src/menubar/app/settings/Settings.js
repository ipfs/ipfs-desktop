import React from 'react'
import { connect } from 'redux-bundler-react'
import GeneralSettings from './GeneralSettings'
import ConnectionSettings from './ConnectionSettings'

const PAGES = {
  GENERAL: '/settings/general',
  CONNECTIONS: '/settings/connections'
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

    return (
      <div className='f6'>
        <div className='flex'>
          {this.generateTab(PAGES.GENERAL, 'General')}
          {this.generateTab(PAGES.CONNECTIONS, 'Connections')}
        </div>

        { hash === PAGES.GENERAL ? (
          <GeneralSettings />
        ) : (
          <ConnectionSettings />
        )}
      </div>
    )
  }
}

export default connect(
  'selectHash',
  'doUpdateHash',
  Settings
)
