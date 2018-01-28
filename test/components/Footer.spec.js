/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Footer from '../../src/components/Footer'

describe('<Footer />', () => {
  let element
  let content

  before(() => {
    content = 'Hello, world!'

    element = shallow((
      <Footer>{content}</Footer>
    ))
  })

  it('right content', () => {
    expect(element.text()).to.be.eql(content)
  })
})
