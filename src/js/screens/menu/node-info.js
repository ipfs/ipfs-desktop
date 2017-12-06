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

function openWebUI () {
  ipcRenderer.send('open-webui')
}

function stopDaemon () {
  ipcRenderer.send('stop-daemon')
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

        <InfoBlock onClick={onClickCopy(props.id)} info={props.id}>
          Peer Id
        </InfoBlock>

        <InfoBlock info={props.location}>
          Location
        </InfoBlock>

        <InfoBlock info={prettyBytes(props.bandwidth.TotalIn + props.bandwidth.TotalOut)}>
          Bandwidth Used
        </InfoBlock>

        <InfoBlock info={prettyBytes(props.bandwidth.RateIn) + '/s'}>
          Down Speed
        </InfoBlock>

        <InfoBlock info={prettyBytes(props.bandwidth.RateOut) + '/s'}>
          Up Speed
        </InfoBlock>

        <InfoBlock info={props.protocolVersion}>
          Protocol Version
        </InfoBlock>

        <InfoBlock info={props.addresses}>
          Addresses
        </InfoBlock>

        <InfoBlock button={false} onClick={openSettings} info='Click to edit'>
          Settings
        </InfoBlock>

        <InfoBlock button={false} onClick={openWebUI} info='Click to open'>
          Open WebUI
        </InfoBlock>

        <InfoBlock onClick={onClickCopy(props.publicKey)} info={props.publicKey}>
          Public Key
        </InfoBlock>
      </div>

      <Footer>
        <div className='right'>
          <IconButton onClick={stopDaemon} icon='power-off' />
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
  bandwidth: PropTypes.object
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
  },
  bandwidth: {
    TotalIn: 0,
    TotalOut: 0,
    RateIn: 0,
    RateOut: 0
  }
}
