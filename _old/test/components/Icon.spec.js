/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Icon from '../../src/components/Icon'

describe('<Icon />', () => {
  it('ipfs icon should be image', () => {
    const element = shallow(<Icon name='ipfs' />)

    expect(element.find('img')).to.have.length(1)
  })

  it('regular icon class', () => {
    const icon = 'something'
    const element = shallow(<Icon name={icon} />)

    expect(element.find(`.ti-${icon}`)).to.have.length(1)
  })

  it('regular icon color', () => {
    const icon = 'something'
    const color = 'red'
    const element = shallow(<Icon name={icon} color={color} />)

    expect(element.html()).to.have.string(`color:${color}`)
  })
})
