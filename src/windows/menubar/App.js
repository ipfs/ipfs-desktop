import React from 'react'
import { connect } from 'redux-bundler-react'
import Header from './header/Header'

// TODO: show errors
// TODO: add loading/thinkking state

class Menubar extends React.Component {
  componentDidMount () {
    this.props.doIpfsStartListening()
  }

  render () {
    const { route: Page } = this.props

    return (
      <div className='flex flex-column h-100 overflow-hidden sans-serif'>
        <Header />

        <div className='overflow-auto'>
          <Page />
        </div>
      </div>
    )
  }
}

export default connect(
  'selectRoute',
  'doIpfsStartListening',
  Menubar
)
