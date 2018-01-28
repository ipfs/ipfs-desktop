import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/Pane'
import Header from '../components/Header'
import Footer from '../components/Footer'
import IconButton from '../components/IconButton'
import PinnedHash from '../components/PinnedHash'
import NewPinnedHash from '../components/NewPinnedHash'
import InputText from '../components/InputText'

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

  onSearch = (text) => {
    this.setState({ search: text })
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
            key={hash}
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
        <Pane className='left-pane files'>
          <Header title='Pinned Hashes' loading={this.props.pinning} />

          <div className='main'>
            <NewPinnedHash hidden={!this.state.showNew} onSubmit={this.submitHash} />
            {hashes}
          </div>

          <Footer>
            <IconButton onClick={this.toggleShowNew} icon='plus' />

            <div className='right'>
              <InputText
                onChange={this.onSearch}
                value={this.state.search}
                placeholder='Search'
              />
            </div>
          </Footer>
        </Pane>
      </div>
    )
  }
}
