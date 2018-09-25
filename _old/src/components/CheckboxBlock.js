
import React from 'react'
import PropTypes from 'prop-types'

import Block from './Block'

/**
 * Is a Checkbox Block.
 *
 * @param {Object} props
 *
 * @prop {Bool} value - the current value (checked or not)
 * @prop {Any} info - the description
 * @prop {String} title - the option's title
 * @prop {Function} onChange - the on change handler
 *
 * @return {ReactElement}
 */
export default function CheckboxBlock (props) {
  const _onClick = () => {
    props.onChange(!props.value)
  }

  return (
    <Block
      onClick={_onClick}
      className='checkbox'
      wrapped={(
        <div>
          <div>
            <p className='label'>{props.title}</p>
            <p className='info'>{props.info}</p>
          </div>
          <div className='right'>
            <input type='checkbox' onChange={_onClick} checked={props.value} />
            <span className='checkbox' />
          </div>
        </div>
      )} />
  )
}

CheckboxBlock.propTypes = {
  value: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  info: PropTypes.any
}
