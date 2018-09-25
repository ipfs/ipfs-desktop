/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import CheckboxBlock from '../../src/components/CheckboxBlock'

describe('<CheckboxBlock />', () => {
  let element
  let value
  let title
  let onChange

  before(() => {
    value = false
    title = 'My Option'
    onChange = sinon.spy()

    element = shallow((
      <CheckboxBlock value={value} title={title} onChange={onChange} />
    ))
  })

  it('click checkbox', () => {
    element.dive().find('input').simulate('change', true)

    expect(onChange.calledOnce).to.eql(true)
    expect(onChange.getCall(0).args[0]).to.eql(true)
  })
})
