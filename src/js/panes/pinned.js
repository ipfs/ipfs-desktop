import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/view/pane'
import Header from '../components/view/header'
import Footer from '../components/view/footer'
import IconButton from '../components/view/icon-button'
import PinnedHash from '../components/view/pinned-hash'
import NewPinnedHash from '../components/logic/new-pinned-hash'

export default class Pinned extends Component {
  static propTypes = {
    files: PropTypes.object,
    pinning: PropTypes.bool
  }

  static defaultProps = {
    files: {},
    pinning: false
  }

  state = {
    search: '',
    showNew: false
  }

  submitHash = (hash, tag) => {
    ipcRenderer.send('pin-hash', hash, tag)
    this.setState({ showNew: false })
  }

  toggleShowNew = () => {
    this.setState({ showNew: !this.state.showNew })
  }

  onSearch = (event) => {
    this.setState({ search: event.target.value.toLowerCase() })
  }

  static tagUpdater = (hash) => (event) => {
    ipcRenderer.send('tag-hash', hash, event.target.value)
  }

  render () {
    let hashes = []

    for (const hash of Object.keys(this.props.files)) {
      const tag = this.props.files[hash]
      const found = hash.toLowerCase().indexOf(this.state.search) > -1 ||
        tag.toLowerCase().indexOf(this.state.search) > -1

      if (found) {
        hashes.push((
          <PinnedHash
            tag={tag}
            hash={hash}
            onChange={Pinned.tagUpdater(hash)} />
        ))
      }
    }

    if (hashes.length === 0 && !this.state.showNew) {
      hashes = (
        <p className='notice'>
          You do not have any pinned hashes yet. Pin one by
          clicking the button on the bottom left.
        </p>
      )
    }

    return (
      <div>
        <Pane class='left-pane files'>
          <Header title='Pinned Hashes' loading={this.props.pinning} />

          <div className='main'>
            <NewPinnedHash hidden={!this.state.showNew} onSubmit={this.submitHash} />
            {hashes}
          </div>

          <Footer>
            <IconButton onClick={this.toggleShowNew} icon='plus' />

            <div className='right'>
              <input type='text' onChange={this.onSearch} placeholder='Search' />
            </div>
          </Footer>
        </Pane>
      </div>
    )
  }
}
