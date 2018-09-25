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
    <Pane className='info'>
      <Header title='Your Node' />

      <div className='main'>
        <div className='sharing'>
          <p>{prettyBytes(props.repo.repoSize)}</p>
          <p>Sharing {props.repo.numObjects} objects</p>
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
          info={prettyBytes(props.bw.totalIn + props.bw.totalOut)} />

        <InfoBlock
          title='Down Speed'
          info={prettyBytes(props.bw.rateIn) + '/s'} />

        <InfoBlock
          title='Up Speed'
          info={prettyBytes(props.bw.rateOut) + '/s'} />

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
    repoSize: 0,
    numObjects: 0
  },
  bw: {
    totalIn: 0,
    totalOut: 0,
    rateIn: 0,
    rateOut: 0
  }
}
