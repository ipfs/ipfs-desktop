/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Input from '../../src/components/Input'

describe('<Input />', () => {
  it('right content', () => {
    const content = 'Hello, world!'
    const element = shallow((
      <Input>{content}</Input>
    ))

    expect(element.text()).to.eql(content)
  })

  it('custom class', () => {
    const content = 'Hello, world!'
    const className = 'class'
    const element = shallow((
      <Input className={className}>{content}</Input>
    ))

    expect(element.hasClass(className)).to.eql(true)
    expect(element.text()).to.eql(content)
  })
})
