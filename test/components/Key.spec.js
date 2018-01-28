/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Key from '../../src/components/Key'

describe('<Key />', () => {
  let element
  let key

  before(() => {
    key = 'CTRL'

    element = shallow((
      <Key>{key}</Key>
    ))
  })

  it('text', () => {
    expect(element.text()).to.be.eql(key)
  })
})
