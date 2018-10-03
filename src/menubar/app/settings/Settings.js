import React from 'react'
import Button from '../components/button/Button'
import Checkbox from '../components/checkbox/Checkbox'

const Settings = ({ settings }) => (
  <div className='pa2'>
    <Checkbox />
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
