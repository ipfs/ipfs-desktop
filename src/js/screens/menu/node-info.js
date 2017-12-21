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

function startDaemon () {
  ipcRenderer.send('start-daemon')
}

function stopDaemon () {
  ipcRenderer.send('stop-daemon')
}

function close () {
  ipcRenderer.send('close')
}

export default function NodeScreen (props) {
  return (
    <div className={`node` + (props.running ? '' : ' translucent')}>
      <Header title='Your Node'>
        <Heartbeat
          dead={!props.running}
          onClickAlive={stopDaemon}
          onClickDead={startDaemon} />
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

        <InfoBlock onClick={onClickCopy(props.publicKey)} info={props.publicKey}>
          Public Key
        </InfoBlock>

        <InfoBlock button={false} onClick={openSettings} info='Click to edit'>
          Settings
        </InfoBlock>

        <InfoBlock button={false} onClick={openWebUI} info='Click to open'>
          Open WebUI
        </InfoBlock>

        <div className='always-on'>
          <InfoBlock button={false} onClick={close} info='Click to close Station'>
            Close
          </InfoBlock>
        </div>
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
  running: PropTypes.bool.isRequired,
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
