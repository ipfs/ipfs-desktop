/* eslint-env mocha */

import React from 'react'
import {shallow} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'

import InputText from '../../src/components/InputText'

describe('<InputText />', () => {
  let element
  let onChange

  before(() => {
    onChange = sinon.spy()

    element = shallow(
      <InputText value='' onChange={onChange} />
    )
  })

  it('change event', () => {
    const evt = {
      preventDefault: () => {},
      target: {
        value: 'Testing a value'
      }
    }

    element.dive().find('input').simulate('change', evt)
    expect(onChange.called).to.eql(true)
    expect(onChange.calledWith(evt.target.value)).to.eql(true)
  })
})
