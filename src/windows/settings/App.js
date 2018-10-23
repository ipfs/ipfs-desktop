import React from 'react'
import { connect } from 'redux-bundler-react'
import Header from './header/Header'

const PAGES = {
  GENERAL: '/',
  BACKENDS: '/backends',
  NEW_BACKEND: '/backends/new'
}

// TODO: show errors
// TODO: add loading/thinkking state

class Menubar extends React.Component {
  componentDidMount () {
    this.props.doSettingsStartListening()
  }

  generateTab (hash, label) {
    return (
      <a className={`dib pointer tc w-50 ph2 pv3 b ${this.props.hash !== hash ? 'bg-snow' : ''}`}
        onClick={() => this.props.doUpdateHash(hash)}>{label}</a>
    )
  }

  render () {
    const { route: Page } = this.props

    return (
      <div className='flex flex-column h-100 overflow-hidden sans-serif'>
        <Header />
        <div className='overflow-auto'>
          <div className='f6'>
            <div className='flex'>
              {this.generateTab(PAGES.GENERAL, 'General')}
              {this.generateTab(PAGES.BACKENDS, 'Backends')}
            </div>

            <Page />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  'selectRoute',
  'selectHash',
  'doUpdateHash',
  'doSettingsStartListening',
  Menubar
)
