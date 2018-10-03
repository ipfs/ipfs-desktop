import React from 'react'

const CLASS = 'input-reset charcoal ba b--black-20 br1 pa2 mb2 db w-100 center focus-outline'
const STYLES_DISABLED = {
  cursor: 'not-allowed',
  background: '#eaeaea'
}

const WithLabel = ({ label, children }) => (
  <div>
    <label className='f6 b db mb2'>{label}</label>
    { children }
  </div>
)

export const TextInput = ({ label, ...props }) => (
  <WithLabel label={label}>
    <input
      {...props}
      style={props.disabled ? STYLES_DISABLED : null}
      className={CLASS}
      type='text' />
  </WithLabel>
)

export const Dropdown = ({ label, options, ...props }) => (
  <WithLabel label={label}>
    <select style={props.disabled ? STYLES_DISABLED : null} {...props} className={CLASS}>
      { Object.keys(options).map(k => <option key={k} value={options[k]}>{k}</option>) }
    </select>
  </WithLabel>
)
