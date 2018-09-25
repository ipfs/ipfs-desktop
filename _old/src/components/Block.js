import React from 'react'
import PropTypes from 'prop-types'

/**
 * It's a Block.
 *
 * @param {Object} props
 *
 * @prop {Any}      wrapped
 * @prop {Any}      unwrapped
 * @prop {Function} [onClick]
 *
 * @return {ReactElement}
 */
export default function Block (props) {
  let className = 'block'
  if (props.className !== '') {
    className += ' ' + props.className
  }

  if (props.onClick !== null) {
    className += ' clickable'
  }

  return (
    <div className={className} {...props.onClick !== null && { onClick: props.onClick }}>
      <div className='wrapper'>
        {props.wrapped}
      </div>
      {props.unwrapped && props.unwrapped}
    </div>
  )
}

Block.propTypes = {
  wrapped: PropTypes.any.isRequired,
  unwrapped: PropTypes.any,
  className: PropTypes.string,
  onClick: PropTypes.func
}

Block.defaultProps = {
  className: '',
  onClick: null
}
