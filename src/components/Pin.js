import React from 'react'
import PropTypes from 'prop-types'

import Icon from './Icon'
import IconButton from './IconButton'

/**
 * Is a Pinned Hash.
 *
 * @param {Object} props
 *
 * @prop {String}   tag       - The hash tag
 * @prop {String}   hash      - The hash
 * @prop {Function} onChange  - On tag change handler
 *
 * @return {ReactElement}
 */
export default function Pin (props) {
  let className = 'file flex pointer charcoal-muted items-center hover-navy transition-all ph3'
  if (props.odd) {
    className += ' bg-snow-muted'
  }

  return (
    <div className={className} onClick={props.open} >

      <Icon stroke className='w1-5 mr2' color='charcoal-muted' name='document' />
      <p className='ma0 pv2 w-50'>{props.tag || props.hash}</p>

      <div className='actions ml-auto flex o-0 transition-all'>
        <Icon className='w1-5 mr2 bg-aqua br-100' color='white' name='pencil' />
        <IconButton iconClass='w1-5 h1-5 mr2 bg-aqua br-100' icon='link' color='white' onClick={props.copy} />
        <IconButton iconClass='w1-5 h1-5 mr2 bg-red br-100' icon='pin' color='white' onClick={props.unpin} />
      </div>
    </div>
  )
}

Pin.propTypes = {
  odd: PropTypes.bool,
  open: PropTypes.func.isRequired,
  unpin: PropTypes.func.isRequired,
  copy: PropTypes.func.isRequired,
  tag: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired
}
