import React from 'react'
import PropTypes from 'prop-types'

export default function Peer (props) {
  return (
    <div className='peer'>
      <p className='id'>{props.id}</p>
      <p className='addr'>{props.location.formatted}</p>
    </div>
  )
}

Peer.propTypes = {
  id: PropTypes.string.isRequired,
  /* addr: PropTypes.string.isRequired, */
  location: PropTypes.shape({
    formatted: PropTypes.string.isRequired
  }).isRequired
}
