import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Peer from '../../components/view/peer'
import Header from '../../components/view/header'
import Footer from '../../components/view/footer'
import IconButton from '../../components/view/icon-button'

export default class PeersScreen extends Component {
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
      <div className='peers'>
        <Header
          title={'Earth - ' + this.props.location}
          subtitle={this.props.peers.length + ' peers'} />
        <div className='main'>
          {peers}
        </div>

        <Footer>
          <IconButton onClick={() => { this.props.changeRoute('files') }} icon='files' />
          <IconButton onClick={() => { this.props.changeRoute('pinned') }} icon='pin' />

          <div className='right'>
            <input type='text' onChange={this.onChangeSearch} placeholder='Search peer' />
          </div>
        </Footer>
      </div>
    )
  }
}

PeersScreen.propTypes = {
  location: PropTypes.string,
  peers: PropTypes.array,
  changeRoute: PropTypes.func.isRequired
}

PeersScreen.defaultProps = {
  location: 'Unknown',
  peers: []
}
