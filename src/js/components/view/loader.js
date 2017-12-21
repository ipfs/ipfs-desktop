import React from 'react'

/**
 * Is a Loader.
 *
 * @return {ReactElement}
 */
export default function Loader () {
  return (
    <div className='spinner'>
      <svg width='100px' height='100px' viewBox='-26 -26 100 100' className='spinner_svg'>
        <defs />
        <g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
          <g id='Group' transform='translate(2.000000, 2.000000)' stroke='#FFFFFF'>
            <circle id='Oval-1' strokeWidth='4' cx='22.5' cy='22.5' r='22.5' />
            <circle id='Oval-2' cx='22.5' cy='22.5' r='22.5' strokeWidth='1.5' />
            <circle id='Oval-3' cx='22.5' cy='22.5' r='22.5' strokeWidth='1.5' />
            <circle id='Oval-4' cx='22.5' cy='22.5' r='22.5' strokeWidth='1.5' />
          </g>
        </g>
      </svg>
    </div>
  )
}
