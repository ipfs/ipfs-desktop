import React from 'react'
import { connect } from 'redux-bundler-react'
import GeneralSettings from '../general/General'
import BackendsSettings from './BackendsSettings'
import NewBackend from './NewBackend'

const PAGES = {
  GENERAL: '/',
  BACKENDS: '/backends',
  NEW_BACKEND: '/backends/new'
}

const PAGES_COMPONENTS = {
  [PAGES.GENERAL]: GeneralSettings,
  [PAGES.BACKENDS]: BackendsSettings,
  [PAGES.NEW_BACKEND]: NewBackend
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
          {this.generateTab(PAGES.BACKENDS, 'Backends')}
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
