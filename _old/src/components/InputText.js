import React from 'react'
import PropTypes from 'prop-types'

import Input from './Input'

export default function InputText (props) {
  const onChange = (event) => {
    event.preventDefault()
    props.onChange(event.target.value)
  }

  return (
    <Input className='text'>
      <input
        type='text'
        value={props.value}
        onChange={onChange}
        placeholder={props.placeholder} />
    </Input>
  )
}

InputText.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}
