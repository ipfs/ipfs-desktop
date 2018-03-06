import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Pin from '../components/Pin'
import Tab from '../components/Tab'

import {getHashCopier, getOpener} from '../utils/event-handlers'

const getUnpinner = (hash) => (event) => {
  if (event) event.stopPropagation()
  ipcRenderer.send('unpin-hash', hash)
}

export default class Pins extends Component {
  static propTypes = {
    changeRoute: PropTypes.func.isRequired,
    pins: PropTypes.object.isRequired
  }

  goToFiles = () => {
    this.props.changeRoute('files')
  }

  getContent () {
    const keys = Object.keys(this.props.pins)

    if (keys.length === 0) {
      return <p className='notice'>
        You do not have any pinned hashes yet. Pin one by
        clicking the button on the bottom left.
      </p>
    }

    return keys.map((hash, index) => {
      return <Pin
        odd={index % 2 === 0}
        tag={this.props.pins[hash]}
        key={hash}
        hash={hash}
        copy={getHashCopier(hash)}
        open={getOpener(hash)}
        unpin={getUnpinner(hash)} />
    })
  }

  render () {
    return (
      <div className='files relative h-100 flex flex-column justify-between mh4 mv0 flex-grow-1'>
        <Header />

        <div>
          <Tab onClick={this.goToFiles}>Recent files</Tab>
          <Tab active>Pinned files</Tab>
        </div>

        <div className='bg-white w-100 flex-grow-1 overflow-y-scroll scrollable'>
          {this.getContent()}
        </div>

        <Footer>
          <div className='right'>
            <Button className='mr2' onClick={() => {}}>Pin hash</Button>
          </div>
        </Footer>
      </div>
    )
  }
}
