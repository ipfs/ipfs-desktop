import React from 'react'
import Address from '../../components/address/Address'
import VersionLink from '../../components/version-link/VersionLink'

const Field = ({ label, children }) => (
  <div className='dt dt--fixed pt2'>
    <label className='dtc silver tracked ttu f7' style={{ width: 85 }}>{label}</label>
    <div className='dtc charcoal monospace f6 truncate'>{children}</div>
  </div>
)

export const Summary = ({ gateway, api, agentVersion, peers }) => {
  return (
    <div className='flex flex-column'>
      <Field label='Gateway'><Address value={gateway} /></Field>
      <Field label='API'><Address value={api} /></Field>
      <Field label='Version'><VersionLink agentVersion={agentVersion} /></Field>
      <Field label='Peers'>{peers}</Field>
    </div>
  )
}

export default Summary
