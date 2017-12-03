import React from 'react'
import PropTypes from 'prop-types'
import {clipboard, ipcRenderer} from 'electron'
import prettyBytes from 'pretty-bytes'

import Heartbeat from '../../components/view/heartbeat'
import Header from '../../components/view/header'
import Footer from '../../components/view/footer'
import IconButton from '../../components/view/icon-button'
import InfoBlock from '../../components/view/info-block'

function onClickCopy (text) {
  return () => clipboard.writeText(text)
}

function openSettings () {
  ipcRenderer.send('open-settings')
}

export default function NodeScreen (props) {
  return (
    <div className='node'>
      <Header title='Your Node'>
        <Heartbeat />
      </Header>

      <div className='main'>
        <div className='sharing'>
          <p>{prettyBytes(props.repo.RepoSize)}</p>
          <p>Sharing {props.repo.NumObjects} objects</p>
        </div>

        <InfoBlock title='Peer Id' onClick={onClickCopy(props.id)} info={props.id} />
        <InfoBlock title='Location' info={props.location} />
        <InfoBlock title='Protocol Version' info={props.protocolVersion} />
        <InfoBlock title='Addresses' info={props.addresses} />

        <InfoBlock title='Settings' button={false} onClick={openSettings} info='Click to edit' />
        <InfoBlock title='Public Key' onClick={onClickCopy(props.publicKey)} info={props.publicKey} />
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
