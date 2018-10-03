import React from 'react'

const Field = ({ label, children }) => (
  <div className='dt dt--fixed pt2'>
    <label className='dtc silver tracked ttu f7' style={{ width: 85 }}>{label}</label>
    <div className='dtc charcoal monospace f6 truncate'>{children}</div>
  </div>
)

export const Summary = ({ gateway, api, version, peers }) => {
  return (
    <div className='pa2 flex flex-column'>
      <Field label='Gateway'>{gateway}</Field>
      <Field label='API'>{api}</Field>
      <Field label='Version'>{version}</Field>
      <Field label='Peers'>{peers}</Field>
    </div>
  )
}

export default Summary
