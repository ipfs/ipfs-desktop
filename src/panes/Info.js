import React from 'react'
import PropTypes from 'prop-types'
import {clipboard, ipcRenderer} from 'electron'
import prettyBytes from 'pretty-bytes'

import Pane from '../components/Pane'
import Header from '../components/Header'
import InfoBlock from '../components/InfoBlock'

function copy (text) {
  return () => { clipboard.writeText(text) }
}

function openNodeSettings () {
  ipcRenderer.send('open-node-settings')
}

function openWebUI () {
  ipcRenderer.send('open-webui')
}

function stopDaemon () {
  ipcRenderer.send('stop-daemon')
}

export default function Info (props) {
  return (
    <Pane class='info'>
      <Header title='Your Node' />

      <div className='main'>
        <div className='sharing'>
          <p>{prettyBytes(props.repo.RepoSize)}</p>
          <p>Sharing {props.repo.NumObjects} objects</p>
        </div>

        <InfoBlock
          title='Peer ID'
          info={props.node.id}
          onClick={copy(props.node.id)} />

        <InfoBlock
          title='Location'
          info={props.node.location} />

        <InfoBlock
          title='Bandwidth Used'
          info={prettyBytes(props.bw.TotalIn + props.bw.TotalOut)} />

        <InfoBlock
          title='Down Speed'
          info={prettyBytes(props.bw.RateIn) + '/s'} />

        <InfoBlock
          title='Up Speed'
          info={prettyBytes(props.bw.RateOut) + '/s'} />

        <InfoBlock
          title='Protocol Version'
          info={props.node.protocolVersion} />

        <InfoBlock
          title='Addresses'
          info={props.node.addresses} />

        <InfoBlock
          title='Public Key'
          info={props.node.publicKey}
          onClick={copy(props.node.publicKey)} />

        <InfoBlock
          title='Node Settings'
          info='Click to edit'
          key='node-settings'
          button={false}
          onClick={openNodeSettings} />

        <InfoBlock
          title='Open WebUI'
          info='Click to open'
          key='open-webui'
          button={false}
          onClick={openWebUI} />

        <InfoBlock
          title='Stop Daemon'
          info='Click to stop'
          key='stop-daemon'
          button={false}
          onClick={stopDaemon} />
      </div>
    </Pane>
  )
}

Info.propTypes = {
  node: PropTypes.object,
  repo: PropTypes.object,
  bw: PropTypes.object
}

Info.defaultProps = {
  node: {
    id: 'Undefined',
    location: 'Unknown',
    protocolVersion: 'Undefined',
    publicKey: 'Undefined',
    addresses: []
  },
  repo: {
    RepoSize: 0,
    NumObjects: 0
  },
  bw: {
    TotalIn: 0,
    TotalOut: 0,
    RateIn: 0,
    RateOut: 0
  }
}
