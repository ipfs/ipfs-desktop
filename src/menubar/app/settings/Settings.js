import React from 'react'
import Button from '../button/Button'

const Settings = ({ settings }) => (
  <div className='pa2'>
    <p>Launch on startup</p>

    <p>Auto add screenshots</p>

    <p>Download copied hash</p>

    <p>Edit connections</p>

    <div className='mt3'>
      <Button onClick={() => {}} className='f6 w-100'>Save</Button>
    </div>
  </div>
)

export default Settings
