import React from 'react'

import Pane from '../components/view/pane'

/**
 * Is a Loader.
 *
 * @return {ReactElement}
 */
export default function Loader () {
  return (
    <Pane>
      <div className='spinner'>
        <div className='double-bounce1' />
        <div className='double-bounce2' />
      </div>
    </Pane>
  )
}
