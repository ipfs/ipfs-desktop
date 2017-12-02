import React from 'react'
import PropTypes from 'prop-types'
import prettyBytes from 'pretty-bytes'
import {getLogo} from '../../../utils/logo'

import Header from '../../components/view/header'
import Footer from '../../components/view/footer'
import IconButton from '../../components/view/icon-button'
import InfoBlock from '../../components/view/info-block'

export default function NodeScreen (props) {
  return (
    <div className='node'>
      <Header title='Your Node'>
        <img src={`file://${getLogo()}`} className='heartbeat' />
      </Header>

      <div className='main'>
        <div className='sharing'>
          <p>{prettyBytes(props.repo.RepoSize)}</p>
          <p>Sharing {props.repo.NumObjects} objects</p>
        </div>

        <InfoBlock title='Peer Id' clipboard info={props.id} />
        <InfoBlock title='Location' info={props.location} />
        <InfoBlock title='Protocol Version' info={props.protocolVersion} />
        <InfoBlock title='Public Key' clipboard info={props.publicKey} />
        <InfoBlock title='Addresses' info={props.addresses} />
      </div>

      <Footer>
        <div className='right'>
          <IconButton onClick={props.stopDaemon} icon='power-off' />
        </div>
      </Footer>
    </div>
  )
}

NodeScreen.propTypes = {
  id: PropTypes.string,
  location: PropTypes.string,
  protocolVersion: PropTypes.string,
  publicKey: PropTypes.string,
  addresses: PropTypes.array,
  repo: PropTypes.object,
  stopDaemon: PropTypes.func.isRequired
}

NodeScreen.defaultProps = {
  id: 'Undefined',
  location: 'Unknown',
  protocolVersion: 'Undefined',
  publicKey: 'Undefined',
  addresses: [],
  repo: {
    RepoSize: 0,
    NumObjects: 'NA'
  }
}
