import React from 'react'
import PropTypes from 'prop-types'

export default function CheckboxBlock (props) {
  const _onClick = () => {
    props.onChange(!props.value)
  }

  return (
    <div onClick={_onClick} className='info-block checkbox'>
      <div>
        <div>
          <input type='checkbox' id={props.id} checked={props.value} />
          <span className='checkbox' />
        </div>
        <div>
          <p className='label'>{props.title}</p>
          <p className='info'>{props.info}</p>
        </div>
      </div>
    </div>
  )
}

CheckboxBlock.propTypes = {
  value: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  info: PropTypes.any
}
