import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Peer.
 *
 * @param {Object} props
 *
 * @prop {String} id
 * @prop {Object} location
 * @prop {String} location.formatted
 *
 * @return {ReactElement}
 */
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
  location: PropTypes.shape({
    formatted: PropTypes.string.isRequired
  }).isRequired
}
