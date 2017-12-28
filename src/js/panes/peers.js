import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Pane from '../components/view/pane'
import Peer from '../components/view/peer'
import Header from '../components/view/header'
import Footer from '../components/view/footer'

export default class Peers extends Component {
  constructor (props) {
    super(props)
    this.state = { search: null }
  }

  onChangeSearch = event => {
    this.setState({ search: event.target.value.toLowerCase() })
  }

  render () {
    var peers = this.props.peers

    if (this.state.search !== null && this.state.search !== '') {
      peers = peers.filter(peer => {
        return peer.id.toLowerCase().indexOf(this.state.search) > -1
      })
    }

    peers = peers.map((peer, i) => {
      return (<Peer key={i} {...peer} />)
    })

    return (
      <Pane class='left-pane peers'>
        <Header
          title={'Earth - ' + this.props.location}
          subtitle={this.props.peers.length + ' peers'} />
        <div className='main'>
          {peers}
        </div>

        <Footer>
          <div className='right'>
            <input type='text' onChange={this.onChangeSearch} placeholder='Search peer' />
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
