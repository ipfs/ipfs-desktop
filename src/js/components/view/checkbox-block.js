import React from 'react'
import PropTypes from 'prop-types'

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
    <div onClick={_onClick} className='info-block checkbox'>
      <div className='wrapper'>
        <div>
          <p className='label'>{props.title}</p>
          <p className='info'>{props.info}</p>
        </div>
        <div className='right'>
          <input type='checkbox' onChange={_onClick} checked={props.value} />
          <span className='checkbox' />
        </div>
      </div>
    </div>
  )
}

CheckboxBlock.propTypes = {
  value: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  info: PropTypes.any
}
