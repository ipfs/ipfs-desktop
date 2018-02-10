/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import {Menu} from '../../src/components/Menu'

describe('<Menu />', () => {
  let element
  let content

  before(() => {
    content = 'Menu Content'

    element = shallow((
      <Menu>{content}</Menu>
    ))
  })

  it('right content', () => {
    expect(element.text()).to.be.eql(content)
  })
})
