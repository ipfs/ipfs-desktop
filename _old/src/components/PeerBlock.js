import React from 'react'
import PropTypes from 'prop-types'
import InfoBlock from './InfoBlock'

export default function PeerBlock (props) {
  return (
    <InfoBlock
      buttonMessage='Details'
      title={props.id}
      info={props.location} />
  )
}

PeerBlock.propTypes = {
  id: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired
}
