import React from 'react'
import { ipcRenderer } from 'electron'
import Button from '../button/Button'
import Summary from '../summary/Summary'

const Config = ({ running, summary }) => (
  <div className='pa2'>

    <div className='mt3'>
      <Button onClick={() => {}} className='f6 w-100'>Save</Button>
    </div>
  </div>
)

export default Config
