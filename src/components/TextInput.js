import React from 'react'
import PropTypes from 'prop-types'

const styles = {
  div: {
    position: 'relative'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: '1px',
    border: 'solid 1px #e7e8ee',
    padding: '0.5em .7em'
  },
  placeholder: {
    color: 'rgba(127, 132, 145, 0.6)',
    position: 'absolute',
    top: 'calc(0.5em + 1px)',
    left: 'calc(0.7em + 1px)',
    margin: '0'
  }
}

export default function InputText (props) {
  const onChange = (event) => {
    event.preventDefault()
    props.onChange(event.target.value)
  }

  return (
    <div style={styles.div}>
      <p style={styles.placeholder}>{props.placeholder}</p>
      <input
        style={styles.input}
        type='text'
        value={props.value}
        onChange={onChange} />
    </div>
  )
}

InputText.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}
