import React from 'react'
import PropTypes from 'prop-types'
import {clipboard, ipcRenderer} from 'electron'
import prettyBytes from 'pretty-bytes'

import Pane from '../components/view/pane'
import Header from '../components/view/header'
import Footer from '../components/view/footer'
import IconButton from '../components/view/icon-button'
import InfoBlock from '../components/view/info-block'

function onClickCopy (text) {
  return () => clipboard.writeText(text)
}

function openNodeSettings () {
  ipcRenderer.send('open-node-settings')
}

function openWebUI () {
  ipcRenderer.send('open-webui')
}

export default function Info (props) {
  const onClick = () => {
    if (props.running) {
      ipcRenderer.send('stop-daemon')
    } else {
      ipcRenderer.send('start-daemon')
    }
  }

  return (
    <Pane class={'node right-pane' + (props.running ? '' : ' translucent')}>
      <Header title='Your Node' />

      <div className='main'>
        <div className='sharing'>
          <p>{prettyBytes(props.repo.RepoSize)}</p>
          <p>Sharing {props.repo.NumObjects} objects</p>
        </div>

        <InfoBlock
          title='Peer ID'
          info={props.id}
          onClick={onClickCopy(props.id)} />

        <InfoBlock
          title='Location'
          info={props.location} />

        <InfoBlock
          title='Bandwidth Used'
          info={prettyBytes(props.bandwidth.TotalIn + props.bandwidth.TotalOut)} />

        <InfoBlock
          title='Down Speed'
          info={prettyBytes(props.bandwidth.RateIn) + '/s'} />

        <InfoBlock
          title='Up Speed'
          info={prettyBytes(props.bandwidth.RateOut) + '/s'} />

        <InfoBlock
          title='Protocol Version'
          info={props.protocolVersion} />

        <InfoBlock
          title='Addresses'
          info={props.addresses} />

        <InfoBlock
          title='Public Key'
          info={props.publicKey}
          onClick={onClickCopy(props.publicKey)} />

        <InfoBlock
          title='Node Settings'
          info='Click to edit'
          button={false}
          onClick={openNodeSettings} />

        <InfoBlock
          title='Open WebUI'
          info='Click to open'
          button={false}
          onClick={openWebUI} />
      </div>

      <Footer>
        <div className='right always-on'>
          <IconButton onClick={onClick} icon='power-off' />
        </div>
      </Footer>
    </Pane>
  )
}

Info.propTypes = {
  id: PropTypes.string,
  running: PropTypes.bool.isRequired,
  location: PropTypes.string,
  protocolVersion: PropTypes.string,
  publicKey: PropTypes.string,
  addresses: PropTypes.array,
  repo: PropTypes.object,
  bandwidth: PropTypes.object
}

Info.defaultProps = {
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
