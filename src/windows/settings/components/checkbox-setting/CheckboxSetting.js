import React from 'react'
import Checkbox from '../../../common/components/checkbox/Checkbox'

const CheckboxSetting = ({ children, ...props }) => (
  <div className='flex mt2 align-center'>
    <Checkbox {...props} className='mr1' />
    <div>
      <span>{children}</span>
    </div>
  </div>
)

export default CheckboxSetting
