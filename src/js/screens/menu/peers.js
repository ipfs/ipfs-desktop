import React from 'react'
import PropTypes from 'prop-types'

import Peer from '../../components/view/peer'
import Header from '../../components/view/header'
import Footer from '../../components/view/footer'
import IconButton from '../../components/view/icon-button'

export default function PeersScreen (props) {
  var peers = []

  props.peers.forEach((peer, i) => {
    peers.push(<Peer key={i} {...peer} />)
  })

  return (
    <div className='peers'>
      <Header
        title={'Earth - ' + props.location}
        subtitle={props.peers.length + ' peers'} />
      <div className='main'>
        {peers}
      </div>

      <Footer>
        <IconButton onClick={() => { props.changeRoute('files') }} icon='files' />

        <div className='right'>
          <span>Search feature</span>
        </div>
      </Footer>
    </div>
  )
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
