import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Pane from '../components/Pane'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PeerBlock from '../components/PeerBlock'
import InputText from '../components/InputText'

export default class Peers extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: '',
      location: 'Unknown'
    }

    this.onChangeSearch = value => {
      this.setState({
        search: value.toLowerCase()
      })
    }
  }

  render () {
    var peers = this.props.peers

    if (this.state.search !== null && this.state.search !== '') {
      peers = peers.filter(peer => {
        return peer.id.toLowerCase().indexOf(this.state.search) > -1 ||
          peer.location.formatted.toLowerCase().indexOf(this.state.search) > -1
      })
    }

    peers = peers.map((peer, i) => {
      return (
        <PeerBlock
          key={i}
          id={peer.id}
          location={peer.location.formatted}
        />
      )
    })

    return (
      <Pane className='peers'>
        <Header
          title={'Earth - ' + this.props.location}
          subtitle={this.props.peers.length + ' peers'} />

        <div className='main'>
          {peers}
        </div>

        <Footer>
          <div className='right'>
            <InputText
              onChange={this.onChangeSearch}
              value={this.state.search}
              placeholder='Search peer'
            />
          </div>
        </Footer>
      </Pane>
    )
  }
}

Peers.propTypes = {
  location: PropTypes.string,
  peers: PropTypes.array
}

Peers.defaultProps = {
  location: 'Unknown',
  peers: []
}
