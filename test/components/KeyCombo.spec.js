/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'

import Key from '../../src/components/Key'
import KeyCombo from '../../src/components/KeyCombo'

describe('<KeyCombo />', () => {
  let element
  let keys

  before(() => {
    keys = ['CTRL', 'ALT', '+']

    element = shallow(
      <KeyCombo keys={keys} />
    )
  })

  it('correct length', () => {
    expect(element.children()).to.have.length(5)
  })

  it('correct number of Keys', () => {
    expect(element.find(Key)).to.have.length(3)
  })

  it('correct text', () => {
    const text = element.find(Key).map(k => k.dive().text())
    expect(text).to.eql(keys)
  })
})
