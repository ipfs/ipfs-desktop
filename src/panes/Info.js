import React from 'react'
import PropTypes from 'prop-types'
import {clipboard, ipcRenderer} from 'electron'
import prettyBytes from '../utils/pretty-bytes'

import Pane from '../components/Pane'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import IconButton from '../components/IconButton'

function openWebUI () {
  ipcRenderer.send('open-webui')
}

function copy (text) {
  return () => { clipboard.writeText(text) }
}

export default function Info (props) {
  return (
    <Pane className='info charcoal-muted flex flex-column justify-between'>
      <Header />

      <div className='bg-white flex flex-grow-1 w-100'>
        <div className='w-60 pa3'>
          <div className='flex justify-between items-center w-100'>
            <div className='w-third'>
              <p className='ma0 f6'>Space Used</p>
              <p className='ma0 f4 fw5'>{prettyBytes(props.repo.repoSize)}</p>
            </div>

            <div className='w-third'>
              <p className='ma0 f6'>Down Speed</p>
              <p className='ma0 f4 fw5'>{prettyBytes(props.bw.rateIn) + '/s'}</p>
            </div>

            <div className='w-third'>
              <p className='ma0 f6'>Up Speed</p>
              <p className='ma0 f4 fw5'>{prettyBytes(props.bw.rateOut) + '/s'}</p>
            </div>
          </div>

          <hr />

          <div className='informations mt-auto'>
            <h2 className='f3 fw5'>Your node informations</h2>

            <p><strong>Location:</strong> {props.node.location}</p>
            <p><strong>Protocol Version:</strong> {props.node.protocolVersion}</p>
            <p>
              <strong>Peer ID:</strong> <code>{props.node.id}</code>
              <IconButton className='v-mid' icon='copy' w={1} h={1} color='gray' onClick={copy(props.node.id)} />
            </p>
            <p>
              <strong>Public Key:</strong> <code>{props.node.publicKey.substr(0, 30)}</code>
              <IconButton className='v-mid' icon='copy' w={1} h={1} color='gray' onClick={copy(props.node.publicKey)} />
            </p>
          </div>
        </div>

        <div className='w-40 bg-navy-muted'>
          GRAPH
        </div>
      </div>

      <Footer>
        <Button onClick={openWebUI}>Open IPFS Control</Button>
      </Footer>
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
